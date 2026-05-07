// import { useState } from "react";
// import logoSrc from "../image/logo-hearthy.png";
// import doctorImage from "../image/doctor-image.png";

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
//       <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col px-6 py-6">
//         <header className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <img src={logoSrc} alt="Hearthy logo" className="h-10 w-auto" />
//             <span className="text-xl font-semibold tracking-tight text-slate-950">
//               Hearthy
//             </span>
//           </div>
//         </header>

//         <main className="relative mt-8 flex flex-1 items-center justify-center overflow-hidden px-4">
//           <div className="relative flex w-full max-w-[1320px] items-center justify-between gap-8">
//             <div className="hidden lg:flex lg:w-[649px] items-center justify-center overflow-hidden">
//               <img
//                 src={doctorImage}
//                 alt="Doctor illustration"
//                 width={649}
//                 height={860}
//                 className="h-[860px] w-[649px] object-contain"
//               />
//             </div>

//             <div className="w-full max-w-[470px] rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.16)]">
//               <h1 className="text-center text-3xl font-bold text-slate-950">
//                 Login
//               </h1>

//               <div className="mt-10 space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(event) => setEmail(event.target.value)}
//                     placeholder="Masukkan Email"
//                     className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       onChange={(event) => setPassword(event.target.value)}
//                       placeholder="Masukkan Password"
//                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-3 flex items-center text-slate-500"
//                     >
//                       {showPassword ? (
//                         <span className="text-lg">🙈</span>
//                       ) : (
//                         <span className="text-lg">👁️</span>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between text-sm">
//                   <label className="inline-flex items-center gap-2 text-slate-700">
//                     <input
//                       type="checkbox"
//                       className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
//                     />
//                     Ingat saya
//                   </label>
//                   <a
//                     href="#"
//                     className="font-medium text-sky-700 hover:text-sky-800"
//                   >
//                     Lupa password?
//                   </a>
//                 </div>

//                 <button className="w-full rounded-2xl bg-[#1e3a5a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172c45]">
//                   Masuk
//                 </button>
//               </div>

//               <p className="mt-8 text-center text-sm text-slate-600">
//                 Belum punya akun?{" "}
//                 <a
//                   href="#"
//                   className="font-semibold text-sky-700 hover:text-sky-800"
//                 >
//                   Daftar sekarang
//                 </a>
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
