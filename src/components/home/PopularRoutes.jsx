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