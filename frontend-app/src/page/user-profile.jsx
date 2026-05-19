import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";
import iconUser from "../icon/icon-user.svg";
import iconEdit from "../icon/icon-edit.svg";
import { fetchProfile, updateProfile } from "../services/userService";

export default function UserProfilePage({ currentPage, onNavigate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [errorMsg, setErrorMsg]               = useState("");
  const [successMsg, setSuccessMsg]           = useState("");

  // Data yang ditampilkan (dari API)
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [formData, setFormData] = useState({ phone: "", address: "" });
  // Salinan sementara untuk modal edit
  const [editData, setEditData] = useState({ phone: "", address: "" });

  useEffect(() => {
    document.title = "Profil Saya - Hearthy";
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const { user, profile } = await fetchProfile();
        if (cancelled) return;
        setUserData({ name: user.name, email: user.email });
        setFormData({
          phone:   profile?.phone   ?? "",
          address: profile?.address ?? "",
        });
      } catch (_err) {
        if (!cancelled) setErrorMsg("Gagal memuat profil. Silakan coba lagi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const openEdit = () => {
    setEditData({ phone: formData.phone, address: formData.address });
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      const updated = await updateProfile({
        phone:   editData.phone.trim()   || null,
        address: editData.address.trim() || null,
      });
      setFormData({
        phone:   updated.phone   ?? "",
        address: updated.address ?? "",
      });
      setSuccessMsg("Profil berhasil diperbarui.");
      setIsEditModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <div
        className={`relative z-10 transition-all duration-200 ${isEditModalOpen ? "blur-lg pointer-events-none" : ""}`}
      >
        <Navbar
          currentPage={currentPage ?? "profile"}
          onNavigate={onNavigate ?? (() => {})}
          username={userData.name}
        />
      </div>

      <main
        className={`mx-auto max-w-screen-2xl px-6 pb-16 transition-all duration-200 ${isEditModalOpen ? "blur-sm pointer-events-none" : ""}`}
      >
        <div className="mx-auto max-w-3xl text-center pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5a] sm:text-4xl">
            Profil Saya
          </h1>
        </div>

        {/* Toast sukses */}
        {successMsg && (
          <div className="mx-auto mt-4 max-w-3xl rounded-2xl bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-700 flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="ml-4 font-bold text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        <section className="mt-6 space-y-8">
          {/* Card avatar + nama */}
          <article className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
            {loading ? (
              <div className="flex items-center gap-6 animate-pulse">
                <div className="h-28 w-28 rounded-full bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-5 w-48 rounded-full bg-slate-200" />
                  <div className="h-4 w-64 rounded-full bg-slate-200" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-slate-950 bg-[#f8fafc] shrink-0">
                    <img src={iconUser} alt="Avatar" className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                  <div className="w-full overflow-hidden">
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#1e3a5a] truncate">
                      {userData.name}
                    </h2>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base font-medium text-slate-600 truncate">
                      {userData.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEdit}
                  className="w-full lg:w-auto inline-flex justify-center items-center gap-2 rounded-2xl bg-[#1e3a5a] px-4 py-3 sm:py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173652] cursor-pointer"
                >
                  <img src={iconEdit} alt="Edit profil" className="h-4 w-4" />
                  Edit
                </button>
              </div>
            )}
          </article>

          {/* Card data pribadi */}
          <article className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold text-[#1e3a5a]">Data Pribadi</h2>

            {loading ? (
              <div className="mt-8 space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {/* Username (read-only) */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Username
                  </label>
                  <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                    {userData.name}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Email
                  </label>
                  <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                    {userData.email}
                  </div>
                </div>

                {/* Telepon */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Telepon
                  </label>
                  <div className={`rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm ${formData.phone ? "text-slate-900" : "text-slate-400 italic"}`}>
                    {formData.phone || "Belum diisi"}
                  </div>
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Alamat
                  </label>
                  <div className={`min-h-[96px] rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm whitespace-pre-wrap ${formData.address ? "text-slate-900" : "text-slate-400 italic"}`}>
                    {formData.address || "Belum diisi"}
                  </div>
                </div>
              </div>
            )}
          </article>
        </section>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 z-40" onClick={() => !saving && setIsEditModalOpen(false)} />
          <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-5 sm:p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12),_inset_0_1px_0_0_rgba(255,255,255,0.5)] ring-1 ring-slate-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1e3a5a] mb-4">
              Edit Data Pribadi
            </h2>

            {/* Error dalam modal */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            {/* Username & Email — read-only dalam modal */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-slate-500">
                  Username <span className="text-xs text-slate-400">(tidak dapat diubah)</span>
                </label>
                <div className="w-full rounded-2xl bg-[#f3f4f6] px-4 py-2.5 text-sm text-slate-500 truncate">
                  {userData.name}
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-slate-500">
                  Email <span className="text-xs text-slate-400">(tidak dapat diubah)</span>
                </label>
                <div className="w-full rounded-2xl bg-[#f3f4f6] px-4 py-2.5 text-sm text-slate-500 truncate">
                  {userData.email}
                </div>
              </div>

              {/* Telepon — editable */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-500">
                  Telepon
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  placeholder="Contoh: +6281234567890"
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>

              {/* Alamat — editable */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-500">
                  Alamat
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  rows={3}
                  value={editData.address}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap Anda"
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
                className="rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="justify-center rounded-2xl bg-[#1e3a5a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173652] disabled:opacity-60 flex items-center gap-2"
              >
                {saving && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
}
