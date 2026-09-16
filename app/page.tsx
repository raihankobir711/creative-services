"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(
  "https://qgrhmsoobopqdunlhrau.supabase.co/storage/v1/object/public/profile-photos/7d8e1914-19b9-4569-8ccb-f019829ef317/1789491327270-WhatsApp_Image_2026-09-15_at_10.54.09_PM.jpeg"
);

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
    };

    loadServices();
  }, []);
  useEffect(() => {
  const loadProfilePhoto = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (data?.avatar_url) {
      setProfilePhoto(data.avatar_url);
    }
  };

  loadProfilePhoto();
}, []);

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-gray-900">

      {/* ================= NAVBAR ================= */}
      <nav className="border-t-4 border-red-600 bg-black px-8 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <h1 className="text-2xl font-bold tracking-tight">
            Creative Services
          </h1>

          <div className="flex items-center gap-3">

            {/* MENU */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="px-3 text-2xl font-bold text-white transition hover:text-red-500"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-gray-700 bg-black shadow-2xl">

                  <a
                    href="/"
                    className="block px-5 py-3 text-sm text-white transition hover:bg-red-600"
                  >
                    01. Home
                  </a>

                  <a
                    href="/services"
                    className="block px-5 py-3 text-sm text-white transition hover:bg-red-600"
                  >
                    02. Services
                  </a>

                  <a
                    href="/about"
                    className="block px-5 py-3 text-sm text-white transition hover:bg-red-600"
                  >
                    03. About
                  </a>

                  <a
                    href="/contact"
                    className="block px-5 py-3 text-sm text-white transition hover:bg-red-600"
                  >
                    04. Contact
                  </a>

                </div>
              )}
            </div>

            {/* LOGIN */}
            <a
              href="/login"
              className="rounded-lg border border-gray-600 px-5 py-2 text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-500"
            >
              Login
            </a>

            {/* SIGN UP */}
            <a
              href="/signup"
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Sign Up
            </a>

          </div>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="bg-[#f5f5f5] px-6 py-16 md:px-10 lg:px-16">

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          {/* ================= LEFT SIDE ================= */}
          <div>

            <h2 className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight text-gray-950 md:text-6xl lg:text-7xl">

              Creative Services.
              <br />

              Digital Solutions.
              <br />

              AI-Powered Results.

            </h2>


            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-600">
              Everything you need to build, promote and grow your brand
              all in one place.
            </p>


            {/* BUTTONS */}
            <div className="mt-9 flex flex-wrap items-center gap-4">

              <a
                href="/services"
                className="rounded-xl bg-red-600 px-7 py-4 font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-lg"
              >
                Explore Services
              </a>

              <a
                href="/signup"
                className="rounded-xl border border-gray-900 bg-white px-7 py-4 font-semibold text-gray-900 transition hover:bg-black hover:text-white"
              >
                Get Started
              </a>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}
<div className="flex w-full max-w-[520px] flex-col items-end lg:justify-self-end">
  {/* PHOTO */}
  <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-white p-3 shadow-xl">
    <div className="h-[520px] w-full overflow-hidden rounded-2xl bg-gray-100">
      <img
        src={profilePhoto}
        alt="Creative Services"
        className="h-full w-full object-cover"
      />
    </div>
  </div>

  {/* HIRE ME */}
  <a
    href="/contact"
    className="mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-black text-lg font-bold text-white shadow-lg transition hover:bg-red-600 "
  >
    Hire Me →
  </a>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section className="bg-white px-8 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            </p>

            <h3 className="mt-3 text-4xl font-bold text-gray-950">
              Our Services
            </h3>

            <p className="mt-3 max-w-2xl text-gray-600">
              Professional digital services for your business, brand and
              online growth.
            </p>

          </div>


          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (

              <div
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f8f8] transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
              >

                <img
                  src={service.image_url || "/hero-bg.png"}
                  alt={service.title}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="p-7">

                  <h4 className="text-xl font-bold text-gray-950">
                    {service.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {service.description}
                  </p>

                  <p className="mt-5 font-bold text-gray-950">
                    Starting from{" "}
                    <span className="text-red-600">
                      ৳{service.price}
                    </span>
                  </p>

                  <a
                    href={`/services/${service.slug}`}
                    className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-red-600"
                  >
                    View Service →
                  </a>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= WHY CHOOSE US ================= */}
      <section className="bg-[#f5f5f5] px-8 py-20">

        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
          </p>

          <h3 className="mt-3 text-4xl font-bold text-gray-950">
            Why Choose Us?
          </h3>


          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              "Creative Quality",
              "Fast Delivery",
              "Affordable Pricing",
              "Multiple Services",
            ].map((item) => (

              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
              >

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-xl font-bold text-white">
                  ✓
                </div>

                <h4 className="font-bold text-gray-950">
                  {item}
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Reliable service focused on quality, creativity and
                  professional results.
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-black px-8 py-20 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Let's Work Together
          </p>

          <h3 className="mt-4 text-4xl font-bold md:text-5xl">
            Ready to Start Your Project?
          </h3>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
            Choose a service and let us help bring your idea to life.
          </p>

          <a
            href="/services"
            className="mt-8 inline-block rounded-xl bg-red-600 px-7 py-4 font-semibold text-white transition hover:bg-red-700"
          >
            Explore Services →
          </a>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-200 bg-white px-8 py-8 text-center text-sm text-gray-500">
        © 2026 Creative Services. All rights reserved.
      </footer>

    </main>
  );
}