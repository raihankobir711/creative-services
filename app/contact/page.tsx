export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] px-6 py-16">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Let’s Start Your Project.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Have a project in mind? Choose a service and get in touch with us.
            We’re ready to help bring your idea to life.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* EMAIL */}
          <div className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-xl text-white">
              ✉
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Email
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Contact us by email for project inquiries and business discussions.
            </p>

            <a
              href="mailto:your@email.com"
              className="mt-5 inline-block font-semibold text-red-600 hover:text-red-700"
            >
              Send Email →
            </a>
          </div>

          {/* WHATSAPP */}
          <div className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-xl text-white">
              ☎
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              WhatsApp
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Chat with us directly for quick support
              and project discussions.
            </p>

            <a
              href="https://wa.me/8801749151451"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block font-semibold text-red-600 hover:text-red-700"
            >
              Chat on WhatsApp →
            </a>
          </div>

          {/* SERVICES */}
          <div className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-xl text-white">
              ✦
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Services
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Graphic Design, Video Editing, Digital Marketing, Website Design and AI Services.
            </p>

            <a
              href="/services"
              className="mt-5 inline-block font-semibold text-red-600 hover:text-red-700"
            >
              Explore Services →
            </a>
          </div>

          {/* GET STARTED */}
          <div className="group rounded-3xl bg-black p-7 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-xl text-white">
              →
            </div>

            <h2 className="mt-6 text-xl font-bold">
              Get Started
            </h2>

            <p className="mt-3 leading-7 text-gray-300">
              Choose your service and place an order to start your project.
            </p>

            <a
              href="/services"
              className="mt-5 inline-block font-semibold text-red-500 hover:text-red-400"
            >
              Start Your Project →
            </a>
          </div>

        </div>

        {/* BOTTOM CTA */}
        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm md:p-10">
          <h2 className="text-2xl font-bold text-gray-950">
            Ready to bring your idea to life?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Choose a service and let’s get started with your project.
          </p>

          <a
            href="/services"
            className="mt-6 inline-flex rounded-xl bg-red-600 px-7 py-3.5 font-bold text-white transition hover:bg-black"
          >
            Explore Services →
          </a>
        </div>

      </div>
    </main>
  );
}