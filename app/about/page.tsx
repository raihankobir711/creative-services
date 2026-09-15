"use client";
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto max-w-6xl px-8 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
          About Us
        </p>

        <h1 className="text-5xl font-bold leading-tight">
          Creative Services.
          <br />
          Digital Solutions.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          We provide professional creative, digital and AI-powered services
          to help businesses build, promote and grow their brands.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            "Creative Quality",
            "Professional Service",
            "Affordable Pricing",
          ].map((item) => (
            <div key={item} className="rounded-2xl border p-7">
              <h2 className="text-xl font-bold">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Reliable solutions focused on quality, value and results.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}