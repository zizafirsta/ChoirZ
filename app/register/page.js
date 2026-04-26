"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  // --- STATE MANAGEMENT ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [voiceType, setVoiceType] = useState("sopran");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  // Bersihkan pesan error saat user mulai mengetik ulang
  useEffect(() => {
    if (errorMessage) setErrorMessage("");
  }, [fullName, email, password, voiceType]);

  // --- LOGIKA REGISTRASI ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Validasi domain email khusus ChoirZ
    if (!email.endsWith("@choirz.com")) {
      setErrorMessage("Email harus menggunakan format @choirz.com");
      setLoading(false);
      return;
    }

    try {
      // 1. SignUp ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      // 2. Insert data tambahan ke tabel 'profiles' jika auth berhasil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id, // Sinkronisasi dengan UUID Auth
              full_name: fullName,
              role: "member",       // Default role
              voice_type: voiceType,
              email: email,
            },
          ]);

        if (profileError) throw new Error(`Gagal menyimpan profil: ${profileError.message}`);

        alert("Registrasi Berhasil! Silakan cek email untuk verifikasi atau langsung login.");
        router.push("/login");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-sans text-slate-900">
      {/* Card Container */}
      <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 md:p-12 overflow-hidden relative">
        
        {/* Dekorasi Garis Biru Atas */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#3b82f6]"></div>

        {/* Tombol Kembali ke About (Landing Page) */}
        <button 
          onClick={() => router.push('/about')} 
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#3b82f6] transition-colors group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3 w-3 transition-transform group-hover:-translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        {/* Header Section */}
        <div className="text-center mb-10 mt-4">
          <div className="inline-block mb-6 transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="ChoirZ"
              className="h-20 w-auto mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <h1 className="hidden text-4xl font-black tracking-tighter text-blue-600" style={{ display: "none" }}>
              ChoirZ
            </h1>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
            Daftar Akun Baru
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Lengkapi data untuk bergabung dengan sistem
          </p>
        </div>

        {/* Error Alert Section */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* Input Nama Lengkap */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap Anda"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all placeholder:text-slate-300 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Input Tipe Suara */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Tipe Suara
            </label>
            <div className="relative">
              <select
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all text-sm appearance-none cursor-pointer text-slate-900"
              >
                <option value="sopran">Sopran</option>
                <option value="alto">Alto</option>
                <option value="tenor">Tenor</option>
                <option value="bass">Bass</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email Address (@choirz.com)
            </label>
            <input
              type="email"
              required
              placeholder="nama@choirz.com"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all placeholder:text-slate-300 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 karakter"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all placeholder:text-slate-300 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${
              loading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#3b82f6] hover:bg-blue-700 text-white shadow-blue-200 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mendaftarkan...
              </>
            ) : (
              "Buat Akun Member"
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2026 ChoirZ • v1.0 Beta
          </p>
        </div>
      </div>
    </div>
  );
}