"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();

  const [pkg, setPkg] = useState<any>(null);
  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("id", params.id)
        .single();

      setPkg(data);
      setLoading(false);
    };

    loadPackage();
  }, [params.id]);

  const handleOrder = async () => {
    if (!requirements.trim()) {
      alert("Please enter your project requirements.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      package_id: pkg.id,
      total_price: pkg.price,
      requirements,
      notes,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Order submitted successfully!");
    router.push("/orders");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Package not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Place Your Order
          </h1>

          <div className="mt-6 border rounded-xl p-5">
            <h2 className="text-xl font-bold">{pkg.name}</h2>

            <p className="text-2xl font-bold mt-3">
              ৳{pkg.price}
            </p>

            <p className="text-gray-500 mt-2">
              Delivery: {pkg.delivery_days} days
            </p>

            <p className="text-gray-500">
              Revisions: {pkg.revisions}
            </p>
          </div>

          <div className="mt-8">
            <label className="font-semibold text-gray-900">
              Project Requirements
            </label>

            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Tell us what you need..."
              className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mt-6">
            <label className="font-semibold text-gray-900">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              className="mt-2 w-full border rounded-xl p-4 min-h-24 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={handleOrder}
            disabled={submitting}
            className="mt-8 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </div>
    </main>
  );
}