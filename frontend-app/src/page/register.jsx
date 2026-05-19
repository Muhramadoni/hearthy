/**
 * @fileoverview Halaman Pendaftaran (Register Page).
 * Menyediakan antarmuka bagi pengguna baru untuk membuat akun Hearthy
 * dengan mengisi nama (username), alamat email, dan kata sandi.
 */
import logoHearthy from "../image/logo-hearthy.png";
import doctorImage from "../image/doctor-image.png";
import iconShow from "../icon/icon-show.svg";
import iconHide from "../icon/icon-hide.svg";
import { useEffect, useState } from "react";
import { register } from "../services/authService";

/**
 * Komponen Utama: Register
 * Mengelola status formulir pendaftaran, memvalidasi input (kecocokan kata sandi, panjang minimum),
 * dan menangani pemanggilan API pendaftaran (layanan autentikasi).
 *
 * @param {Object} props - Properti komponen.
 * @param {function} props.onNavigate - Fungsi *callback* untuk berpindah halaman.
 * @returns {JSX.Element} Antarmuka pengguna Halaman Pendaftaran.
 */
export default function Register({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Daftar - Web Hearthy";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      // Tampilkan notifikasi sukses lalu arahkan ke login
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src={logoHearthy}
              alt="Hearthy logo"
              className="h-10 cursor-pointer"
              onClick={() => onNavigate?.("home")}
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Buat Akun Baru
          </h2>
          <p className="text-gray-500 mb-8">Daftarkan Akun Hearthy Anda</p>

          {/* Notifikasi Sukses */}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 animate-pulse">
              <span>✅</span>
              <span>Registrasi berhasil! Mengarahkan ke halaman login...</span>
            </div>
          )}

          {/* Pesan Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Masukkan username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center p-2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  <img
                    src={showPassword ? iconShow : iconHide}
                    alt={
                      showPassword ? "Icon show password" : "Icon hide password"
                    }
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center p-2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                >
                  <img
                    src={showConfirmPassword ? iconShow : iconHide}
                    alt={
                      showConfirmPassword
                        ? "Icon show password"
                        : "Icon hide password"
                    }
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
              className="text-blue-600 font-bold"
            >
              Masuk sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
