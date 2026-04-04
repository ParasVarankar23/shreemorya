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