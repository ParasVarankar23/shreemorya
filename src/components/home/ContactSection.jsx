"use client";

import Image from "next/image";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-[#fffaf2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[#f4b32c]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[240px] h-[240px] bg-[#0d5b5a]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div
            className="relative h-[420px] rounded-[38px] overflow-hidden shadow-2xl"
            style={{
              clipPath:
                "polygon(0% 8%, 8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%)",
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
              alt="Contact Banner"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0d5b5a]/25" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-[#f4b32c] font-semibold">Adventure Awaits</p>
              <h3 className="text-3xl md:text-4xl font-bold mt-2">
                Whatever You Want <br /> We Plan It For You
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-[36px] shadow-2xl p-6 md:p-8">
            <p className="text-[#f4b32c] font-semibold">Book & Get In Touch With Us</p>
            <h3 className="text-3xl font-bold mt-2">Contact Us</h3>

            <form className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0d5b5a]"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0d5b5a]"
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0d5b5a]"
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#0d5b5a]"
              />
              <button
                type="submit"
                className="w-full bg-[#7ed321] text-[#123b3a] py-3 rounded-full font-semibold hover:scale-[1.02] transition"
              >
                Submit Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}