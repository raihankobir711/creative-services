"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: orderData } = await supabase
        .from("orders")
        .select(`
          *,
          packages (
            name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(orderData || []);
      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "processing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Creative Services
            </h1>
            <p className="text-xs text-gray-500">
              Client Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <section className="rounded-3xl bg-black px-8 py-10 text-white shadow-lg md:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Welcome Back
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            {profile?.full_name || "User"}
          </h2>

          <p className="mt-3 max-w-xl text-gray-300">
            Manage your orders, profile and creative projects from your
            dashboard.
          </p>

          <button
            onClick={() => router.push("/services")}
            className="mt-7 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Start a New Project →
          </button>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              All your orders
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Waiting to start
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Processing
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {processingOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Currently working
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {completedOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Finished projects
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-gray-900">
              Quick Actions
            </h3>

            <p className="mt-1 text-gray-500">
              Manage your account and projects.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <button
              onClick={() => router.push("/orders")}
              className="group rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">
                  My Orders
                </h4>

                <span className="text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                View and track all your orders.
              </p>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="group rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">
                  My Profile
                </h4>

                <span className="text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Manage your personal information.
              </p>
            </button>

            <button
              onClick={() => router.push("/services")}
              className="group rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">
                  Explore Services
                </h4>

                <span className="text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Find the right service for your project.
              </p>
            </button>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Recent Orders
              </h3>

              <p className="mt-1 text-gray-500">
                Your latest projects.
              </p>
            </div>

            {orders.length > 0 && (
              <button
                onClick={() => router.push("/orders")}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                View All →
              </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="mt-5 rounded-2xl border bg-white p-10 text-center shadow-sm">
              <h4 className="text-xl font-bold text-gray-900">
                No Orders Yet
              </h4>

              <p className="mt-2 text-gray-500">
                Start your first project with us.
              </p>

              <button
                onClick={() => router.push("/services")}
                className="mt-5 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Explore Services →
              </button>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="divide-y">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {order.packages?.name || "Service Package"}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Order ID: {order.id.slice(0, 8)}...
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        ৳{order.total_price}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <button
                        onClick={() =>
                          router.push(`/orders/${order.id}`)
                        }
                        className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Account Info */}
        <section className="mt-10 rounded-2xl border bg-white p-7 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">
            Account Information
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile?.phone || "Not added"}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}