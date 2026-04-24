"use client";

import AddBusModal from "@/components/admin/buses/AddBusModal";
import BusTable from "@/components/admin/buses/BusTable";
import { Bus, Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

const THEME = "#0E6B68";

export default function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedBus, setSelectedBus] = useState(null);

  const getAccessToken = () => {
    try {
      return localStorage.getItem("accessToken") || "";
    } catch {
      return "";
    }
  };

  const getRefreshToken = () => {
    try {
      return localStorage.getItem("refreshToken") || "";
    } catch {
      return "";
    }
  };

  const setAccessToken = (token) => {
    try {
      localStorage.setItem("accessToken", token);
    } catch {
      // ignore
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.accessToken) {
        return null;
      }

      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  };

  const fetchWithAutoRefresh = async (url, options = {}) => {
    let token = getAccessToken();

    const doFetch = async (accessToken) => {
      const headers = new Headers(options.headers || undefined);

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    let res = await doFetch(token);

    if (res.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        res = await doFetch(newToken);
      }
    }

    return res;
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);

      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetchWithAutoRefresh(`/api/admin/buses${query}`, {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to fetch buses");
        return;
      }

      setBuses(data?.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleAdd = () => {
    setMode("add");
    setSelectedBus(null);
    setModalOpen(true);
  };

  const handleEdit = async (bus) => {
    try {
      const res = await fetchWithAutoRefresh(`/api/admin/buses/${bus._id}`, {
        method: "GET",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to fetch bus details");
        return;
      }

      setMode("edit");
      setSelectedBus(data?.data || bus);
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch bus details");
    }
  };

  const handleView = (bus) => {
    setMode("edit");
    setSelectedBus(bus);
    setModalOpen(true);
  };

  const handleDelete = async (bus) => {
    const confirmDelete = globalThis.confirm(
      `Are you sure you want to delete ${bus.busName} (${bus.busNumber})?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetchWithAutoRefresh(`/api/admin/buses/${bus._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to delete bus");
        return;
      }

      fetchBuses();
    } catch (error) {
      console.error(error);
      alert("Failed to delete bus");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#E8F5F4" }}
                >
                  <Bus className="h-6 w-6" style={{ color: THEME }} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                    Bus Management
                  </h1>
                  <p className="text-sm text-slate-500">
                    Manage buses, routes, layouts and default fare preview
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bus..."
                  className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${THEME}33` }}
                />
              </div>

              <button
                onClick={fetchBuses}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                style={{ backgroundColor: THEME }}
              >
                <Plus className="h-4 w-4" />
                Add Bus
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <BusTable
          buses={buses}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      {/* Modal */}
      <AddBusModal
        open={modalOpen}
        mode={mode}
        bus={selectedBus}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchBuses}
      />
    </div>
  );
}