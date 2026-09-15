"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("slug", params.slug)
        .single();

      setService(serviceData);

      if (serviceData) {
        const { data: packageData } = await supabase
          .from("packages")
          .select("*")
          .eq("service_id", serviceData.id)
          .order("price", { ascending: true });

        setPackages(packageData || []);
      }

      setLoading(false);
    };

    loadService();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading service...</p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Service Not Found
          </h1>

          <button
            onClick={() => router.push("/services")}
            className="mt-5 rounded-lg bg-black px-5 py-3 text-white hover:bg-red-600"
          >
            Back to Services
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Service Hero */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-500">
                Creative Digital Service
              </p>

              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                {service.title}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                {service.description}
              </p>

              <div className="mt-7">
                <span className="text-sm text-gray-400">
                  Starting from
                </span>

                <p className="text-3xl font-bold text-white">
                  ৳{service.price}
                </p>
              </div>
            </div>

            <div>
              <img
                src={service.image_url || "/hero-bg.png"}
                alt={service.title}
                className="h-[320px] w-full rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
            Pricing Plans
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Choose Your Package
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Select the package that best fits your project requirements.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl ${
                pkg.is_popular
                  ? "border-red-500 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute right-5 top-5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Popular
                </div>
              )}

              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {index === 0
                  ? "Basic"
                  : index === 1
                  ? "Standard"
                  : "Premium"}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {pkg.name}
              </h3>

              <p className="mt-5 text-4xl font-bold text-gray-900">
                ৳{pkg.price}
              </p>

              <p className="mt-4 min-h-[48px] text-sm leading-6 text-gray-600">
                {pkg.description}
              </p>

              <div className="mt-6 border-t pt-6">
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">🚀</span>
                    Delivery: {pkg.delivery_days} days
                  </p>

                  <p className="flex items-center gap-2">
                    <span className="font-semibold">🔄</span>
                    Revisions: {pkg.revisions}
                  </p>

                  {pkg.features && (
                    <div>
                      <p className="mb-2 font-semibold text-gray-900">
                        Features:
                      </p>

                      <p className="leading-6 text-gray-600">
                        {pkg.features}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => router.push(`/order/${pkg.id}`)}
                className="mt-7 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Order Now →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-black px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">
          Ready to Start Your Project?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-gray-300">
          Choose a package above and place your order today.
        </p>

        <button
          onClick={() => router.push("/services")}
          className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-red-600 hover:text-white"
        >
          Explore Other Services
        </button>
      </section>
    </main>
  );
}