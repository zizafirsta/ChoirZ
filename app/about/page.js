"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { label: "Anggota Aktif", value: "150+" },
    { label: "Koleksi Lagu", value: "140k+" },
    { label: "Tahun Berdiri", value: "2018" },
    { label: "Konser Besar", value: "12" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      
      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">Z</div>
            <span className="font-black tracking-tighter text-xl">ChoirZ</span>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
          >
            Member Area
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/choir1.png" 
            alt="Hero" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-50"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 animate-fade-in">
            EST. 2018
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
            Harmony in <br/> <span className="text-blue-400">Diversity.</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto font-medium text-lg md:text-xl leading-relaxed backdrop-blur-[2px]">
            ChoirZ bukan sekadar paduan suara. Kami adalah wadah di mana setiap suara menemukan rumahnya dan setiap nada menciptakan cerita.
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[35px] shadow-xl shadow-slate-200/50 border border-white text-center hover:-translate-y-2 transition-transform duration-500">
              <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-8 leading-tight">
            Membawa Vokal Ke <br/> Level Selanjutnya.
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🎯</div>
              <div>
                <h4 className="font-black text-lg mb-2">Visi Kami</h4>
                <p className="text-slate-500 leading-relaxed text-sm">Menjadi komunitas paduan suara digital pertama yang mengintegrasikan teknologi data untuk meningkatkan kualitas vokal setiap anggota secara presisi.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="h-12 w-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
              <div>
                <h4 className="font-black text-lg mb-2">Misi Kami</h4>
                <p className="text-slate-500 leading-relaxed text-sm">Menyediakan platform latihan yang mudah diakses, transparan, dan terorganisir bagi seluruh pecinta musik vokal di Indonesia.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600 rounded-[60px] rotate-3 scale-95 opacity-10 group-hover:rotate-6 transition-transform duration-700"></div>
          <div className="relative h-[450px] w-full rounded-[60px] overflow-hidden shadow-2xl border-8 border-white">
            <img src="/choir1.png" className="w-full h-full object-cover" alt="Visi Misi" />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="bg-slate-900 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter">Siap Menjadi Bagian <br/> dari Harmoni Kami?</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-900/20">
                Daftar Sekarang
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          © 2026 ChoirZ Project — Crafted with Passion by Ziza
        </p>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}