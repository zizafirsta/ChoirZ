"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (errorMessage) setErrorMessage("");
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData?.user) throw new Error("User data tidak ditemukan.");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw new Error(`Profil tidak ditemukan (Error: ${profileError.code}).`);

      const targetPath = profileData.role === "admin" ? "/admin/dashboard" : "/member/dashboard";
      router.push(targetPath);
      
      setTimeout(() => {
        window.location.href = targetPath;
      }, 1500);

    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 md:p-12 overflow-hidden relative">
        
        {/* Dekorasi Aksen Halus */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#3b82f6]"></div>

        {/* Tombol Back */}
        <button 
          onClick={() => router.back()}
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

        {/* Logo & Header */}
        <div className="text-center mb-10 mt-4"> {/* Ditambah mt-4 agar tidak tabrakan dengan tombol back */}
          <div className="inline-block mb-6 transition-transform hover:scale-105 duration-300">
            <img 
              src="/logo.png" 
              alt="ChoirZ" 
              className="h-20 w-auto mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h1 
              className="hidden text-4xl font-black tracking-tighter text-blue-600"
              style={{ display: 'none' }}
            >
              ChoirZ
            </h1>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
            Selamat Datang
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Masuk untuk mengakses sistem paduan suara
          </p>
        </div>

        {/* Alert Error Modern */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all placeholder:text-slate-300 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold transition-all placeholder:text-slate-300 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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
                Menghubungkan...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2026 ChoirZ • v1.0 Beta
          </p>
        </div>
      </div>
    </div>
  );
}