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