"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function OrdersPage() {
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

      const { data, error } = await supabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setOrders(data || []);
      }

      setLoading(false);
    };

    loadOrders();
  }, [router]);

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
        <p className="text-gray-500">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-black px-6 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Customer Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            My Orders
          </h1>

          <p className="mt-3 text-gray-300">
            Track your projects and view your order details.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mt-3 text-gray-500">
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() => router.push("/services")}
              className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              Explore Services →
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all font-semibold text-gray-900">
                      {order.id}
                    </p>

                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                      {order.packages?.name || "Service Package"}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Price
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-900">
                      ৳{order.total_price}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Delivery
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {order.packages?.delivery_days || "-"} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Revisions
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {order.packages?.revisions || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() =>
                      router.push(`/orders/${order.id}`)
                    }
                    className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-red-600"
                  >
                    View Order Details →
                  </button>

                  <button
                    onClick={() => router.push("/services")}
                    className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-black hover:text-black"
                  >
                    Order Another Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}