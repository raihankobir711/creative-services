"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone
        ),
        packages:package_id (
          name,
          price,
          delivery_days,
          revisions,
          services:service_id (
            title
          )
        )
      `)
      .eq("id", params.id)
      .single();

    if (!orderData) {
      setLoading(false);
      return;
    }

    setOrder(orderData);

    const { data: messageData } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:sender_id (
          full_name,
          role
        )
      `)
      .eq("order_id", params.id)
      .order("created_at", { ascending: true });

    setMessages(messageData || []);

    const { data: fileData } = await supabase
      .from("order_files")
      .select(`
        *,
        profiles:uploader_id (
          full_name,
          role
        )
      `)
      .eq("order_id", params.id)
      .order("created_at", { ascending: false });

    setFiles(fileData || []);

    const { data: revisionData } = await supabase
      .from("revisions")
      .select("*")
      .eq("order_id", params.id)
      .order("created_at", { ascending: false });

    setRevisions(revisionData || []);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
      return;
    }

    setOrder((current: any) => ({
      ...current,
      status: newStatus,
    }));
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSendingMessage(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("messages").insert({
      order_id: params.id,
      sender_id: user.id,
      message: message.trim(),
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage("");
      await loadData();
    }

    setSendingMessage(false);
  };

  const updateRevision = async (
    revisionId: string,
    status: string
  ) => {
    const { error } = await supabase
      .from("revisions")
      .update({ status })
      .eq("id", revisionId);

    if (error) {
      alert(error.message);
      return;
    }

    setRevisions((current) =>
      current.map((revision) =>
        revision.id === revisionId
          ? { ...revision, status }
          : revision
      )
    );
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    setUploadingFile(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const safeFileName = selectedFile.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const fileName = `${params.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("order-files")
      .upload(fileName, selectedFile);

    if (uploadError) {
      alert(uploadError.message);
      setUploadingFile(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("order-files")
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from("order_files")
      .insert({
        order_id: params.id,
        uploader_id: user.id,
        file_name: selectedFile.name,
        file_url: publicUrlData.publicUrl,
      });

    if (dbError) {
      alert(dbError.message);
    } else {
      setSelectedFile(null);
      alert("File uploaded successfully.");
      await loadData();
    }

    setUploadingFile(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getRevisionStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700";

      case "in_progress":
        return "bg-blue-50 text-blue-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6] px-6">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The requested order could not be found.
          </p>

          <button
            onClick={() => router.push("/admin/orders")}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            ← Back to Orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6]">
      {/* TOP HEADER */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/admin/orders")}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <span>←</span>
            Back to Admin Orders
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-red-600" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                  Admin Order Workspace
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Order Details
              </h1>

              <p className="mt-3 max-w-xl break-all text-sm text-gray-400">
                #{order.id}
              </p>
            </div>

            <div
              className={`w-fit rounded-full border px-5 py-2.5 text-sm font-bold capitalize ${getStatusStyle(
                order.status
              )}`}
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
              {order.status}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">

          {/* MAIN CONTENT */}
          <div className="space-y-7 lg:col-span-2">

            {/* CUSTOMER */}
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-6 sm:px-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lg text-white">
                    👤
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Customer Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Customer details for this order
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {order.profiles?.full_name || "Customer"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Phone
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {order.profiles?.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Order Date
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            {/* PACKAGE */}
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-6 sm:px-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-lg text-white">
                    📦
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Package Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Selected service and package details
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-7">
                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Service
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.services?.title || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Package
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.name || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                    Total Price
                  </p>

                  <p className="mt-2 text-2xl font-black text-red-600">
                    ৳{order.total_price}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Delivery
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.delivery_days || "-"} days
                  </p>
                </div>
              </div>
            </section>

            {/* REQUIREMENTS */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lg text-white">
                  📝
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Project Requirements
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customer submitted project information
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gray-50 p-5 leading-7 text-gray-700">
                {order.requirements || "No requirements added."}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Additional Notes
                </h3>

                <div className="mt-3 rounded-2xl bg-gray-50 p-5 leading-7 text-gray-700">
                  {order.notes || "No additional notes."}
                </div>
              </div>
            </section>

            {/* CHAT */}
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-black px-6 py-6 text-white sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600">
                      💬
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Customer Chat
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        Communicate directly with the customer
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300">
                    {messages.length} messages
                  </div>
                </div>
              </div>

              <div className="max-h-[480px] space-y-5 overflow-y-auto bg-[#fafafa] p-5 sm:p-7">
                {messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                      💬
                    </div>

                    <p className="mt-4 text-sm font-medium text-gray-500">
                      No messages yet.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin =
                      msg.profiles?.role === "admin";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isAdmin
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] ${
                            isAdmin ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`mb-1 flex items-center gap-2 text-xs font-semibold ${
                              isAdmin
                                ? "justify-end text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            <span>
                              {msg.profiles?.full_name ||
                                (isAdmin
                                  ? "Admin"
                                  : "Customer")}
                            </span>

                            {isAdmin && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                ADMIN
                              </span>
                            )}
                          </div>

                          <div
                            className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                              isAdmin
                                ? "rounded-tr-md bg-black text-white"
                                : "rounded-tl-md border border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-100 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Write a message to customer..."
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={
                      sendingMessage || !message.trim()
                    }
                    className="rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sendingMessage ? "Sending..." : "Send →"}
                  </button>
                </div>
              </div>
            </section>

            {/* REVISIONS */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lg">
                    🔄
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Revision Requests
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Manage customer revision requests
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                  {revisions.length}
                </span>
              </div>

              {revisions.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No revision requests yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {revisions.map((revision) => (
                    <div
                      key={revision.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                            🔄
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              Revision Request
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              {revision.message}
                            </p>

                            <p className="mt-3 text-xs text-gray-400">
                              {new Date(
                                revision.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <select
                          value={revision.status}
                          onChange={(e) =>
                            updateRevision(
                              revision.id,
                              e.target.value
                            )
                          }
                          className={`rounded-xl border-0 px-4 py-2.5 text-sm font-bold outline-none ${getRevisionStyle(
                            revision.status
                          )}`}
                        >
                          <option value="requested">
                            Requested
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="rejected">
                            Rejected
                          </option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FILES */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lg text-white">
                  📎
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Project Files
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Upload or access customer project files
                  </p>
                </div>
              </div>

              {/* UPLOAD */}
              <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition hover:border-red-300">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    📤
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-900">
                    Upload project file
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Select a file from your computer
                  </p>
                </div>

                <input
                  type="file"
                  onChange={(e) =>
                    setSelectedFile(
                      e.target.files?.[0] || null
                    )
                  }
                  className="mt-5 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-sm"
                />

                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xl">
                        📄
                      </span>

                      <p className="truncate text-sm font-semibold text-gray-700">
                        {selectedFile.name}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-3 text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  onClick={uploadFile}
                  disabled={uploadingFile}
                  className="mt-4 w-full rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploadingFile
                    ? "Uploading..."
                    : "Upload File →"}
                </button>
              </div>

              {/* FILE LIST */}
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Uploaded Files
                  </h3>

                  <span className="text-xs font-semibold text-gray-400">
                    {files.length} files
                  </span>
                </div>

                {files.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 p-8 text-center">
                    <p className="text-sm text-gray-500">
                      No files uploaded yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                            📄
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {file.file_name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Uploaded by{" "}
                              {file.profiles?.full_name ||
                                (file.profiles?.role ===
                                "admin"
                                  ? "Admin"
                                  : "Customer")}
                            </p>
                          </div>
                        </div>

                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-bold text-gray-800 transition hover:border-black hover:bg-black hover:text-white"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* STATUS CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-black p-7 text-white shadow-xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-600/30 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Order Status
                    </p>

                    <p className="text-xs text-gray-400">
                      Update current progress
                    </p>
                  </div>
                </div>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(e.target.value)
                  }
                  className="mt-6 w-full rounded-xl border-0 bg-white px-4 py-3.5 text-sm font-bold text-black outline-none ring-0"
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  📊
                </div>

                <h3 className="font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Customer
                  </span>

                  <span className="text-right text-sm font-bold text-gray-900">
                    {order.profiles?.full_name ||
                      "Customer"}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Service
                  </span>

                  <span className="text-right text-sm font-bold text-gray-900">
                    {order.packages?.services?.title ||
                      "N/A"}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Package
                  </span>

                  <span className="text-right text-sm font-bold text-gray-900">
                    {order.packages?.name || "N/A"}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Price
                  </span>

                  <span className="text-right text-lg font-black text-red-600">
                    ৳{order.total_price}
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK INFO */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
              <h3 className="font-bold text-gray-900">
                Quick Information
              </h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Revisions Allowed
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {order.packages?.revisions || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Delivery Time
                  </p>

                  <p className="mt-1 text-lg font-black text-gray-900">
                    {order.packages?.delivery_days || "-"}{" "}
                    <span className="text-sm font-medium text-gray-500">
                      days
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Current Status
                  </p>

                  <p className="mt-1 text-lg font-black capitalize text-gray-900">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            {/* BACK BUTTON */}
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-black hover:bg-black hover:text-white"
            >
              ← Back to All Orders
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}