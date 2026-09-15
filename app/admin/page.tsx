"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [userId, setUserId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setProfilePhoto(profile.avatar_url || "");

      const { data: orders } = await supabase
        .from("orders")
        .select("status, total_price");

      const { data: users } = await supabase
        .from("profiles")
        .select("id");

      const orderList = orders || [];

      setTotalOrders(orderList.length);

      setPendingOrders(
        orderList.filter((order) => order.status === "pending").length
      );

      setTotalRevenue(
        orderList.reduce(
          (sum, order) => sum + Number(order.total_price || 0),
          0
        )
      );

      setTotalUsers((users || []).length);

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const uploadProfilePhoto = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingPhoto(true);

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const fileName = `${userId}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(fileName);

    const photoUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: photoUrl,
      })
      .eq("id", userId);

    if (updateError) {
      alert(updateError.message);
      setUploadingPhoto(false);
      return;
    }

    setProfilePhoto(photoUrl);

    alert("Profile photo updated successfully.");

    setUploadingPhoto(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading admin dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your website and customer orders.
          </p>
        </div>


        {/* PROFILE PHOTO */}
        <section className="mt-8 rounded-2xl border bg-white p-7 shadow-sm">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Profile Photo
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                This photo will be displayed on the homepage.
              </p>
            </div>


            <div className="flex flex-col items-center gap-4 sm:flex-row">

              {/* PHOTO PREVIEW */}
              <div className="h-24 w-24 overflow-hidden rounded-2xl border bg-gray-100">

                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No Photo
                  </div>
                )}

              </div>


              {/* UPLOAD */}
              <label className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600">

                {uploadingPhoto
                  ? "Uploading..."
                  : profilePhoto
                  ? "Change Photo"
                  : "Upload Photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadProfilePhoto}
                  disabled={uploadingPhoto}
                  className="hidden"
                />

              </label>

            </div>

          </div>

        </section>


        {/* STATISTICS */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalOrders}
            </p>
          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingOrders}
            </p>
          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalUsers}
            </p>
          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-bold">
              ৳{totalRevenue}
            </p>
          </div>

        </div>


        {/* ADMIN ACTIONS */}
        <div className="mt-8 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/admin/orders")}
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-red-600"
          >
            Manage Orders
          </button>


          <button
            onClick={() => router.push("/admin/services")}
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-red-600"
          >
            Manage Services
          </button>


          <button
            onClick={() => router.push("/admin/categories")}
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-red-600"
          >
            Manage Categories
          </button>


          <button
            onClick={() => router.push("/admin/users")}
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-red-600"
          >
            Manage Users
          </button>

        </div>

      </div>

    </main>
  );
}