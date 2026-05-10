import logoHearthy from "../image/logo-hearthy.png";
import doctorImage from "../image/doctor-image.png";
import iconShow from "../icon/icon-show.svg";
import iconHide from "../icon/icon-hide.svg";
import { useEffect, useState } from "react";

export default function ResetPassword({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - Web Hearty";
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    onNavigate?.("login");
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
            Atur Ulang Kata Sandi
          </h2>
          <p className="text-gray-500 mb-8">
            {step === 1
              ? "Masukkan Email Anda Untuk Verifikasi"
              : "Masukkan Password Terbaru Anda"}
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password baru"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center justify-center p-2 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      <img
                        src={showPassword ? iconShow : iconHide}
                        alt={
                          showPassword
                            ? "Icon show password"
                            : "Icon hide password"
                        }
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi password baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Konfirmasi password baru anda"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none pr-12"
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
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20"
            >
              {step === 1 ? "Verifikasi" : "Reset password"}
            </button>
          </form>

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
