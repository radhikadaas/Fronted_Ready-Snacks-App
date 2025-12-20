import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { HiMapPin } from "react-icons/hi2";

export default function PickupLocationForm({ location, onClose }) {
  const isEditing = Boolean(location?.id);

  const [form, setForm] = useState({
    title: location?.title || "",
    address: location?.address || "",
    contact_phone: location?.contact_phone || "",
    alternate_phone: location?.alternate_phone || "",
    map_link: location?.map_link || "",
    is_active: location?.is_active ?? true,
  });

  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();

    if (!form.title || !form.address || !form.contact_phone || !form.map_link) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    const res = isEditing
      ? await supabase
          .from("pickup_locations")
          .update(form)
          .eq("id", location.id)
      : await supabase.from("pickup_locations").insert(form);

    setSaving(false);

    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success(isEditing ? "Location updated" : "Location added");
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl p-8 border border-white/10">

        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Pickup Location" : "Add Pickup Location"}
        </h2>

        <form onSubmit={save} className="space-y-4">

          <Input label="Building Name *">
            <input
              className="input"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Input>

          <Input label="Address *">
            <textarea
              className="input resize-none"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Input>

          <Input label="Contact Phone *">
            <input
              className="input"
              value={form.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
          </Input>

          <Input label="Alternate Phone">
            <input
              className="input"
              value={form.alternate_phone}
              onChange={(e) => update("alternate_phone", e.target.value)}
            />
          </Input>

          <Input label="Google Maps Link *">
            <input
              className="input"
              value={form.map_link}
              onChange={(e) => update("map_link", e.target.value)}
            />
          </Input>

          {form.map_link && (
            <a
              href={form.map_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition"
            >
              <HiMapPin className="text-lg" />
              View on Google Maps
            </a>
          )}

          <label className="flex items-center gap-2 pt-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
            />
            Active (visible to users)
          </label>

          <div className="flex gap-3 pt-6">
            <button
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Input({ label, children }) {
  return (
    <div>
      <label className="block mb-1 font-semibold text-sm">{label}</label>
      {children}
    </div>
  );
}

