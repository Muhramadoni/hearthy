import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import iconUser from "../icon/icon-user.svg";
import iconEdit from "../icon/icon-edit.svg";

export default function UserProfilePage({ currentPage, onNavigate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Muhammad",
    lastName: "Ramadoni",
    email: "MuhRama123@gmail.com",
    phone: "+62882123987",
    address: "Jl. Teratai Gg. Hj. Dona Rt/Rw 01/02 kota Tangerang",
  });

  useEffect(() => {
    document.title = "Profil Saya - Hearthy";
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Save data to backend
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <div
        className={`relative z-10 transition-all duration-200 ${isEditModalOpen ? "blur-lg pointer-events-none" : ""}`}
      >
        <Navbar
          currentPage={currentPage ?? "profile"}
          onNavigate={onNavigate ?? (() => {})}
          username="Ramadoni"
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

        <section className="mt-10 space-y-8">
          <article className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-950 bg-[#f8fafc]">
                  <img
                    src={iconUser}
                    alt="Avatar placeholder"
                    className="h-16 w-16"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1e3a5a]">
                    Muhammad Ramadoni
                  </h2>
                  <p className="mt-2 text-base font-medium text-slate-600">
                    Mahasiswa
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Jl. Teratatai</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1e3a5a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173652] cursor-pointer"
              >
                <img src={iconEdit} alt="Edit profile" className="h-4 w-4" />
                Edit
              </button>
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold text-[#1e3a5a]">
              Data Pribadi
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Nama Depan
                </label>
                <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                  Muhammad
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Nama Belakang
                </label>
                <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                  Ramadoni
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Email
                </label>
                <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                  MuhRama123@gmail.com
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Telepon
                </label>
                <div className="rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900">
                  +62882123987
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Alamat
                </label>
                <textarea
                  readOnly
                  rows={4}
                  className="w-full rounded-2xl bg-[#f3f4f6] px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  value="Jl. Teratai Gg. Hj. Dona Rt/Rw 01/02 kota Tangerang"
                />
              </div>
            </div>
          </article>
        </section>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 z-40"></div>
          <div className="relative z-50 w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12),_inset_0_1px_0_0_rgba(255,255,255,0.5)] ring-1 ring-slate-200 my-8">
            <h2 className="text-2xl font-semibold text-[#1e3a5a] mb-6">
              Edit Data Pribadi
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Nama Depan
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-500">
                  Alamat
                </label>
                <textarea
                  rows={4}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a] focus:ring-opacity-20"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end sm:flex-row">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-[#1e3a5a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173652]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
