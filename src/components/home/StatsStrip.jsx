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