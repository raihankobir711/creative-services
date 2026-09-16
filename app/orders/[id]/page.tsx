"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);

  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [revisionMessage, setRevisionMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingRevision, setSendingRevision] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: orderData } = await supabase
      .from("orders")
      .select(`
        *,
        packages (
          name,
          price,
          delivery_days,
          revisions
        )
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
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
        profiles (
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
        profiles (
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

  const requestRevision = async () => {
    if (!revisionMessage.trim()) {
      alert("Please explain what you want to revise.");
      return;
    }

    setSendingRevision(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("revisions").insert({
      order_id: params.id,
      requested_by: user.id,
      message: revisionMessage.trim(),
      status: "requested",
    });

    if (error) {
      alert(error.message);
    } else {
      setRevisionMessage("");
      alert("Revision request submitted.");
      await loadData();
    }

    setSendingRevision(false);
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

    // Safe filename for Supabase Storage
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
        return "bg-green-50 text-green-700 border-green-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getRevisionStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";

      case "in_progress":
        return "bg-blue-50 text-blue-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We could not find this order in your account.
          </p>

          <button
            onClick={() => router.push("/orders")}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden bg-black px-6 py-10 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">

          <button
            onClick={() => router.push("/orders")}
            className="mb-7 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            ← Back to My Orders
          </button>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                  Order Workspace
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Order Details
              </h1>

              <p className="mt-3 max-w-xl break-all text-sm text-gray-400">
                Order ID: #{order.id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-5 py-2.5 text-sm font-bold capitalize ${getStatusStyle(
                order.status
              )}`}
            >
              {order.status}
            </span>

          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ================= LEFT ================= */}
          <div className="space-y-8 lg:col-span-2">

            {/* PACKAGE */}
            <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">

              <div className="border-b px-7 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                    📦
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Package Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Your selected service package
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-100 md:grid-cols-4">

                <div className="bg-white p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Package
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.name || "Package"}
                  </p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Price
                  </p>

                  <p className="mt-2 text-lg font-bold text-red-600">
                    ৳{order.total_price}
                  </p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Delivery
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.delivery_days || "-"} days
                  </p>
                </div>

                <div className="bg-white p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Revisions
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {order.packages?.revisions || "-"}
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
  <a
    href={`/orders/${order.id}/payment`}
    className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
  >
    Pay Now →
  </a>
</div>
              </div>
            </section>

            {/* REQUIREMENTS */}
            <section className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  📋
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Project Requirements
                  </h2>

                  <p className="text-sm text-gray-500">
                    Information provided for this project
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border bg-gray-50 p-5 leading-7 text-gray-700">
                {order.requirements || "No requirements added."}
              </div>

              <h3 className="mt-7 text-sm font-bold uppercase tracking-wide text-gray-900">
                Additional Notes
              </h3>

              <div className="mt-3 rounded-2xl border bg-gray-50 p-5 leading-7 text-gray-700">
                {order.notes || "No additional notes."}
              </div>

            </section>

            {/* CHAT */}
            <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">

              <div className="border-b px-7 py-6">
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                    💬
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Order Chat
                    </h2>

                    <p className="text-sm text-gray-500">
                      Communicate with our team about your project.
                    </p>
                  </div>

                </div>
              </div>

              <div className="max-h-[450px] space-y-4 overflow-y-auto p-7">

                {messages.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 px-6 py-10 text-center">
                    <div className="text-3xl">💬</div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No messages yet
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Start a conversation with our team.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {

                    const isMe = msg.sender_id === userId;

                    return (
                      <div
  key={msg.id}
  className={`flex ${
    msg.profiles?.role === "admin"
      ? "justify-start"
      : "justify-end"
  }`}
                      >

                        <div
className={`max-w-[80%] rounded-2xl px-5 py-4 ${
  msg.profiles?.role === "admin"
  ? "border border-gray-200 bg-gray-100 text-gray-900"
  : "bg-red-600 text-white"
}`}
                        >

<p
  className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${
    msg.profiles?.role === "admin"
      ? "text-gray-500"
      : "text-red-100"
  }`}
>
  {msg.profiles?.role === "admin" ? "Admin" : "Customer"}
</p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                            {msg.message}
                          </p>

                        </div>
                      </div>
                    );
                  })
                )}

              </div>

              <div className="border-t bg-gray-50 p-5">

                <div className="flex flex-col gap-3 sm:flex-row">

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Write a message..."
                    className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage}
                    className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>

                </div>
              </div>

            </section>

            {/* REVISION */}
            <section className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                    🔄
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Request Revision
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Tell us what needs to be changed.
                    </p>
                  </div>

                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                  {revisions.length} Requested
                </span>

              </div>

              <textarea
                value={revisionMessage}
                onChange={(e) =>
                  setRevisionMessage(e.target.value)
                }
                placeholder="Explain what you want to change..."
                className="mt-6 min-h-32 w-full resize-y rounded-2xl border bg-gray-50 p-5 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />

              <button
                onClick={requestRevision}
                disabled={sendingRevision}
                className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingRevision
                  ? "Submitting..."
                  : "Submit Revision Request"}
              </button>

              {revisions.length > 0 && (
                <div className="mt-7 space-y-3 border-t pt-6">

                  {revisions.map((revision) => (
                    <div
                      key={revision.id}
                      className="rounded-2xl border bg-gray-50 p-5"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-bold text-gray-900">
                          Revision Request
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getRevisionStyle(
                            revision.status
                          )}`}
                        >
                          {revision.status.replace("_", " ")}
                        </span>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {revision.message}
                      </p>

                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* FILES */}
            <section className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  📎
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Project Files
                  </h2>

                  <p className="text-sm text-gray-500">
                    Upload references, documents or project files.
                  </p>
                </div>

              </div>

              <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">

                <input
                  type="file"
                  onChange={(e) =>
                    setSelectedFile(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full cursor-pointer text-sm"
                />

                {selectedFile && (
                  <div className="mt-4 rounded-xl border bg-white p-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Selected File
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                      {selectedFile.name}
                    </p>

                  </div>
                )}

                <button
                  onClick={uploadFile}
                  disabled={uploadingFile}
                  className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingFile
                    ? "Uploading..."
                    : "Upload File"}
                </button>

              </div>

              <div className="mt-6 space-y-3">

                {files.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-500">
                      No files uploaded yet.
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-4 rounded-2xl border bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                          📄
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-gray-900">
                            {file.file_name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Uploaded by{" "}
                            {file.profiles?.full_name ||
                              (file.profiles?.role === "admin"
                                ? "Admin"
                                : "Client")}
                          </p>

                        </div>

                      </div>

                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-xl border bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 transition hover:border-black hover:bg-black hover:text-white"
                      >
                        Download
                      </a>

                    </div>
                  ))
                )}

              </div>

            </section>

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="space-y-6">

            {/* STATUS CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-black p-7 text-white shadow-lg">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-600/20 blur-2xl" />

              <div className="relative">

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    Order Status
                  </p>
                </div>

                <p className="mt-4 text-3xl font-bold capitalize">
                  {order.status}
                </p>

                <div className="mt-5 h-px bg-white/10" />

                <p className="mt-5 text-sm leading-6 text-gray-400">
                  Our team will update your order status as your project
                  progresses.
                </p>

              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <h3 className="font-bold text-gray-900">
                Order Summary
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Package
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {order.packages?.name || "Package"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Delivery
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {order.packages?.delivery_days || "-"} days
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Revisions
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {order.packages?.revisions || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t pt-4">
                  <span className="text-sm font-medium text-gray-500">
                    Total
                  </span>

                  <span className="text-lg font-bold text-red-600">
                    ৳{order.total_price}
                  </span>
                </div>

              </div>
            </div>

            {/* HELP */}
            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                🆘
              </div>

              <h3 className="mt-5 font-bold text-gray-900">
                Need Help?
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Have questions about your project? Use the order chat to
                communicate directly with our team.
              </p>

              <button
                onClick={() => {
                  document
                    .querySelector(
                      "input[placeholder='Write a message...']"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-900 transition hover:border-black hover:bg-black hover:text-white"
              >
                Contact Admin
              </button>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}