import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PickupLocationForm from "./PickupLocationForm";
import toast from "react-hot-toast";
import { HiPencil, HiTrash, HiMapPin } from "react-icons/hi2";

export default function AdminPickupLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null);

  async function loadLocations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pickup_locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    else setLocations(data || []);

    setLoading(false);
  }

  async function deleteLocation(id) {
    if (!confirm("Delete this pickup location permanently?")) return;

    const { error } = await supabase
      .from("pickup_locations")
      .delete()
      .eq("id", id);

    if (!error) {
      toast.success("Location deleted");
      loadLocations();
    }
  }

  async function toggleActive(id, is_active) {
    const { error } = await supabase
      .from("pickup_locations")
      .update({ is_active: !is_active })
      .eq("id", id);

    if (!error) {
      toast.success(is_active ? "Location disabled" : "Location enabled");
      loadLocations();
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Pickup Locations</h1>

          <button
            onClick={() => setEditingLocation({})}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
          >
            + Add Location
          </button>
        </div>

        {editingLocation !== null && (
          <PickupLocationForm
            location={editingLocation}
            onClose={() => {
              setEditingLocation(null);
              loadLocations();
            }}
          />
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className={`p-5 rounded-xl border ${
                  loc.is_active
                    ? "bg-white/10 border-white/10"
                    : "bg-gray-800/60 border-gray-700 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">{loc.title}</h3>
                    <p className="text-sm text-gray-300">{loc.address}</p>
                    <p className="text-sm mt-1">
                      📞 {loc.contact_phone}
                      {loc.alternate_phone && ` / ${loc.alternate_phone}`}
                    </p>

                    {loc.map_link && (
                      <a
                        href={loc.map_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-indigo-300 hover:text-indigo-200"
                      >
                        <HiMapPin />
                        View on Google Maps
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingLocation(loc)}
                      className="icon-btn bg-blue-600"
                    >
                      <HiPencil />
                    </button>

                    <button
                      onClick={() => deleteLocation(loc.id)}
                      className="icon-btn bg-red-600"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 text-sm">
                  <input
                    type="checkbox"
                    checked={loc.is_active}
                    onChange={() => toggleActive(loc.id, loc.is_active)}
                  />
                  Active (visible to users)
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

