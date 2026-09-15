"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
export default function ServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .in("slug", [
          "graphic-design",
          "video-editing",
          "digital-marketing",
          "website-design",
          "ai-services",
          "ai-video",
        ]);

      setServices(data || []);
      setLoading(false);
    };

    loadServices();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Our Services
        </h1>

        <p className="text-gray-500 mt-2">
          Choose the service you need.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((service) => (
<div
  key={service.id}
  className="bg-white border rounded-xl p-6 hover:shadow-md transition cursor-pointer"
onClick={() => router.push(`/services/${service.slug}`)}
            >
              <img
  src={service.image_url || "/hero-bg.png"}
  alt={service.title}
  className="mb-4 h-48 w-full rounded-lg object-cover"
/>
              <h2 className="text-lg font-semibold text-gray-900">
                {service.title}
              </h2>

              <p className="text-gray-500 mt-2">
                Explore this service
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}