"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
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

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    loadOrders();
  }, [router]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert(error.message);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900">
          Admin Orders
        </h1>

        <p className="text-gray-500 mt-2">
          Manage customer orders.
        </p>

        {orders.length === 0 ? (
          <div className="mt-8 bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >

                <div className="flex flex-col md:flex-row md:justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold">
                      {order.profiles?.full_name || "Customer"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Phone: {order.profiles?.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Order Date
                    </p>

                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">
                      Service
                    </p>

                    <p className="font-semibold mt-1">
                      {order.packages?.services?.title || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">
                      Package
                    </p>

                    <p className="font-semibold mt-1">
                      {order.packages?.name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-xl font-bold mt-1">
                      ৳{order.total_price}
                    </p>
                  </div>

                </div>

                <div className="mt-6">
                  <p className="font-semibold">
                    Status
                  </p>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className="mt-2 border rounded-lg px-4 py-2"
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

                <div className="mt-6">
                  <p className="font-semibold">
                    Project Requirements
                  </p>

                  <div className="mt-2 bg-gray-50 rounded-xl p-4 text-gray-700">
                    {order.requirements || "No requirements"}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-semibold">
                    Additional Notes
                  </p>

                  <div className="mt-2 bg-gray-50 rounded-xl p-4 text-gray-700">
                    {order.notes || "No notes"}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-5 break-all">
                  Order ID: {order.id}
                </p>
                <div className="mt-5 flex justify-end">
  <button
    onClick={() => router.push(`/admin/orders/${order.id}`)}
    className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
  >
    View Order Details →
  </button>
</div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}