"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LearningCenter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("intervals");

  const intervals = [
    { name: "Unison", semitones: 0, desc: "Dua nada yang sama." },
    { name: "Minor 2nd", semitones: 1, desc: "Setengah nada (Half step)." },
    { name: "Major 2nd", semitones: 2, desc: "Satu nada (Whole step)." },
    { name: "Major 3rd", semitones: 4, desc: "Interval ceria (Mayor)." },
    { name: "Perfect 4th", semitones: 5, desc: "Jarak 5 setengah nada." },
    { name: "Perfect 5th", semitones: 7, desc: "Dasar harmoni (Power chord)." },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-24 relative overflow-hidden">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/choir2.png" 
          alt="Choir Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md"></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10">
        
        {/* NAVIGASI ATAS */}
        <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-5">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              <span>←</span> Dashboard
            </button>
            <div className="text-right">
              <h1 className="text-lg font-black tracking-tighter leading-none text-slate-900">Learning Center</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto p-6 mt-8">
          
          {/* TAB NAVIGATION */}
          <div className="flex gap-4 mb-10 bg-white/50 p-2 rounded-[30px] border border-white w-fit shadow-sm">
            <button 
              onClick={() => setActiveTab("intervals")}
              className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'intervals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-white'}`}
            >
              🎹 Piano & Notasi
            </button>
            <button 
              onClick={() => setActiveTab("fifths")}
              className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'fifths' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-white'}`}
            >
              🎡 Circle of Fifths
            </button>
          </div>

          {/* CONTENT SECTION */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {activeTab === "intervals" ? (
              <div className="space-y-8">
                {/* PIANO IMAGE 16:4 */}
                <div className="w-full rounded-[40px] overflow-hidden bg-white border-4 border-white shadow-2xl">
                  <img 
                    src="/piano.png" 
                    alt="Piano Keyboard & Staff" 
                    className="w-full h-auto"
                  />
                </div>

                {/* PENJELASAN THEORY #1 */}
                <div className="bg-white rounded-[50px] p-8 md:p-12 border border-white shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Theory #1</span>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">Visualisasi Nada & Notasi</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10 mb-12">
                    <div className="space-y-4">
                      <h4 className="font-black text-blue-600 uppercase text-xs tracking-widest">Navigasi Piano</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Perhatikan kelompok 2 dan 3 tuts hitam. Nada <strong>C</strong> selalu berada di kiri 2 tuts hitam. Bagi penyanyi choir, membayangkan tuts piano membantu menjaga akurasi nada (*pitching*).
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-blue-600 uppercase text-xs tracking-widest">Membaca Paranada</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Garis vertikal pada gambar menghubungkan tuts ke not balok. Semakin ke kanan tuts piano, semakin tinggi posisi not di garis paranada. Ingatlah: <strong>C tengah</strong> berada di garis bantu bawah.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-10">
                    <h4 className="font-black text-slate-900 mb-6 text-center uppercase tracking-widest text-sm">Daftar Interval Dasar</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {intervals.map((item, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{item.semitones} Semitones</p>
                          <p className="text-[11px] text-slate-500 italic leading-tight">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* CIRCLE OF FIFTHS GRID */}
                <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900 text-white rounded-[60px] p-8 md:p-16 overflow-hidden relative shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
                  
                  {/* IMAGE 1:1 */}
                  <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex items-center justify-center">
                    <img 
                      src="/circle.png" 
                      alt="Circle of Fifths Diagram" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* PENJELASAN THEORY #2 */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Theory #2</span>
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter mb-6">The Circle of Fifths</h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-8 text-sm md:text-base">
                      Ini adalah "peta jalan" musik. Lingkaran ini menunjukkan hubungan antara tangga nada Mayor dan Minor serta jumlah tanda mula (# atau b).
                    </p>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-[30px] border border-white/10">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl">🕒</span>
                          <p className="font-black text-blue-400 uppercase text-xs tracking-widest">Arah Jarum Jam (Sharp)</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Setiap langkah ke kanan (naik 5 nada) menambah satu tanda tajam (#). Dimulai dari C (nol), G (1#), D (2#), dan seterusnya.</p>
                      </div>

                      <div className="bg-white/5 p-6 rounded-[30px] border border-white/10">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl">🔄</span>
                          <p className="font-black text-indigo-400 uppercase text-xs tracking-widest">Lawan Jarum Jam (Flat)</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Setiap langkah ke kiri (turun 5 nada) menambah satu tanda mol (b). Dimulai dari F (1b), Bb (2b), dan seterusnya.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIPS UNTUK CHOIR */}
                <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl shadow-blue-200">
                  <h4 className="font-black uppercase tracking-widest text-xs mb-4">💡 Pro-Tips untuk Member</h4>
                  <p className="font-bold text-lg leading-snug">
                    "Memahami lingkaran ini memudahkanmu saat pelatih meminta modulasi (pindah nada dasar) di tengah lagu!"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}