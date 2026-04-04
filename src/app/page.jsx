"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaFacebookF,
  FaHeadset,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaStar,
  FaUsers,
  FaWhatsapp,
} from "react-icons/fa";

// ============================================================
// MORYA TRAVELS - FULL HOME PAGE (SECTION WISE)
// Next.js + Tailwind CSS + Framer Motion + React Icons
// File suggestion: app/page.jsx
// ============================================================

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Routes", href: "#routes" },
  { name: "Why Us", href: "#why-us" },
  { name: "Services", href: "#services" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const popularRoutes = [
  {
    title: "Mumbai to Borivali",
    price: "₹499",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Pune to Mumbai",
    price: "₹699",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Satara to Panvel",
    price: "₹899",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
  },
];

const features = [
  {
    icon: FaClock,
    title: "On-Time Pickup",
    desc: "Reliable schedule and timely departure for every route.",
  },
  {
    icon: FaShieldAlt,
    title: "Safe Journey",
    desc: "Verified drivers, trusted service and secure travel experience.",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    desc: "Quick support for bookings, route help and travel assistance.",
  },
  {
    icon: FaUsers,
    title: "Comfort Seating",
    desc: "Comfortable seating for daily, weekly and seasonal passengers.",
  },
];

const services = [
  "Daily Route Booking",
  "Seasonal Seat Reservations",
  "Group Travel Support",
  "Festival / Event Booking",
  "Pickup & Drop Assistance",
  "Customer WhatsApp Updates",
];

const testimonials = [
  {
    name: "Rahul Patil",
    text: "Very smooth booking and always on time. Morya Travels is best for regular travel.",
  },
  {
    name: "Sneha Jadhav",
    text: "Clean bus, easy seat booking and fast support on WhatsApp. Highly recommended.",
  },
  {
    name: "Amit More",
    text: "I use it every month for family travel. Good service and trusted team.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function SectionTitle({ badge, title, subtitle }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className="mb-3 inline-flex rounded-full bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-700">
        {badge}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base text-slate-600 md:text-lg">{subtitle}</p>
    </motion.div>
  );
}

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="#home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
            <FaBus className="text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white md:text-xl">Morya Travels</h1>
            <p className="text-xs text-slate-300">Safe • Fast • Trusted</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-200 transition hover:text-teal-400"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://wa.me/919309940782"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
          >
            Contact Us
          </Link>
          <Link
            href="#booking"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600"
          >
            Book Now <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-slate-950 text-white py-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_25%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <span className="mb-4 inline-flex w-fit rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-300">
            Trusted Travel Partner For Daily Routes
          </span>

          <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Book Your Journey With <span className="text-teal-400">Morya Travels</span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Fast booking, comfortable travel, and trusted pickup & drop service for your regular and seasonal routes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#booking"
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 font-semibold text-white shadow-xl shadow-teal-500/25 transition hover:bg-teal-600"
            >
              Start Booking <FaChevronRight className="text-xs" />
            </Link>
            <Link
              href="#routes"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View Routes
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
            <div className="relative h-[520px] overflow-hidden rounded-[1.5rem]">
              <Image
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop"
                alt="Morya Travels Hero"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* HERO BOOKING BAR */}
      <div id="booking" className="relative z-10 mx-auto mb-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-4 rounded-[2rem] border border-white/10 bg-white p-4 shadow-2xl md:grid-cols-4 md:p-5"
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaMapMarkerAlt className="text-teal-600" /> Select Pickup
            </label>
            <select className="w-full bg-transparent text-sm text-slate-700 outline-none">
              <option>Choose Pickup</option>
              <option>Satara</option>
              <option>Pune</option>
              <option>Panvel</option>
              <option>Borivali</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaMapMarkerAlt className="text-sky-600" /> Select Drop
            </label>
            <select className="w-full bg-transparent text-sm text-slate-700 outline-none">
              <option>Choose Drop</option>
              <option>Mumbai</option>
              <option>Panvel</option>
              <option>Pune</option>
              <option>Satara</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaCalendarAlt className="text-orange-500" /> Travel Date
            </label>
            <input type="date" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
          </div>

          <button className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-900">
            Search Bus
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = useMemo(
    () => [
      { value: "48+", label: "Popular Routes" },
      { value: "6000+", label: "Monthly Bookings" },
      { value: "24/7", label: "Customer Support" },
      { value: "4.9", label: "Average Rating" },
    ],
    []
  );

  return (
    <section className="bg-white pt-24">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {stats.map((item) => (
          <motion.div
            key={item.label}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <h3 className="text-3xl font-black text-slate-900">{item.value}</h3>
            <p className="mt-2 text-sm font-medium text-slate-600">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Why Choose Morya Travels"
          title="Simple Booking. Safe Travel. Better Experience."
          subtitle="Built for daily passengers, families, and seasonal travel bookings with comfort and trust."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-600">
                  <Icon />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function PopularRoutes() {
  return (
    <section id="routes" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Popular Routes"
          title="Top Routes For Daily & Seasonal Travel"
          subtitle="You can later connect this section with your backend and MongoDB to show dynamic routes and pricing."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {popularRoutes.map((route, index) => (
            <motion.div
              key={route.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-64">
                <Image src={route.image} alt={route.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{route.title}</h3>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">
                    {route.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Comfortable travel option with reliable pickup and smooth route management.
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
                  Book This Route <FaArrowRight className="text-xs" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_35%)]" />
          <div className="relative">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-teal-300">
              Our Services
            </p>
            <h3 className="text-3xl font-bold md:text-4xl">Travel Services Built For Real Passengers</h3>
            <p className="mt-5 text-slate-300 leading-8">
              Morya Travels is perfect for your daily seat booking, village pickup points, seasonal rush bookings, and group travel.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {services.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-6"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <FaWhatsapp className="text-xl" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">WhatsApp Booking Support</h4>
                <p className="text-sm text-slate-600">Quick ticket updates and customer communication.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <FaBus className="text-xl" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Smart Route Management</h4>
                <p className="text-sm text-slate-600">Best for your route-based booking system project.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <FaStar className="text-xl" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Premium User Experience</h4>
                <p className="text-sm text-slate-600">Clean layout, animations and mobile-friendly booking flow.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section id="testimonials" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Testimonials"
          title="What Our Customers Say"
          subtitle="Real feedback from passengers who trust Morya Travels for regular and family travel."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="mb-5 flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p className="text-sm leading-8 text-slate-600">“{item.text}”</p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                <p className="text-sm text-slate-500">Regular Passenger</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2.5rem] bg-slate-950 p-8 text-white md:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-teal-300">
                Ready To Travel?
              </p>
              <h3 className="text-3xl font-black md:text-5xl">Book Your Seat With Morya Travels Today</h3>
              <p className="mt-5 max-w-2xl text-slate-300 leading-8">
                Start with pickup, drop and date selection — simple, fast and easy booking flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link
                href="#booking"
                className="rounded-2xl bg-teal-500 px-6 py-3 font-semibold text-white transition hover:bg-teal-600"
              >
                Book Now
              </Link>
              <Link
                href="https://wa.me/919309940782"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                WhatsApp Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Contact Us"
          title="Reach & Get In Touch With Us"
          subtitle="You can connect this section later with your real contact form or backend API."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-900">+91 93099 40782</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="text-sm text-slate-500">WhatsApp</p>
                  <p className="font-semibold text-slate-900">Quick Booking Support</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Service Area</p>
                  <p className="font-semibold text-slate-900">Satara • Pune • Panvel • Mumbai</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="grid gap-5">
              <input
                type="text"
                placeholder="Your Name"
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-teal-500"
              />
              <textarea
                rows={5}
                placeholder="Your Message"
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-teal-500"
              />
              <button
                type="button"
                className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-900"
              >
                Send Inquiry
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-white">
              <FaBus />
            </div>
            <div>
              <h3 className="text-xl font-bold">Morya Travels</h3>
              <p className="text-sm text-slate-400">Safe • Fast • Trusted</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-400">
            Premium and clean travel booking UI for your long-term Morya Travels project.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold">Quick Links</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            {navLinks.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold">Support</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>Booking Help</li>
            <li>Route Inquiry</li>
            <li>Seat Availability</li>
            <li>Customer Support</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold">Follow Us</h4>
          <div className="flex gap-3">
            {[FaFacebookF, FaInstagram, FaWhatsapp].map((Icon, index) => (
              <button
                key={index}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-sm text-slate-400">
        © 2026 Morya Travels. All rights reserved.
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className="overflow-x-hidden bg-white">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <WhyChooseUs />
      <PopularRoutes />
      <ServicesSection />
      <TestimonialSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </main>
  );
}
