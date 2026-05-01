"use client";

import AddBusModal from "@/components/admin/buses/AddBusModal";
import BusTable from "@/components/admin/buses/BusTable";
import SeatLayout from "@/components/SeatLayout";
import { Armchair, BusFront, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D5A]/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function BusPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [seatFilter, setSeatFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBus, setEditBus] = useState(null);
  const [layoutBus, setLayoutBus] = useState(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (seatFilter) params.set("seatLayout", seatFilter);

      const res = await fetch(`/api/buses?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setBuses(data.items || []);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch buses");
    } finally {
      setLoading(false);
      if (typeof initialLoadRef !== "undefined" && initialLoadRef?.current !== undefined) {
        initialLoadRef.current = true;
      }
    }
  };

  const initialLoadRef = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!initialLoadRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBuses();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, seatFilter]);

  useEffect(() => {
    fetchBuses();
  }, []);

  const stats = useMemo(() => {
    return {
      total: buses.length,
      s39: buses.filter((b) => Number(b.seatLayout) === 39).length,
      s35: buses.filter((b) => Number(b.seatLayout) === 35).length,
      s32: buses.filter((b) => Number(b.seatLayout) === 32).length,
      s21: buses.filter((b) => Number(b.seatLayout) === 21).length,
    };
  }, [buses]);

  const handleDelete = async (bus) => {
    const ok = window.confirm(`Delete bus ${bus.busNumber}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/buses/${bus._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete bus");
        return;
      }

      fetchBuses();
    } catch (error) {
      console.error(error);
      alert("Failed to delete bus");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-5 md:p-6">
      {/* Header + Stats */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0B5D5A]">
              MORYA TRAVELS DASHBOARD
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Bus Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage buses, route trips, cabins, seat layouts and fare rules.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditBus(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B5D5A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B5D5A]/20 transition hover:bg-[#094B49]"
          >
            <Plus className="h-5 w-5" />
            Add Bus
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Buses"
            value={stats.total}
            icon={<BusFront className="h-6 w-6 text-[#0B5D5A]" />}
          />
          <SummaryCard
            title="39 Seat Layout"
            value={stats.s39}
            icon={<Armchair className="h-6 w-6 text-[#0B5D5A]" />}
          />
          <SummaryCard
            title="35 Seat Layout"
            value={stats.s35}
            icon={<Armchair className="h-6 w-6 text-[#0B5D5A]" />}
          />
          <SummaryCard
            title="32 Seat Layout"
            value={stats.s32}
            icon={<Armchair className="h-6 w-6 text-[#0B5D5A]" />}
          />
          <SummaryCard
            title="21 Seat Layout"
            value={stats.s21}
            icon={<Armchair className="h-6 w-6 text-[#0B5D5A]" />}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_140px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by bus number, bus name or route..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10"
          />

          <select
            value={seatFilter}
            onChange={(e) => setSeatFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5D5A]/40 focus:ring-2 focus:ring-[#0B5D5A]/10"
          >
            <option value="">All Layouts</option>
            <option value="39">39 Seats</option>
            <option value="35">35 Seats</option>
            <option value="32">32 Seats</option>
            <option value="21">21 Seats</option>
          </select>

          <button
            type="button"
            onClick={fetchBuses}
            className="rounded-2xl bg-[#0B5D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#094B49]"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <BusTable
        buses={buses}
        loading={loading}
        onEdit={(bus) => {
          setEditBus(bus);
          setShowAddModal(true);
        }}
        onDelete={handleDelete}
        onViewLayout={(bus) => setLayoutBus(bus)}
      />

      {/* Add/Edit Modal */}
      <AddBusModal
        open={showAddModal}
        initialData={editBus}
        onClose={() => {
          setShowAddModal(false);
          setEditBus(null);
        }}
        onSaved={() => {
          setShowAddModal(false);
          setEditBus(null);
          fetchBuses();
        }}
      />

      {/* Layout Preview Modal */}
      {layoutBus && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-[32px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Seat Layout Preview</h3>
                <p className="text-sm text-slate-500">
                  {layoutBus.busNumber} • {layoutBus.busName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLayoutBus(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0B5D5A]/20 hover:bg-[#0B5D5A]/5 hover:text-[#0B5D5A]"
              >
                Close
              </button>
            </div>

            <SeatLayout
              layout={String(layoutBus.seatLayout || 39)}
              cabins={(layoutBus.cabins || []).map((c) => ({ seatNo: c.label }))}
              selectedSeats={[]}
              bookedSeats={[]}
              bookedMap={{}}
            />
          </div>
        </div>
      )}
    </div>
  );
}