/**
 * @fileoverview Komponen Halaman Utama (Homepage) untuk aplikasi Hearthy.
 * Menampilkan informasi mengenai sistem prediksi risiko kardiovaskular, 
 * cara kerja, keunggulan fitur, dan tautan formulir umpan balik (feedback).
 */

import logoSrc from "../image/logo-hearthy.png";
import iconInputDataKlinis from "../icon/icon-input-data-klinis.svg";
import iconAI from "../icon/icon-AI.svg";
import iconHasilSkrining from "../icon/icon-hasil-skrining.svg";
import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { isAuthenticated } from "../services/authService";

/**
 * Konfigurasi langkah-langkah penggunaan aplikasi (Cara Kerja).
 * Digunakan untuk merender kartu-kartu instruksi pada bagian "How It Works".
 * @type {Array<{title: string, description: string, icon: string}>}
 */
const steps = [
  {
    title: "1. Input Data Klinis",
    description:
      "Berikan metrik kesehatan dan variabel gaya hidup Anda dengan aman melalui formulir intuitif kami.",
    icon: iconInputDataKlinis,
  },
  {
    title: "2. Analisis AI",
    description:
      "Mesin Deep Learning Functional API kami memproses data Anda dengan presisi klinis.",
    icon: iconAI,
  },
  {
    title: "3. Dapatkan Profil Risiko",
    description:
      "Terima profil risiko instan (Rendah, Sedang, Tinggi) dengan wawasan yang dapat ditindaklanjuti.",
    icon: iconHasilSkrining,
  },
];

/**
 * Komponen Ikon: Prediksi AI Akurat
 * Menampilkan grafis vektor (SVG) representasi kecerdasan buatan.
 * @param {Object} props - Properti komponen.
 * @param {string} [props.className="h-6 w-6"] - Kelas utilitas Tailwind CSS untuk penyesuaian gaya.
 * @returns {JSX.Element} Elemen SVG ikon.
 */
function IconPrediksiAkurat({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.95 13.55L12.6 7.9L11.175 6.475L6.95 10.7L4.85 8.6L3.425 10.025L6.95 13.55ZM8 20C5.68333 19.4167 3.77083 18.0875 2.2625 16.0125C0.754167 13.9375 0 11.6333 0 9.1V3L8 0L16 3V9.1C16 11.6333 15.2458 13.9375 13.7375 16.0125C12.2292 18.0875 10.3167 19.4167 8 20ZM8 17.9C9.73333 17.35 11.1667 16.25 12.3 14.6C13.4333 12.95 14 11.1167 14 9.1V4.375L8 2.125L2 4.375V9.1C2 11.1167 2.56667 12.95 3.7 14.6C4.83333 16.25 6.26667 17.35 8 17.9Z"
        fill="#94F2EF"
      />
    </svg>
  );
}

function IconParameter({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14 13C13.1667 13 12.4583 12.7083 11.875 12.125C11.2917 11.5417 11 10.8333 11 10C11 9.16667 11.2917 8.45833 11.875 7.875C12.4583 7.29167 13.1667 7 14 7C14.8333 7 15.5417 7.29167 16.125 7.875C16.7083 8.45833 17 9.16667 17 10C17 10.8333 16.7083 11.5417 16.125 12.125C15.5417 12.7083 14.8333 13 14 13ZM14 11C14.2833 11 14.5208 10.9042 14.7125 10.7125C14.9042 10.5208 15 10.2833 15 10C15 9.71667 14.9042 9.47917 14.7125 9.2875C14.5208 9.09583 14.2833 9 14 9C13.7167 9 13.4792 9.09583 13.2875 9.2875C13.0958 9.47917 13 9.71667 13 10C13 10.2833 13.0958 10.5208 13.2875 10.7125C13.4792 10.9042 13.7167 11 14 11ZM8 20V17.1C8 16.75 8.08333 16.4208 8.25 16.1125C8.41667 15.8042 8.65 15.5583 8.95 15.375C9.48333 15.0583 10.0458 14.7958 10.6375 14.5875C11.2292 14.3792 11.8333 14.225 12.45 14.125L14 16L15.55 14.125C16.1667 14.225 16.7667 14.3792 17.35 14.5875C17.9333 14.7958 18.4917 15.0583 19.025 15.375C19.325 15.5583 19.5625 15.8042 19.7375 16.1125C19.9125 16.4208 20 16.75 20 17.1V20H8ZM9.975 18H13.05L11.7 16.35C11.4 16.4333 11.1083 16.5417 10.825 16.675C10.5417 16.8083 10.2583 16.95 9.975 17.1V18ZM14.95 18H18V17.1C17.7333 16.9333 17.4583 16.7875 17.175 16.6625C16.8917 16.5375 16.6 16.4333 16.3 16.35L14.95 18ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V7C17.7333 6.66667 17.4417 6.35 17.125 6.05C16.8083 5.75 16.4333 5.55 16 5.45V2H2V16H6.15C6.1 16.1833 6.0625 16.3667 6.0375 16.55C6.0125 16.7333 6 16.9167 6 17.1V18H2ZM4 6H11C11.4333 5.66667 11.9083 5.41667 12.425 5.25C12.9417 5.08333 13.4667 5 14 5V4H4V6ZM4 10H9C9 9.65 9.0375 9.30833 9.1125 8.975C9.1875 8.64167 9.29167 8.31667 9.425 8H4V10ZM4 14H7.45C7.63333 13.85 7.82917 13.7167 8.0375 13.6C8.24583 13.4833 8.45833 13.375 8.675 13.275V12H4V14ZM2 16V2V5.425C2 5.29167 2 5.1875 2 5.1125C2 5.0375 2 5 2 5C2 5 2 5.4875 2 6.4625C2 7.4375 2 8.61667 2 10C2 10.4667 2 10.9333 2 11.4C2 11.8667 2 12.3333 2 12.8C2 12.9333 2 13.075 2 13.225C2 13.375 2 13.5167 2 13.65C2 14.0333 2 14.425 2 14.825C2 15.225 2 15.6167 2 16Z"
        fill="#94F2EF"
      />
    </svg>
  );
}

function IconHasil({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.55 16.2L11.725 10H7.725L8.45 4.325L3.825 11H7.3L6.55 16.2ZM4 20L5 13H0L9 0H11L10 8H16L6 20H4Z"
        fill="#94F2EF"
      />
    </svg>
  );
}

function IconDesainInklusif({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 6.5V6.5V6.5V6.5V6.5V6.5V6.5V6.5V6.5V6.5V6.5V6.5M0 16V14H10V16H0V16M3 13C2.45 13 1.97917 12.8042 1.5875 12.4125C1.19583 12.0208 1 11.55 1 11V2C1 1.45 1.19583 0.979167 1.5875 0.5875C1.97917 0.195833 2.45 0 3 0H17C17.55 0 18.0208 0.195833 18.4125 0.5875C18.8042 0.979167 19 1.45 19 2H3V2V2V11V11V11H10V13H3V13M18 14V6V6V6H14V6V6V14V14V14H18V14V14V14M13.5 16C13.0833 16 12.7292 15.8542 12.4375 15.5625C12.1458 15.2708 12 14.9167 12 14.5V5.5C12 5.08333 12.1458 4.72917 12.4375 4.4375C12.7292 4.14583 13.0833 4 13.5 4H18.5C18.9167 4 19.2708 4.14583 19.5625 4.4375C19.8542 4.72917 20 5.08333 20 5.5V14.5C20 14.9167 19.8542 15.2708 19.5625 15.5625C19.2708 15.8542 18.9167 16 18.5 16H13.5V16M16 8.5C16.2167 8.5 16.3958 8.425 16.5375 8.275C16.6792 8.125 16.75 7.95 16.75 7.75C16.75 7.53333 16.6792 7.35417 16.5375 7.2125C16.3958 7.07083 16.2167 7 16 7C15.8 7 15.625 7.07083 15.475 7.2125C15.325 7.35417 15.25 7.53333 15.25 7.75C15.25 7.95 15.325 8.125 15.475 8.275C15.625 8.425 15.8 8.5 16 8.5V8.5M16 10V10V10V10V10V10V10V10V10V10V10V10V10V10"
        fill="#94F2EF"
      />
    </svg>
  );
}

/**
 * Konfigurasi keunggulan utama platform Hearthy.
 * Digunakan untuk merender kartu fitur pada bagian "Keunggulan Utama".
 * @type {Array<{title: string, description: string, icon: React.FC}>}
 */
const features = [
  {
    title: "Prediksi AI Akurat",
    description:
      "Akurasi lebih dari 85% menggunakan model Deep Learning Functional API tingkat lanjut.",
    icon: IconPrediksiAkurat,
  },
  {
    title: "Fokus Parameter Klinis",
    description:
      "Berdasarkan data klinis yang terverifikasi dan variabel gaya hidup esensial.",
    icon: IconParameter,
  },
  {
    title: "Hasil Instan",
    description:
      "Dapatkan profil risiko jantung Anda hanya dalam hitungan detik.",
    icon: IconHasil,
  },
  {
    title: "Desain Inklusif",
    description:
      "Dapat diakses oleh semua pengguna melalui aplikasi web yang sepenuhnya responsif.",
    icon: IconDesainInklusif,
  },
];

/**
 * Konfigurasi tautan Footer.
 * Mengelompokkan tautan berdasarkan kategori "Platform" dan "Dukungan".
 * @type {Object.<string, string[]>}
 */
const footerLinks = {
  platform: ["Kebijakan Privasi", "Ketentuan Layanan"],
  dukungan: ["Sanggahan Medis", "Kontak"],
};

function IconFeedback({ className = "h-7 w-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.075 14.25L12 12.475L14.925 14.25L14.15 10.925L16.75 8.675L13.325 8.4L12 5.25L10.675 8.4L7.25 8.675L9.85 10.925L9.075 14.25ZM2 22V4C2 3.45 2.196 2.97933 2.588 2.588C2.98 2.19667 3.45067 2.00067 4 2H20C20.55 2 21.021 2.196 21.413 2.588C21.805 2.98 22.0007 3.45067 22 4V16C22 16.55 21.8043 17.021 21.413 17.413C21.0217 17.805 20.5507 18.0007 20 18H6L2 22ZM5.15 16H20V4H4V17.125L5.15 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconInputData({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 23 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 12.5V10H8.75V12.5H0ZM0 7.5V5H13.75V7.5H0ZM0 2.5V0H13.75V2.5H0ZM11.25 20V16.1562L18.1562 9.28125C18.3438 9.09375 18.5521 8.95833 18.7812 8.875C19.0104 8.79167 19.2396 8.75 19.4688 8.75C19.7188 8.75 19.9583 8.79688 20.1875 8.89062C20.4167 8.98438 20.625 9.125 20.8125 9.3125L21.9688 10.4688C22.1354 10.6562 22.2656 10.8646 22.3594 11.0938C22.4531 11.3229 22.5 11.5521 22.5 11.7812C22.5 12.0104 22.4583 12.2448 22.375 12.4844C22.2917 12.724 22.1562 12.9375 21.9688 13.125L15.0938 20H11.25ZM20.625 11.7812L19.4688 10.625L20.625 11.7812ZM13.125 18.125H14.3125L18.0938 14.3125L17.5312 13.7188L16.9375 13.1562L13.125 16.9375V18.125ZM17.5312 13.7188L16.9375 13.1562L18.0938 14.3125L17.5312 13.7188Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconAI({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 23 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.5 18.8125L18.3125 10L16.5625 8.25L9.5 15.3125L5.9375 11.75L4.1875 13.5L9.5 18.8125ZM2.5 25C1.8125 25 1.22396 24.7552 0.734375 24.2656C0.244792 23.776 0 23.1875 0 22.5V5C0 4.3125 0.244792 3.72396 0.734375 3.23438C1.22396 2.74479 1.8125 2.5 2.5 2.5H7.75C8.02083 1.75 8.47396 1.14583 9.10938 0.6875C9.74479 0.229167 10.4583 0 11.25 0C12.0417 0 12.7552 0.229167 13.3906 0.6875C14.026 1.14583 14.4792 1.75 14.75 2.5H20C20.6875 2.5 21.276 2.74479 21.7656 3.23438C22.2552 3.72396 22.5 4.3125 22.5 5V22.5C22.5 23.1875 22.2552 23.776 21.7656 24.2656C21.276 24.7552 20.6875 25 20 25H2.5ZM2.5 22.5H20V5H2.5V22.5ZM11.25 4.0625C11.5208 4.0625 11.7448 3.97396 11.9219 3.79688C12.099 3.61979 12.1875 3.39583 12.1875 3.125C12.1875 2.85417 12.099 2.63021 11.9219 2.45312C11.7448 2.27604 11.5208 2.1875 11.25 2.1875C10.9792 2.1875 10.7552 2.27604 10.5781 2.45312C10.401 2.63021 10.3125 2.85417 10.3125 3.125C10.3125 3.39583 10.401 3.61979 10.5781 3.79688C10.7552 3.97396 10.9792 4.0625 11.25 4.0625Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconHasilSkrining({ className = "h-6 w-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.75 25V19.625C2.5625 18.5417 1.64062 17.276 0.984375 15.8281C0.328125 14.3802 0 12.8542 0 11.25C0 8.125 1.09375 5.46875 3.28125 3.28125C5.46875 1.09375 8.125 0 11.25 0C13.8542 0 16.1615 0.765625 18.1719 2.29688C20.1823 3.82812 21.4896 5.82292 22.0938 8.28125L23.7188 14.6875C23.8229 15.0833 23.75 15.4427 23.5 15.7656C23.25 16.0885 22.9167 16.25 22.5 16.25H20V20C20 20.6875 19.7552 21.276 19.2656 21.7656C18.776 22.2552 18.1875 22.5 17.5 22.5H15V25H12.5V20H17.5V13.75H20.875L19.6875 8.90625C19.2083 7.01042 18.1875 5.46875 16.625 4.28125C15.0625 3.09375 13.2708 2.5 11.25 2.5C8.83333 2.5 6.77083 3.34375 5.0625 5.03125C3.35417 6.71875 2.5 8.77083 2.5 11.1875C2.5 12.4375 2.75521 13.625 3.26562 14.75C3.77604 15.875 4.5 16.875 5.4375 17.75L6.25 18.5V25H3.75ZM10 16.25H12.5L12.6875 14.6875C12.8542 14.625 13.0052 14.5521 13.1406 14.4688C13.276 14.3854 13.3958 14.2917 13.5 14.1875L14.9375 14.8125L16.1875 12.6875L14.9375 11.75C14.9792 11.5833 15 11.4167 15 11.25C15 11.0833 14.9792 10.9167 14.9375 10.75L16.1875 9.8125L14.9375 7.6875L13.5 8.3125C13.3958 8.20833 13.276 8.11458 13.1406 8.03125C13.0052 7.94792 12.8542 7.875 12.6875 7.8125L12.5 6.25H10L9.8125 7.8125C9.64583 7.875 9.49479 7.94792 9.35938 8.03125C9.22396 8.11458 9.10417 8.20833 9 8.3125L7.5625 7.6875L6.3125 9.8125L7.5625 10.75C7.52083 10.9167 7.5 11.0833 7.5 11.25C7.5 11.4167 7.52083 11.5833 7.5625 11.75L6.3125 12.6875L7.5625 14.8125L9 14.1875C9.10417 14.2917 9.22396 14.3854 9.35938 14.4688C9.49479 14.5521 9.64583 14.625 9.8125 14.6875L10 16.25ZM11.25 13.125C10.7292 13.125 10.2865 12.9427 9.92188 12.5781C9.55729 12.2135 9.375 11.7708 9.375 11.25C9.375 10.7292 9.55729 10.2865 9.92188 9.92188C10.2865 9.55729 10.7292 9.375 11.25 9.375C11.7708 9.375 12.2135 9.55729 12.5781 9.92188C12.9427 10.2865 13.125 10.7292 13.125 11.25C13.125 11.7708 12.9427 12.2135 12.5781 12.5781C12.2135 12.9427 11.7708 13.125 11.25 13.125Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSendFeedback({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.5755 2.42438C21.3399 2.18867 21.0457 2.02003 20.7232 1.93583C20.4007 1.85162 20.0616 1.8549 19.7409 1.94531L19.7202 1.95188L1.72867 7.40625C1.36378 7.51209 1.03965 7.72627 0.799216 8.02044C0.558778 8.31461 0.413378 8.67487 0.382272 9.05353C0.351167 9.43218 0.435825 9.81134 0.625033 10.1408C0.81424 10.4703 1.09907 10.7345 1.4418 10.8984L9.28117 14.7188L13.0977 22.5609C13.2482 22.881 13.487 23.1514 13.7859 23.3404C14.0849 23.5294 14.4316 23.6291 14.7852 23.6278C14.8387 23.6278 14.893 23.6278 14.9474 23.6213C15.3271 23.592 15.6886 23.4469 15.9831 23.2054C16.2775 22.9639 16.4907 22.6378 16.5937 22.2713L22.048 4.27969C22.0508 4.273 22.053 4.26611 22.0546 4.25906C22.145 3.93827 22.1483 3.59918 22.0641 3.2767C21.9799 2.95422 21.8113 2.66001 21.5755 2.42438ZM14.7102 20.7253L11.488 14.1028L15.8005 9.795C15.9052 9.69036 15.9882 9.56612 16.0448 9.42939C16.1015 9.29266 16.1306 9.14612 16.1306 8.99813C16.1306 8.85013 16.1015 8.70359 16.0448 8.56686C15.9882 8.43013 15.9052 8.3059 15.8005 8.20125C15.6959 8.09661 15.5717 8.01359 15.4349 7.95696C15.2982 7.90033 15.1517 7.87118 15.0037 7.87118C14.8557 7.87118 14.7091 7.90033 14.5724 7.95696C14.4357 8.01359 14.3114 8.09661 14.2068 8.20125L9.89429 12.5138L3.27461 9.28969L19.6874 4.3125L14.7102 20.7253Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconRating({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Komponen Utama: Homepage (App)
 * Berfungsi sebagai titik masuk visual (landing page) bagi pengguna baru maupun yang belum login.
 * Menampilkan:
 * 1. Bagian Hero (Sistem Prediksi Risiko Kardiovaskular Berbasis AI)
 * 2. Statistik Global (Penyebab Global, Dapat Dicegah, Deteksi Dini)
 * 3. Cara Kerja Sistem
 * 4. Keunggulan Fitur
 * 5. Call to Action untuk Umpan Balik (Google Form)
 * 6. Footer (Tautan Platform & Dukungan)
 *
 * @param {Object} props - Properti komponen.
 * @param {string} props.currentPage - Penanda halaman aktif untuk navigasi Navbar.
 * @param {function} props.onNavigate - Fungsi *callback* untuk merutekan pengguna antar halaman.
 * @returns {JSX.Element} Antarmuka pengguna Homepage.
 */
function App({ currentPage, onNavigate }) {
  useEffect(() => {
    // Mengubah judul dokumen HTML pada saat halaman dimuat
    document.title = "Home - Web Hearty";
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      {/* 
        Komponen Navigasi Utama.
        Tombol login hanya ditampilkan jika pengguna belum terautentikasi (belum memiliki sesi).
      */}
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        showLoginButton={!isAuthenticated()}
      />

      <main className="pt-8">
        {/* =======================
            BAGIAN 1: HERO SECTION
            ======================= 
            Menampilkan pesan utama aplikasi dan tombol aksi utama (Call to Action) 
            untuk mengarahkan pengguna melakukan asesmen.
        */}
        <section
          id="home"
          className="mx-auto max-w-screen-2xl px-6 pt-16 pb-16"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block text-[#1b4062] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Sistem Prediksi Risiko
              </span>
              <span className="block text-[#1b4062] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Kardiovaskular Berbasis AI
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Hearthy adalah platform preventive healthcare berbasis web yang
              menggunakan teknologi Deep Learning untuk mendeteksi dini risiko
              penyakit jantung secara instan.
            </p>
            <div className="mt-10 sm:mt-12 lg:mt-16 flex justify-center">
              <button
                onClick={() => onNavigate("assessment")}
                className="inline-flex items-center justify-center rounded-full bg-[#1b4062] px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg lg:px-10 lg:py-5 lg:text-xl font-semibold capitalized text-white shadow-lg shadow-[#1b4062]/15 transition hover:bg-[#173652]"
              >
                Mulai Sekarang
              </button>
            </div>
          </div>
        </section>

        {/* =======================
            BAGIAN 2: STATISTIK GLOBAL
            ======================= 
            Menampilkan data faktual terkait risiko penyakit kardiovaskular secara global 
            untuk membangun urgensi bagi pengguna.
        */}
        <section className="bg-[#dde2e7] py-16">
          <div className="mx-auto grid max-w-screen-2xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1b4062]">#1</p>
              <h2 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-semibold text-[#1b4062]">
                Penyebab Global
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-600">
                Penyakit kardiovaskular tetap menjadi penyebab utama kematian di
                seluruh dunia, merenggut jutaan nyawa setiap tahunnya.
              </p>
            </div>
            <div className="rounded-3xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1b4062]">80%</p>
              <h2 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-semibold text-[#1b4062]">
                Dapat Dicegah
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-600">
                WHO memperkirakan bahwa hingga 80% penyakit jantung dini dan
                stroke dapat dicegah dengan deteksi dini.
              </p>
            </div>
            <div className="rounded-3xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1b4062]">10x</p>
              <h2 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-semibold text-[#1b4062]">
                Deteksi Dini
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-600">
                Skrining AI kami dapat mengidentifikasi pola halus dalam data
                kesehatan hingga 10x lebih akurat daripada pemeriksaan mandiri
                tradisional.
              </p>
            </div>
          </div>
        </section>

        {/* =======================
            BAGIAN 3: CARA KERJA (HOW IT WORKS)
            ======================= 
            Menjelaskan langkah-langkah penggunaan aplikasi dari pengisian formulir data klinis 
            hingga mendapatkan profil risiko.
        */}
        <section id="how-it-works" className="mx-auto max-w-screen-2xl py-16 sm:py-20 lg:py-24">
          <div className="text-center px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold capitalized text-[#1b4062]">
              Cara Kerja
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg leading-7 sm:leading-8 text-slate-600">
              Dapatkan analisis kesehatan jantung Anda dalam tiga langkah
              sederhana
            </p>
          </div>
          <div className="mt-10 grid gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-3xl bg-white p-6 sm:p-8 text-center shadow-sm shadow-slate-200/60 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
              >
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-[#1b4062] text-white">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 brightness-0 invert"
                  />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl font-semibold text-[#1b4062]">
                  {step.title}
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =======================
            BAGIAN 4: KEUNGGULAN UTAMA (FEATURES)
            ======================= 
            Menyoroti fitur-fitur dan manfaat terbaik dari platform Hearthy.
        */}
        <section className="bg-[#1b4062] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-screen-2xl px-6 text-white">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Keunggulan Utama</h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-200">
                Mengapa Hearthy menjadi pilihan untuk perawatan kardiovaskular
                proaktif.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl bg-[#2d5a7b] p-6 sm:p-8 shadow-sm shadow-slate-900/20 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                  </div>
                  <h3 className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-200/90">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =======================
            BAGIAN 5: UMPAN BALIK (FEEDBACK)
            ======================= 
            Mengarahkan pengguna ke tautan Google Form eksternal untuk memberikan ulasan aplikasi.
        */}
        <section className="bg-[#dde2e7] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-screen-2xl px-6">
            <div className="mx-auto max-w-4xl rounded-[32px] bg-white p-6 sm:p-8 md:p-12 shadow-sm shadow-slate-300/40">
              <div className="mx-auto mb-6 sm:mb-8 flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center text-[#1b4062]">
                <IconFeedback className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 text-[#1b4062]" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-950">
                  Berikan Feedback Anda
                </h2>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-6 sm:leading-7 text-slate-600">
                  Bantu kami meningkatkan kualitas dengan memberikan respon
                  anda.
                </p>
              </div>

              <div className="mt-8 sm:mt-10 flex justify-center">
                <a 
                  href="https://forms.gle/hjQrssj9eJwXmn1F7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1b4062] px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 text-white shadow-lg shadow-[#1b4062]/15 transition hover:bg-[#173652]"
                >
                  <span className="capitalize text-base sm:text-lg lg:text-xl font-semibold">
                    Isi Feedback
                  </span>
                  <IconSendFeedback className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =======================
          BAGIAN 6: FOOTER
          ======================= 
          Informasi hak cipta dan navigasi tautan tambahan terkait platform dan dukungan.
      */}
      <footer className="bg-[#ffffff] py-10">
        <div className="mx-auto grid max-w-screen-2xl gap-8 px-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr] items-start md:items-center">
          <div className="space-y-3">
            <div className="flex items-center">
              <img src={logoSrc} alt="Hearthy logo" className="h-9 w-auto" />
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-600">
              © 2026 Hearthy. Sistem prediksi risiko kardiovaskular berbasis AI.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold capitalized text-slate-800">
              Platform
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {footerLinks.platform.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-slate-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold capitalized text-slate-800">
              Dukungan
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {footerLinks.dukungan.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-slate-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
