/**
 * @fileoverview Halaman Autentikasi Masuk (Login Page).
 * Menyediakan antarmuka bagi pengguna untuk masuk ke dalam akun mereka
 * dengan menggunakan kombinasi alamat email dan kata sandi.
 */
import logoHearthy from "../image/logo-hearthy.png";
import doctorImage from "../image/doctor-image.png";
import iconShow from "../icon/icon-show.svg";
import iconHide from "../icon/icon-hide.svg";
import { useEffect, useState } from "react";
import { login } from "../services/authService";

/**
 * Komponen Utama: Login
 * Mengatur status formulir (email, password), proses pemanggilan API autentikasi,
 * penanganan kesalahan, dan memfasilitasi navigasi pasca-login.
 *
 * @param {Object} props - Properti komponen.
 * @param {function} props.onNavigate - Fungsi *callback* untuk berpindah halaman.
 * @returns {JSX.Element} Antarmuka pengguna Halaman Login.
 */
export default function Login({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login - Web Hearthy";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Login berhasil → navigasi ke dashboard
      onNavigate?.("dashboard");
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
            Selamat Datang
          </h2>
          <p className="text-gray-500 mb-8">
            Silakan masuk ke akun Hearthy Anda
          </p>

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
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Masukkan email"
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
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2" /> Ingat saya
              </label>
              <button
                type="button"
                onClick={() => onNavigate?.("reset")}
                className="text-blue-600 font-semibold"
              >
                Lupa password?
              </button>
            </div>
            <button
              id="login-submit"
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
                "Masuk"
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-8">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => onNavigate?.("register")}
              className="text-blue-600 font-bold"
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
