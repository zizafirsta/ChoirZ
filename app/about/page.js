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

  // Data fitur utama
  const features = [
    { label: "Data-Driven", value: "Analisis Vokal" },
    { label: "Centralized", value: "Digital Library" },
    { label: "Collaborative", value: "Smart Practice" },
    { label: "Seamless", value: "Cloud Sync" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      
      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-200">Z</div>
            <span className={`font-black tracking-tighter text-xl ${scrolled ? "text-slate-900" : "text-white"}`}>ChoirZ</span>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-slate-900 transition-all shadow-lg shadow-blue-200"
          >
            Member Area
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/choir1.png" 
            alt="Hero" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 animate-fade-in shadow-xl">
            The Future of Choral Management
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
            Singing with <br/> <span className="text-blue-400">Precision.</span>
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto font-medium text-lg md:text-xl leading-relaxed backdrop-blur-[2px]">
            ChoirZ adalah platform manajemen paduan suara digital yang dirancang untuk merapikan ribuan data lagu, jadwal latihan, dan analisis performa anggota dalam satu ekosistem cerdas.
          </p>
        </div>
      </section>

      {/* KEY FEATURES / STATS SECTION */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-[30px] shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-500">
              <p className="text-2xl font-black text-slate-900 mb-1 leading-tight">{feature.value}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{feature.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-8 leading-tight">
              Sistem Cerdas untuk <br/> Efisiensi Latihan.
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">📂</div>
                <div>
                  <h4 className="font-black text-lg mb-2">Manajemen Dataset Masif</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">Mengelola data lagu dan partitur, memudahkan pencarian referensi dalam hitungan detik.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">📈</div>
                <div>
                  <h4 className="font-black text-lg mb-2">Monitoring Progress</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">Pantau kehadiran dan kualitas vokal anggota melalui dashboard yang transparan dan berbasis data akurat.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-12 w-12 shrink-0 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                <div>
                  <h4 className="font-black text-lg mb-2">Lokasi & Operasional</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">Berbasis di <strong>Universitas Muhammadiyah Malang</strong>, kami mengintegrasikan semangat akademis dengan kreativitas seni vokal.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 rounded-[60px] rotate-3 scale-95 opacity-10 group-hover:rotate-6 transition-transform duration-700"></div>
            <div className="relative h-[500px] w-full rounded-[60px] overflow-hidden shadow-2xl border-8 border-white">
              <img src="/choir1.png" className="w-full h-full object-cover" alt="ChoirZ System" />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-black text-xl italic">"Empowering voices through technology."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER IDENTITY SECTION - Added id="contact-me" for smooth scroll */}
      <section id="contact-me" className="bg-slate-100 py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 bg-white p-10 md:p-16 rounded-[50px] shadow-2xl shadow-slate-200 border border-white">
          
          {/* FOTO DEVELOPER */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-blue-600 rounded-[40px] rotate-6 scale-105 opacity-10 group-hover:rotate-12 transition-transform duration-500"></div>
            <div className="relative h-64 w-64 md:h-72 md:w-72 rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-lg">
              <img 
                src="/ziza.png" 
                alt="Ziza Firsta Mahadewi" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
          </div>

          {/* TEKS IDENTITAS */}
          <div className="text-center md:text-left">
            <div className="inline-block p-1 px-4 mb-6 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black tracking-[0.2em] text-blue-600">
              DEVELOPED BY
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter">
              Ziza Firsta Mahadewi
            </h3>
            <p className="text-blue-600 font-bold tracking-widest text-lg mb-6">
              NIM: 202310370311175
            </p>
            <div className="h-1 w-20 bg-blue-600 mb-6 mx-auto md:mx-0 rounded-full"></div>
            <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed font-medium">
              Mahasiswa Teknik Informatika <strong>Universitas Muhammadiyah Malang</strong> yang berfokus pada pengembangan solusi web inovatif. Melalui ChoirZ, saya mengintegrasikan teknologi data untuk memajukan komunitas seni vokal di Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Updated to remove "Hubungi Kami" button and add interactive link */}
      <section className="max-w-5xl mx-auto px-6 pb-32 mt-24">
        <div className="bg-slate-900 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
              Siap Menjadi Bagian <br/> dari Harmoni Kami?
            </h2>
            <div className="flex flex-col items-center gap-8 justify-center">
              
              {/* TOMBOL DAFTAR UTAMA */}
              <button 
                onClick={() => router.push('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Daftar Sekarang
              </button>

              {/* LINK INTERAKTIF HUBUNGI DEVELOPER */}
              <div 
                className="group/link flex flex-col items-center cursor-pointer transition-all" 
                onClick={() => document.getElementById('contact-me').scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 group-hover/link:text-blue-400 transition-colors">
                  Ada Pertanyaan Sistem?
                </span>
                <span className="text-white font-black text-xs uppercase tracking-widest border-b border-white/20 group-hover/link:border-blue-500 transition-all pb-1">
                  Hubungi Developer →
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
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