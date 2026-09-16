"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const paymentMethods = [
  {
    id: "bkash",
    name: "bKash",
    details: "Send Money",
    account: "YOUR_BKASH_NUMBER",
  },
  {
    id: "nagad",
    name: "Nagad",
    details: "Send Money",
    account: "YOUR_NAGAD_NUMBER",
  },
  {
    id: "rocket",
    name: "Rocket",
    details: "Send Money",
    account: "YOUR_ROCKET_NUMBER",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    details: "Bank Account",
    account: "YOUR_BANK_ACCOUNT_DETAILS",
  },
  {
    id: "skrill",
    name: "Skrill",
    details: "International",
    account: "YOUR_SKRILL_EMAIL",
  },
];

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [method, setMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
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
          id,
          user_id,
          total_price,
          status,
          packages (
            name
          )
        `)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        router.push("/orders");
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    loadOrder();
  }, [params.id, router]);

  const selectedMethod = paymentMethods.find((item) => item.id === method);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim() || !senderInfo.trim()) {
      setMessage("Please enter all payment information.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !order) {
      setMessage("Please login again.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: user.id,
      method,
      amount: order.total_price,
      transaction_id: transactionId.trim(),
      sender_number: senderInfo.trim(),
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage(
      "Payment submitted successfully. Your payment is waiting for verification."
    );

    setTransactionId("");
    setSenderInfo("");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          Loading payment details...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 font-medium text-gray-700 hover:text-red-600"
        >
          ← Back
        </button>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">
            Secure Payment
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Complete Your Payment
          </h1>

          <p className="mt-2 text-gray-500">
            Submit your payment information for verification.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Summary */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Order Summary
            </p>

            <h2 className="mt-3 text-xl font-bold text-gray-900">
              {order.packages?.name || "Package"}
            </h2>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm text-gray-500">Total Amount</p>

              <p className="mt-1 text-3xl font-bold text-red-600">
                ৳{order.total_price}
              </p>
            </div>
          </section>

          {/* Payment */}
          <section className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Choose Payment Method
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {paymentMethods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    method === item.id
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <p className="font-bold text-gray-900">{item.name}</p>

                  {item.id === "skrill" && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      International
                    </p>
                  )}
                </button>
              ))}
            </div>

            {selectedMethod && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  {selectedMethod.details}
                </p>

                <p className="mt-2 break-all text-lg font-bold text-gray-900">
                  {selectedMethod.account}
                </p>
              </div>
            )}

            <form onSubmit={handlePayment} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Sender Number / Account / Email
                </label>

                <input
                  type="text"
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  placeholder={
                    method === "skrill"
                      ? "Your Skrill email"
                      : "Your payment account"
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Transaction ID
                </label>

                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                />
              </div>

              {message && (
                <div className="rounded-xl bg-gray-100 p-4 text-sm font-medium text-gray-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Payment →"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}