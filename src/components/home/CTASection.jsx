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