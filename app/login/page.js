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

  // Reset error message saat user mengetik ulang agar UI bersih
  useEffect(() => {
    if (errorMessage) setErrorMessage("");
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Proses Login ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData?.user) {
        throw new Error("User data tidak ditemukan di sistem autentikasi.");
      }

      // 2. Ambil Role dari tabel 'profiles' berdasarkan UID
      // Di sini kita melakukan pengecekan data yang Anda masukkan manual di Table Editor
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Detail Error Supabase:", profileError);
        // Error ini biasanya terjadi jika UUID di tabel 'profiles' tidak cocok dengan di 'auth.users'
        throw new Error(`Profil tidak ditemukan (Error: ${profileError.code}). Pastikan UUID di tabel profiles sudah benar.`);
      }

      // 3. Redirect berdasarkan Role
      const targetPath = profileData.role === "admin" ? "/admin/dashboard" : "/member/dashboard";
      
      console.log("Login sukses! Role:", profileData.role, "Mengarahkan ke:", targetPath);
      
      // Gunakan router.push untuk pengalaman SPA, dan window.location sebagai cadangan
      router.push(targetPath);
      
      // Fallback: Jika dalam 1.5 detik halaman tidak pindah, paksa dengan window.location
      setTimeout(() => {
        window.location.href = targetPath;
      }, 1500);

    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">ChoirZ</h1>
          <p className="mt-2 text-sm text-gray-500 italic">Integrated Choir Operating System</p>
        </div>
        
        {/* Pesan Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 animate-pulse">
            <strong>Gagal: </strong> {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email ChoirZ</label>
            <input
              type="email"
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-bold text-white shadow-md transition-all ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghubungkan...
              </span>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 ChoirZ Platform • v1.0-beta
        </p>
      </div>
    </div>
  );
}