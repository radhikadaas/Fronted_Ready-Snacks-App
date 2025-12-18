
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, refreshAvatar } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  /* ---------------------------------------------
      LOAD PROFILE + AVATAR
  ---------------------------------------------- */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      setLoading(true);

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      let row = data;

      if (!row) {
        const { data: newRow } = await supabase
          .from("user_profiles")
          .insert([{ user_id: user.id }])
          .select()
          .single();
        row = newRow;
      }

      setProfile(row);

      const avatarPath = `avatar-${user.id}`;
      const { data: urlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(avatarPath);

      const finalUrl = urlData?.publicUrl
        ? `${urlData.publicUrl}?t=${Date.now()}`
        : null;

      setAvatarUrl(finalUrl);
      setLoading(false);
    }

    loadProfile();
  }, [user, navigate]);

  /* ---------------------------------------------
      FILE VALIDATION + PREVIEW
  ---------------------------------------------- */
  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed.");
      return;
    }

    const MAX_SIZE_MB = 3;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large! Max size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const selectAvatar = (e) => handleFileSelect(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  /* ---------------------------------------------
      UPLOAD AVATAR
  ---------------------------------------------- */
  async function uploadAvatar(file) {
    const path = `avatar-${user.id}`;

    const { error } = await supabase.storage
      .from("user-avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(path);

    return `${urlData.publicUrl}?t=${Date.now()}`;
  }

  /* ---------------------------------------------
      SAVE PROFILE
  ---------------------------------------------- */
  async function saveProfile() {
    setSaving(true);

    try {
      let avatar = avatarUrl;

      if (avatarFile) {
        const newUrl = await uploadAvatar(avatarFile);
        if (newUrl) {
          avatar = newUrl;
          setAvatarUrl(newUrl);
          refreshAvatar();
        }
      }

      await supabase
        .from("user_profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          alternate_phone: profile.alternate_phone,
          line1: profile.line1,
          line2: profile.line2,
          city: profile.city,
          pincode: profile.pincode,
          avatar_url: avatar,
        })
        .eq("user_id", user.id);

      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      toast.error(err.message);
    }

    setSaving(false);
  }

  if (loading)
    return <div className="text-white text-xl flex justify-center mt-20">Loading...</div>;

  /* ---------------------------------------------
      UI
  ---------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-white">
      <Toaster />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="bg-[#111827] p-6 rounded-xl border border-white/10 shadow flex flex-col items-center gap-4">

          {/* Avatar */}
          <div
            className={`w-32 h-32 rounded-full overflow-hidden bg-gray-700 shadow-lg
              ${editMode ? "ring-2 ring-indigo-500" : ""}
            `}
          >
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" />
            ) : avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-gray-400 mx-auto mt-7" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z" />
              </svg>
            )}
          </div>

          {/* NEW PREMIUM UPLOADER UI */}
          {editMode && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full border border-dashed border-gray-500 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800 transition"
            >
              <label className="cursor-pointer block">
                <span className="block text-indigo-300 font-medium mb-1">
                  Drag & Drop image here
                </span>

                <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-block mt-1 transition">
                  Or Choose File
                </div>

                <input type="file" accept="image/*" className="hidden" onChange={selectAvatar} />
              </label>

              <p className="text-gray-400 text-xs mt-2">
                JPG or PNG • Max 3MB
              </p>
            </div>
          )}

          {/* Name */}
          <h2 className="text-lg font-semibold text-indigo-300 mt-2">
            {profile.full_name || user.email}
          </h2>

          {/* Buttons */}
          {!editMode ? (
            <button
              className="w-full bg-indigo-600 py-2 rounded"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                className="w-full bg-green-600 py-2 rounded"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="w-full bg-gray-600 py-2 rounded"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-2 bg-[#0b1220] p-6 rounded-xl border border-white/10 shadow">
          <h3 className="text-xl mb-4 font-semibold text-indigo-300">
            Account Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", field: "full_name" },
              { label: "Phone Number", field: "phone" },
              { label: "Alternate Number", field: "alternate_phone" },
              { label: "Address Line 1", field: "line1" },
              { label: "Address Line 2", field: "line2" },
              { label: "City", field: "city" },
              { label: "Pincode", field: "pincode" },
            ].map((item) => (
              <div key={item.field}>
                <label className="block mb-1">{item.label}</label>
                <input
                  className="w-full p-2 rounded bg-[#071025] border border-gray-700"
                  value={profile[item.field] || ""}
                  readOnly={!editMode}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [item.field]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
