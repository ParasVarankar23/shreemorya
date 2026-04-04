"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FaMapMarkerAlt,
  FaPlaneDeparture,
  FaCalendarAlt,
  FaUserFriends,
  FaArrowRight,
  FaPhoneAlt,
  FaStar,
  FaQuoteLeft,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaBars,
  FaTimes,
  FaBus,
  FaCheckCircle,
  FaWhatsapp,
} from "react-icons/fa";
import {
  MdTravelExplore,
  MdOutlinePayments,
  MdSupportAgent,
} from "react-icons/md";
import { GiPalmTree, GiCommercialAirplane } from "react-icons/gi";

const easySteps = [
  {
    id: "01",
    title: "Choose Pickup & Destination",
    desc: "Select pickup point, destination and preferred bus or tour package in seconds.",
    icon: <MdTravelExplore className="text-2xl" />,
  },
  {
    id: "02",
    title: "Secure Your Booking",
    desc: "Fast, secure and trusted booking with easy payment options for every traveler.",
    icon: <MdOutlinePayments className="text-2xl" />,
  },
  {
    id: "03",
    title: "Enjoy Comfortable Travel",
    desc: "Travel safely with premium buses, smooth planning and 24/7 support from Morya.",
    icon: <MdSupportAgent className="text-2xl" />,
  },
];

const packages = [
  {
    title: "Basic Tour Package",
    price: "₹8,999",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    features: ["Bus Travel", "Hotel Stay", "Breakfast", "Pickup / Drop"],
  },
  {
    title: "Standard Family Package",
    price: "₹14,999",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    features: ["AC Bus", "Premium Hotel", "Meals Included", "Sightseeing"],
  },
  {
    title: "Luxury Premium Package",
    price: "₹24,999",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    features: ["Luxury Bus", "Luxury Stay", "Full Meals", "Tour Guide"],
  },
];

const blogs = [
  {
    title: "Top Hill Stations To Visit This Year",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Best Family Tour Packages In India",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Travel Smart With Morya Tours",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Page() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const bookingRef = useRef(null);
  const rightVisualRef = useRef(null);
  const busCardRef = useRef(null);
  const ladyCardRef = useRef(null);
  const discountRef = useRef(null);
  const heroTiltRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(heroTitleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.9,
    })
      .from(
        heroTextRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.7,
        },
        "-=0.45"
      )
      .from(
        heroButtonsRef.current,
        {
          y: 18,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.35"
      )
      .from(
        bookingRef.current,
        {
          y: 25,
          opacity: 0,
          scale: 0.97,
          duration: 0.7,
        },
        "-=0.25"
      )
      .from(
        rightVisualRef.current,
        {
          x: 50,
          opacity: 0,
          duration: 0.9,
        },
        "-=0.55"
      )
      .from(
        ladyCardRef.current,
        {
          y: 25,
          opacity: 0,
          rotate: -6,
          duration: 0.6,
        },
        "-=0.45"
      )
      .from(
        busCardRef.current,
        {
          x: -20,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.35"
      )
      .from(
        discountRef.current,
        {
          scale: 0.8,
          opacity: 0,
          duration: 0.45,
        },
        "-=0.35"
      );

    gsap.to(busCardRef.current, {
      y: -10,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(discountRef.current, {
      y: -7,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(ladyCardRef.current, {
      y: -10,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleHeroMouseMove = (e) => {
    const card = heroTiltRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = -((y / rect.height) - 0.5) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1200,
      transformOrigin: "center",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const resetHeroTilt = () => {
    const card = heroTiltRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-[#123b3a] overflow-x-hidden">
      {/* FLOATING CONTACT BUTTONS */}
      <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-3">
        <a
          href="https://wa.me/919309940782"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
        >
          <FaWhatsapp className="text-xl md:text-2xl" />
        </a>
        <a
          href="tel:+919309940782"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f4b32c] text-[#123b3a] flex items-center justify-center shadow-2xl hover:scale-110 transition"
        >
          <FaPhoneAlt />
        </a>
      </div>

      {/* FIXED NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
            ? "bg-[#0d5b5a]/95 shadow-2xl border-b border-white/10 backdrop-blur-xl"
            : "bg-[#0d5b5a]/88 backdrop-blur-md border-b border-white/5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 md:h-[78px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#f4b32c] flex items-center justify-center shadow-lg shrink-0">
                <GiPalmTree className="text-white text-lg md:text-xl" />
              </div>
              <div>
                <h1 className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wide leading-tight">
                  Morya Tours & Travels
                </h1>
                <p className="text-white/70 text-[10px] sm:text-[11px] md:text-xs">
                  Premium Bus & Tour Booking
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-7 text-white/90 text-sm font-medium">
              <a href="#home" className="hover:text-[#f4b32c] transition">Home</a>
              <a href="#packages" className="hover:text-[#f4b32c] transition">Packages</a>
              <a href="#testimonial" className="hover:text-[#f4b32c] transition">Testimonials</a>
              <a href="#contact" className="hover:text-[#f4b32c] transition">Contact</a>
              <a href="#blogs" className="hover:text-[#f4b32c] transition">Blogs</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+919309940782"
                className="hidden xl:flex items-center gap-2 text-white/90 text-sm"
              >
                <FaPhoneAlt className="text-[#f4b32c]" />
                +91 93099 40782
              </a>
              <button className="bg-[#f4b32c] text-[#123b3a] px-4 md:px-5 py-2.5 rounded-full font-semibold hover:scale-105 transition shadow-lg">
                Book Now
              </button>
            </div>

            <button
              className="lg:hidden text-white text-xl"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {mobileMenu && (
            <div className="lg:hidden pb-4">
              <div className="bg-white rounded-3xl p-4 space-y-3 shadow-2xl">
                <a href="#home" className="block text-[#123b3a] font-medium">Home</a>
                <a href="#packages" className="block text-[#123b3a] font-medium">Packages</a>
                <a href="#testimonial" className="block text-[#123b3a] font-medium">Testimonials</a>
                <a href="#contact" className="block text-[#123b3a] font-medium">Contact</a>
                <a href="#blogs" className="block text-[#123b3a] font-medium">Blogs</a>
                <button className="w-full bg-[#f4b32c] text-[#123b3a] py-3 rounded-full font-semibold mt-2">
                  Book Now
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#0d5b5a] pt-[90px] md:pt-[110px] pb-10 md:pb-14"
      >
        {/* MAIN BG IMAGE */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=80"
            alt="Nature background"
            fill
            priority
            unoptimized
            className="object-cover opacity-38"
          />
        </div>

        {/* SECOND BG IMAGE */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80"
            alt="Mountain background"
            fill
            unoptimized
            className="object-cover opacity-18 mix-blend-screen"
          />
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d5b5a]/78 via-[#0d5b5a]/58 to-[#0d5b5a]/28" />

        {/* DECOR */}
        <div className="absolute top-16 left-8 w-32 h-32 rounded-full bg-[#f4b32c]/10 blur-3xl" />
        <div className="absolute bottom-8 right-8 w-44 h-44 rounded-full bg-white/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 0.15, y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-28 right-[18%] text-white text-5xl md:text-7xl z-10 hidden md:block"
        >
          <GiCommercialAirplane />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 items-center min-h-[calc(88vh-78px)] lg:min-h-[calc(92vh-78px)]">
            {/* LEFT CONTENT */}
            <div className="relative z-20">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7ed321]" />
                <p className="text-[#f4b32c] text-sm sm:text-base font-semibold tracking-wide">
                  Discover Your Journey
                </p>
              </div>

              <div ref={heroTitleRef}>
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-[0.95] drop-shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                  Explore The World
                </h2>
              </div>

              <p
                ref={heroTextRef}
                className="text-white/90 mt-4 max-w-xl text-sm sm:text-base md:text-lg leading-7 md:leading-8"
              >
                Premium bus booking, custom tour packages, family trips, group tours,
                and comfortable travel planning with Morya Tours & Travels. Safe rides,
                best routes, and unforgettable experiences.
              </p>

              <div ref={heroButtonsRef} className="mt-5 flex flex-wrap gap-3">
                <button className="bg-[#7ed321] text-[#123b3a] px-5 md:px-6 py-3 rounded-full font-semibold hover:scale-105 transition shadow-xl">
                  Explore Tours
                </button>
                <button className="border border-white/20 bg-white/10 backdrop-blur-xl text-white px-5 md:px-6 py-3 rounded-full font-semibold hover:bg-white/15 transition">
                  View Bus Routes
                </button>
              </div>

              {/* BOOKING FORM */}
              <div
                ref={bookingRef}
                className="mt-6 md:mt-7 bg-white/95 backdrop-blur-2xl rounded-[24px] md:rounded-[30px] shadow-2xl p-3 md:p-4 max-w-4xl border border-white/50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="bg-[#f7faf9] rounded-2xl px-4 py-3">
                    <label className="text-xs text-gray-500 block mb-1">Pickup</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                      <FaMapMarkerAlt className="text-[#0d5b5a]" />
                      <span>Select Pickup</span>
                    </div>
                  </div>

                  <div className="bg-[#f7faf9] rounded-2xl px-4 py-3">
                    <label className="text-xs text-gray-500 block mb-1">Destination</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                      <FaPlaneDeparture className="text-[#0d5b5a]" />
                      <span>Select Destination</span>
                    </div>
                  </div>

                  <div className="bg-[#f7faf9] rounded-2xl px-4 py-3">
                    <label className="text-xs text-gray-500 block mb-1">Travel Date</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                      <FaCalendarAlt className="text-[#0d5b5a]" />
                      <span>Choose Date</span>
                    </div>
                  </div>

                  <div className="bg-[#f7faf9] rounded-2xl px-4 py-3">
                    <label className="text-xs text-gray-500 block mb-1">Passengers</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#123b3a]">
                      <FaUserFriends className="text-[#0d5b5a]" />
                      <span>1-4 Person</span>
                    </div>
                  </div>

                  <button className="bg-[#f4b32c] hover:bg-[#e7a91f] text-[#123b3a] rounded-2xl px-4 py-3 font-semibold flex items-center justify-center gap-2 transition shadow-md min-h-[56px]">
                    Search
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PREMIUM VISUAL */}
            <div
              ref={rightVisualRef}
              className="relative flex justify-center lg:justify-end mt-4 lg:mt-0 perspective-[1200px]"
            >
              <div
                ref={heroTiltRef}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={resetHeroTilt}
                className="relative w-full max-w-[600px] h-[360px] sm:h-[470px] md:h-[560px] transition-transform duration-300"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* MAIN IMAGE */}
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.4 }}
                  className="absolute right-0 top-0 w-[86%] h-[84%] rounded-[34px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.28)] border border-white/20"
                  style={{
                    clipPath:
                      "polygon(10% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)",
                    transform: "translateZ(0px)",
                  }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80"
                    alt="Travel city view"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d5b5a]/10 via-transparent to-transparent" />
                </motion.div>

                {/* CURVE BORDER FRAME */}
                <div
                  className="absolute right-7 bottom-6 w-[52%] h-[44%] rounded-[26px] border-[4px] border-white/75 z-20 pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 14%)",
                    transform: "translateZ(40px)",
                  }}
                />

                {/* LADY IMAGE - MORE VISIBLE */}
                <div
                  ref={ladyCardRef}
                  className="absolute bottom-8 right-5 w-[145px] sm:w-[190px] md:w-[220px] h-[195px] sm:h-[250px] md:h-[290px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-4 border-white/80 z-30 rotate-[-4deg]"
                  style={{ transform: "translateZ(95px)" }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80"
                    alt="Lady traveler"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* BUS IMAGE - MOVED UP SO VISIBLE */}
                <div
                  ref={busCardRef}
                  className="absolute bottom-6 left-0 w-[160px] sm:w-[210px] md:w-[250px] h-[110px] sm:h-[135px] md:h-[155px] rounded-[22px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-4 border-white/80 z-30"
                  style={{ transform: "translateZ(110px)" }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80"
                    alt="Luxury bus travel"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* DISCOUNT BADGE - FIXED INSIDE */}
                <div
                  ref={discountRef}
                  className="absolute top-5 right-3 sm:right-5 bg-[#f4b32c] text-white w-[100px] sm:w-[125px] h-[90px] sm:h-[110px] rounded-[28px] shadow-2xl z-40 rotate-[-6deg] flex flex-col items-center justify-center"
                  style={{ transform: "translateZ(140px)" }}
                >
                  <p className="text-2xl sm:text-4xl font-bold leading-none">60%</p>
                  <p className="text-[11px] sm:text-sm font-medium mt-1">Discount</p>
                </div>

                {/* TOP BUS CARD - MORE VISIBLE */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 left-0 sm:left-2 bg-white rounded-3xl p-3 sm:p-4 shadow-2xl w-[190px] sm:w-[230px] z-30"
                  style={{ transform: "translateZ(120px)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0d5b5a] text-white flex items-center justify-center">
                      <FaBus />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs text-gray-500">Premium Bus</p>
                      <h4 className="font-bold text-sm sm:text-base">Masur → Pune</h4>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[#0d5b5a] font-bold">₹499</span>
                    <button className="text-[11px] bg-[#7ed321] text-[#123b3a] px-3 py-1.5 rounded-full font-semibold">
                      Book Seat
                    </button>
                  </div>
                </motion.div>

                <div className="absolute inset-0 bg-white/10 rounded-[50px] blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CURVE */}
        <div className="relative -mt-2">
          <svg viewBox="0 0 1440 140" className="w-full h-16 md:h-24 fill-[#f8fbfa]">
            <path d="M0,96L80,90.7C160,85,320,75,480,58.7C640,43,800,21,960,26.7C1120,32,1280,64,1360,80L1440,96L1440,140L1360,140C1280,140,1120,140,960,140C800,140,640,140,480,140C320,140,160,140,80,140L0,140Z"></path>
          </svg>
        </div>
      </section>

      {/* EASY STEPS */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#f4b32c] font-semibold">Easy Steps For Booking</p>
            <h3 className="text-3xl md:text-4xl font-bold mt-2">Book Your Journey Easily</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {easySteps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-[28px] p-6 shadow-xl border border-[#e8efee] hover:-translate-y-1 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0d5b5a] text-white flex items-center justify-center mb-4 shadow-lg">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-[#f4b32c]">{step.id}</span>
                <h4 className="text-xl font-bold mt-2">{step.title}</h4>
                <p className="text-gray-600 text-sm mt-3 leading-6">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="py-20 bg-[#edf7f6] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-12 fill-[#f8fbfa]">
            <path d="M0,32L80,42.7C160,53,320,75,480,80C640,85,800,75,960,58.7C1120,43,1280,21,1360,10.7L1440,0L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-12">
            <p className="text-[#f4b32c] font-semibold">Price For Travel The World</p>
            <h3 className="text-3xl md:text-4xl font-bold mt-2">Best Travel Packages</h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white"
              >
                <div className="relative h-56">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xl md:text-2xl font-bold">{pkg.title}</h4>
                    <span className="text-[#0d5b5a] font-bold whitespace-nowrap">{pkg.price}</span>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-600">
                        <FaCheckCircle className="text-[#7ed321]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="mt-6 w-full bg-[#7ed321] text-[#123b3a] py-3 rounded-full font-semibold hover:scale-[1.02] transition">
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section id="testimonial" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#f4b32c] font-semibold">Our Client Says</p>
            <h3 className="text-3xl md:text-4xl font-bold mt-2">Testimonial</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-[#f8faf9] rounded-[36px] p-6 md:p-10 shadow-2xl grid lg:grid-cols-2 gap-10 items-center"
          >
            <div className="relative h-[320px] rounded-[28px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80"
                alt="Testimonial"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div>
              <FaQuoteLeft className="text-4xl text-[#f4b32c]" />
              <p className="text-gray-700 mt-4 leading-8 text-lg">
                Morya Tours gave us an amazing experience. The booking process was
                simple, the travel was comfortable, and the service was excellent.
              </p>

              <div className="mt-6">
                <h4 className="font-bold text-xl">Happy Traveler</h4>
                <p className="text-gray-500">Verified Customer</p>
              </div>

              <div className="flex gap-1 mt-4 text-[#f4b32c]">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
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

      {/* BLOGS */}
      <section id="blogs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-[#f4b32c] font-semibold">Explore Latest News</p>
              <h3 className="text-3xl md:text-4xl font-bold text-[#123b3a] mt-2">
                Travel Stories & Blogs
              </h3>
            </div>
            <button className="bg-[#f4b32c] text-[#123b3a] px-5 py-2.5 rounded-full font-semibold w-fit">
              View All
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                viewport={{ once: true }}
                className="rounded-[28px] overflow-hidden border border-[#e8efee] shadow-xl bg-white"
              >
                <div className="relative h-56">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h4 className="text-xl font-semibold leading-8 text-[#123b3a]">
                    {blog.title}
                  </h4>
                  <button className="mt-4 text-[#f4b32c] font-semibold">
                    Read More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b4c4b] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#f4b32c] flex items-center justify-center">
                  <GiPalmTree className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Morya Tours</h4>
                  <p className="text-white/70 text-sm">Travel With Comfort</p>
                </div>
              </div>
              <p className="text-white/70 mt-4 text-sm leading-7">
                Premium bus booking, tour packages, and reliable transport for memorable journeys.
              </p>

              <div className="flex gap-3 mt-5">
                {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#f4b32c] hover:text-[#123b3a] flex items-center justify-center transition cursor-pointer"
                  >
                    <Icon />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Destinations</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li>Goa Tour</li>
                <li>Kashmir Package</li>
                <li>Manali Tour</li>
                <li>Kerala Package</li>
                <li>Rajasthan Trip</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li>About Us</li>
                <li>Tour Packages</li>
                <li>Bus Booking</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li>Masur / Satara, Maharashtra</li>
                <li>+91 93099 40782</li>
                <li>moryatours@gmail.com</li>
                <li>Mon - Sun: 24/7 Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
            <p>© 2026 Morya Tours & Travels. All Rights Reserved.</p>
            <p>Designed for Premium Travel Experience</p>
          </div>
        </div>
      </footer>
    </main>
  );
}