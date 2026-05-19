/**
 * @fileoverview Halaman Lupa Kata Sandi (Reset Password Page).
 * Menyediakan antarmuka multi-langkah (multi-step) untuk memverifikasi alamat email
 * dan mengatur ulang kata sandi pengguna yang lupa akunnya.
 */
import logoHearthy from "../image/logo-hearthy.png";
import doctorImage from "../image/doctor-image.png";
import iconShow from "../icon/icon-show.svg";
import iconHide from "../icon/icon-hide.svg";
import { useEffect, useState } from "react";
import { checkEmail, resetPassword } from "../services/authService";

/**
 * Komponen Utama: ResetPassword
 * Mengelola dua langkah proses reset:
 * 1. Meminta dan memverifikasi keberadaan alamat email.
 * 2. Mengambil kata sandi baru dan mengonfirmasinya.
 *
 * @param {Object} props - Properti komponen.
 * @param {function} props.onNavigate - Fungsi *callback* untuk berpindah halaman.
 * @returns {JSX.Element} Antarmuka pengguna Halaman Reset Kata Sandi.
 */
export default function ResetPassword({ onNavigate }) {
  // Step 1 = verifikasi email, Step 2 = isi password baru
  const [step, setStep] = useState(1);

  // Step 1 state
  const [email, setEmail] = useState("");

  // Step 2 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Shared state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - Web Hearthy";
  }, []);

  // ── Step 1: Verifikasi email ──────────────────────────────────
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await checkEmail(email);
      // Email terdaftar → lanjut ke step 2
      setStep(2);
    } catch (err) {
      setError(err.message); // "Email tidak terdaftar."
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Reset password ────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      // Sukses → tampilkan notifikasi lalu redirect ke login
      setSuccess(true);
      setTimeout(() => {
        onNavigate?.("login");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Panel kiri */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#e8ecef] flex-col relative overflow-hidden">
        <div className="p-10 absolute top-0 left-0">
          <img
            src={logoHearthy}
            alt="Hearthy logo"
            className="h-10 cursor-pointer"
            onClick={() => onNavigate?.("home")}
          />
        </div>
        <div className="flex-1 flex items-end justify-center">
          <img
            src={doctorImage}
            alt="Doctor illustration"
            className="h-[90vh] w-auto object-contain"
          />
        </div>
      </div>

      {/* Panel kanan */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src={logoHearthy}
              alt="Hearthy logo"
              className="h-10 cursor-pointer"
              onClick={() => onNavigate?.("home")}
            />
          </div>

          {/* Indikator step */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Atur Ulang Kata Sandi
          </h2>
          <p className="text-gray-500 mb-8">
            {step === 1
              ? "Masukkan email Anda untuk verifikasi akun"
              : `Buat password baru untuk ${email}`}
          </p>

          {/* Notifikasi Sukses */}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 animate-pulse">
              <span>✅</span>
              <span>Password berhasil direset! Mengarahkan ke halaman login...</span>
            </div>
          )}

          {/* Pesan Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 1: Form verifikasi email ── */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleCheckEmail}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="Masukkan email terdaftar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={loading}
                />
              </div>
              <button
                id="reset-verify-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi Email"
                )}
              </button>
            </form>
          )}

          {/* ── Step 2: Form reset password ── */}
          {step === 2 && !success && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center p-2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <img src={showPassword ? iconShow : iconHide} alt="" className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Konfirmasi password baru Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center p-2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                  >
                    <img src={showConfirmPassword ? iconShow : iconHide} alt="" className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition hover:bg-gray-50"
                >
                  ← Kembali
                </button>
                <button
                  id="reset-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-2 flex-grow-[2] bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
              className="text-blue-600 font-bold"
            >
              Kembali ke halaman login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
