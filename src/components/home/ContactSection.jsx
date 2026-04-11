"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Playfair_Display, Dancing_Script } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
});

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // ONLY TEXT FOR NAME
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");

    setFormData((prev) => ({
      ...prev,
      name: value,
    }));

    setErrors((prev) => ({
      ...prev,
      name: "",
    }));

    setSuccessMsg("");
  };

  // ONLY NUMBERS FOR PHONE
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    setErrors((prev) => ({
      ...prev,
      phone: "",
    }));

    setSuccessMsg("");
  };

  // MESSAGE + CHECKBOX
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccessMsg("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (!formData.agree) {
      newErrors.agree = "You must agree to Terms & Privacy Policy";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMsg("");
      return;
    }

    setErrors({});
    setSuccessMsg("Redirecting to WhatsApp...");

    const whatsappNumber = "918888157744";

    const whatsappMessage = `Hello Morya Travels,%0A%0AName: ${encodeURIComponent(
      formData.name
    )}%0APhone: ${encodeURIComponent(
      formData.phone
    )}%0A%0AMessage:%0A${encodeURIComponent(formData.message)}`;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    setTimeout(() => {
      window.open(whatsappURL, "_blank");
    }, 700);

    // Optional reset after submit
    setTimeout(() => {
      setFormData({
        name: "",
        phone: "",
        message: "",
        agree: false,
      });
      setSuccessMsg("");
    }, 1500);
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    alert(
      "Terms & Conditions: By using Morya Travels, you agree to our booking rules, cancellation policies, and travel guidelines."
    );
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    alert(
      "Privacy Policy: Your personal details are safe with Morya Travels and will only be used for booking and support purposes."
    );
  };

  return (
    <section
      id="contact"
      className="relative py-20 md:py-25 lg:py-25 bg-[#f8fbfa] overflow-hidden"
    >
     
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[#f5ad1b]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[260px] h-[260px] bg-[#0E6B68]/10 rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-14"
        >
          <p className="text-[#f5ad1b] font-semibold tracking-[0.18em] uppercase text-xs sm:text-sm">
            Reach & Get In Touch
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#123b3a] leading-tight">
            <span className={playfair.className}>Contact</span>{" "}
            <span
              className={`${dancing.className} text-[#f5ad1b] text-4xl md:text-5xl lg:text-6xl xl:text-7xl inline-block`}
            >
              Morya Travels
            </span>
          </h2>

          <p className="text-[#5f6f6a] max-w-2xl mx-auto mt-4 text-sm md:text-base leading-7">
            We’d love to hear from you. Our friendly team is always here to help
            with bookings, route information, and travel support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 xl:gap-10 items-stretch">
          {/* LEFT IMAGE PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative min-h-[420px] md:min-h-[520px] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.12)]"
          >
            <Image
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
              alt="Contact Banner"
              fill
              priority
              unoptimized
              className="object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E6B68]/55 via-[#0E6B68]/15 to-transparent" />
          </motion.div>

          {/* RIGHT FORM PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-[#fff8ea] rounded-[30px] md:rounded-[36px] border border-[#f2e7c7] shadow-[0_22px_65px_rgba(0,0,0,0.08)] p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center"
          >
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-[38px] font-bold leading-tight">
                <span className="text-[#f5ad1b]">Reach</span>{" "}
                <span className="text-[#123b3a]">& Get in Touch With Us!</span>
              </h3>

              <p className="text-[#5f6f6a] mt-3 text-sm sm:text-base leading-7">
                We’d love to hear from you. Our friendly team is always here to chat
                and help you with bookings, timings, routes, and travel support.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 md:space-y-5">
              {/* NAME - ONLY TEXT */}
              <div>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter Your Name"
                  className={`w-full rounded-full border bg-white px-5 py-4 outline-none text-[#123b3a] placeholder:text-[#7d8a86] transition ${errors.name
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#e6ddc4] focus:border-[#0E6B68] focus:ring-2 focus:ring-[#0E6B68]/10"
                    }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.name}</p>
                )}
              </div>

              {/* PHONE - ONLY NUMBERS */}
              <div>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter Phone Number"
                  inputMode="numeric"
                  maxLength={10}
                  className={`w-full rounded-full border bg-white px-5 py-4 outline-none text-[#123b3a] placeholder:text-[#7d8a86] transition ${errors.phone
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#e6ddc4] focus:border-[#0E6B68] focus:ring-2 focus:ring-[#0E6B68]/10"
                    }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.phone}</p>
                )}
              </div>

              {/* MESSAGE */}
              <div>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message"
                  className={`w-full rounded-[28px] border bg-white px-5 py-4 outline-none text-[#123b3a] placeholder:text-[#7d8a86] transition resize-none ${errors.message
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#e6ddc4] focus:border-[#0E6B68] focus:ring-2 focus:ring-[#0E6B68]/10"
                    }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.message}</p>
                )}
              </div>

              {/* TERMS CHECKBOX */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-[#0E6B68]"
                  />
                  <span className="text-sm text-[#5f6f6a] leading-6">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={handleTermsClick}
                      className="text-[#0E6B68] font-semibold hover:text-[#f5ad1b] transition underline underline-offset-2"
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={handlePrivacyClick}
                      className="text-[#0E6B68] font-semibold hover:text-[#f5ad1b] transition underline underline-offset-2"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.agree && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.agree}</p>
                )}
              </div>

              {/* SUCCESS MESSAGE */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-100 text-green-700 border border-green-200 rounded-2xl px-4 py-3 text-sm font-medium"
                >
                  {successMsg}
                </motion.div>
              )}

              {/* SUBMIT BUTTON */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="bg-[#84d100] hover:bg-[#76be00] text-[#123b3a] px-7 py-3.5 rounded-full font-bold shadow-[0_10px_25px_rgba(132,209,0,0.28)] transition"
              >
                Submit
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}