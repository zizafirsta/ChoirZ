"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
  const [songs, setSongs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [reason, setReason] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const choirQuotes = [
    "Musik dimulai di mana kata-kata berhenti.",
    "Paduan suara bukan tentang suara yang sempurna, tapi tentang harmoni yang menyatu.",
    "Bernyanyi adalah cara jiwa bernapas.",
    "Satu suara bisa mengubah melodi, satu tim bisa mengubah hati.",
    "Latihan tidak membuat sempurna, latihan membuat permanen. Berlatihlah dengan benar!"
  ];

  useEffect(() => {
    setCurrentQuote(choirQuotes[Math.floor(Math.random() * choirQuotes.length)]);

    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. Fetch Profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);

          // 2. Fetch Latest Announcement
          const { data: announceData } = await supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          setAnnouncement(announceData);

          // 3. Fetch Next Activity
          const { data: activityData } = await supabase
            .from("activities")
            .select("*")
            .order("date_time", { ascending: true })
            .limit(1);
          setActivities(activityData || []);

          // 4. Fetch Songs
          const { data: songsData } = await supabase.from("songs").select("*");
          setSongs(songsData || []);

          // 5. Check if user already submitted attendance for the next activity
          if (activityData?.[0]) {
            const { data: attendData } = await supabase
              .from("attendance")
              .select("status, reason")
              .eq("event_id", activityData[0].id)
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (attendData) {
              setAttendanceStatus(attendData.status);
              setReason(attendData.reason || "");
            }
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [router]);

  const submitAttendance = async (status) => {
    if (!activities.length || isSubmitting) return;

    if (status === 'excused') {
      if (!reason || reason.trim().length < 5) {
        alert("Harap berikan alasan izin yang jelas (minimal 5 karakter).");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("attendance").upsert(
        { 
          event_id: activities[0].id, 
          user_id: user.id, 
          status: status, 
          reason: status === 'excused' ? reason.trim() : "" 
        },
        { onConflict: 'event_id,user_id' }
      );

      if (error) throw error;

      alert("Berhasil! Status kehadiran Anda telah tercatat.");
      setAttendanceStatus(status);
      if (status !== 'excused') setReason(""); 
    } catch (error) {
      if (error.code === '42501') {
        alert("Ditolak: Anda tidak memiliki izin RLS. Silakan cek kebijakan database Anda.");
      } else {
        alert("Terjadi kesalahan: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-24 relative overflow-hidden">
      
      <div className="fixed inset-0 z-0">
        <img 
          src="/choir1.png" 
          alt="Choir Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10">
        <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-5">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 relative flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-blue-500/20">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Dashboard</p>
                <h1 className="text-lg font-black tracking-tighter leading-none text-slate-900">ChoirZ Member</h1>
              </div>
            </div>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} 
              className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
            >
              🚪
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto p-6 space-y-8">
          
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[40px] shadow-sm border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
                  {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Member'}! 
                </h2>
                <p className="text-slate-500 font-medium italic">"{currentQuote}"</p>
              </div>
              <div className="flex items-center gap-3 bg-blue-600 px-6 py-4 rounded-[24px] shadow-lg shadow-blue-200 text-white">
                <span className="text-2xl">🎙️</span>
                <div>
                  <p className="text-[9px] font-black opacity-70 uppercase tracking-widest">Suara Anda</p>
                  <p className="font-black">{profile?.voice_type || "Belum Set"}</p>
                </div>
              </div>
            </div>
          </section>

          {announcement && (
            <div className={`p-6 rounded-[35px] flex items-center gap-5 shadow-xl animate-bounce-subtle ${
              announcement.type === 'warning' ? 'bg-red-600 text-white' : 
              announcement.type === 'important' ? 'bg-amber-400 text-slate-900' : 
              'bg-slate-900 text-white'
            }`}>
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                {announcement.type === 'warning' ? '⚠️' : announcement.type === 'important' ? '📢' : '💡'}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Info Penting</p>
                <p className="font-bold leading-tight">{announcement.content}</p>
              </div>
            </div>
          )}

          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[45px] p-10 shadow-sm border border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl font-black italic group-hover:scale-110 transition-transform pointer-events-none">NEXT</div>
              
              <div className="relative z-10">
                <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Sesi Mendatang</span>
                
                {activities.length > 0 ? (
                  <div className="mt-8 flex flex-col gap-6">
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter mb-4 text-slate-900">{activities[0].title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <InfoBadge icon="📅" text={new Date(activities[0].date_time).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} />
                        <InfoBadge icon="🕒" text={new Date(activities[0].date_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
                        <InfoBadge icon="📍" text={activities[0].location} />
                      </div>
                    </div>

                    <div className="mt-4 pt-8 border-t border-slate-50">
                      {attendanceStatus && attendanceStatus !== 'choosing-excuse' ? (
                        <div className="flex items-center gap-4 bg-emerald-500 text-white p-6 rounded-[30px] shadow-lg shadow-emerald-200 animate-in zoom-in-95">
                          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl">✅</div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Konfirmasi Anda</p>
                            <p className="text-lg font-black uppercase">{attendanceStatus === 'present' ? 'SAYA AKAN HADIR' : 'SAYA SUDAH IZIN'}</p>
                            <button onClick={() => setAttendanceStatus("")} className="text-[10px] underline opacity-70 mt-1">Ubah Status</button>
                          </div>
                        </div>
                      ) : attendanceStatus === 'choosing-excuse' ? (
                        <div className="space-y-4 animate-in slide-in-from-top-4">
                          <textarea 
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-200 transition-all min-h-[120px]"
                            placeholder="Mengapa Anda berhalangan hadir?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                          <div className="flex gap-4">
                            <button 
                              disabled={isSubmitting}
                              onClick={() => submitAttendance('excused')} 
                              className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? "Mengirim..." : "Kirim Izin"}
                            </button>
                            <button onClick={() => setAttendanceStatus("")} className="px-8 font-black text-xs text-slate-400 uppercase tracking-widest">Batal</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <button 
                            disabled={isSubmitting}
                            onClick={() => submitAttendance('present')} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 disabled:opacity-50"
                          >
                            {isSubmitting ? "Memproses..." : "Hadir Sesi Ini"}
                          </button>
                          <button onClick={() => setAttendanceStatus('choosing-excuse')} className="px-10 border-2 border-slate-100 text-slate-400 hover:bg-slate-50 py-6 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all">Izin</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 py-10 text-center bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-100 italic font-bold text-slate-400">Belum ada sesi latihan terjadwal.</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 p-8 rounded-[45px] text-white min-h-[160px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 italic"># Practice Progress</p>
                    <p className="text-5xl font-black tracking-tighter mb-1">{songs.length}</p>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Lagu di Library</p>
                  </div>
              </div>

              <button 
                onClick={() => router.push("/member/learning")}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[45px] text-white text-left relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-6xl">🎹</span>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-4 italic"># Learning Center</p>
                  <h3 className="text-2xl font-black tracking-tight leading-tight mb-2 text-white">Tips & Trick<br/>Vokal</h3>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    Pelajari <span>→</span>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section className="pt-8">
            <div className="flex justify-between items-end mb-10 px-4">
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900">Materi Lagu</h2>
                <p className="text-slate-500 font-medium">Latih suaramu kapan saja, di mana saja.</p>
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {songs.length} Items
              </div>
            </div>

            {songs.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} voiceType={profile?.voice_type} />
                ))}
              </div>
            ) : (
              <div className="bg-white/50 rounded-[50px] py-24 border-2 border-dashed border-white text-center">
                  <p className="text-slate-400 font-bold">Library lagu belum tersedia.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// SUPPORTING COMPONENTS
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-[6px] border-blue-600 border-t-transparent"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ChoirZ Loading...</p>
      </div>
    </div>
  );
}

function InfoBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
      <span className="opacity-50 text-xs">{icon}</span>
      <p className="text-xs font-bold text-slate-600">{text}</p>
    </div>
  );
}

function SongCard({ song, voiceType }) {
  // 1. Normalisasi: Ambil huruf pertama saja (S/A/T/B) dan jadikan huruf kecil
  // Ini agar 'sopran' jadi 's', dan 'S' tetap 's'
  const v = voiceType ? voiceType.toLowerCase().trim().charAt(0) : null;

  // 2. Mapping Label untuk tampilan teks UI
  const voiceMap = {
    's': 'Sopran',
    'a': 'Alto',
    't': 'Tenor',
    'b': 'Bass'
  };

  const voiceLabel = voiceMap[v];
  
  // 3. Menghubungkan ke kolom database: track_s, track_a, track_t, track_b
  // Pastikan di Supabase nama kolomnya memang track_s, track_a, dst.
  const audioKey = v ? `track_${v}` : null;
  const audioSrc = audioKey ? song[audioKey] : null;

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-[50px] p-10 shadow-sm border border-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{song.title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-2em mb-10">{song.composer}</p>
        <div className="space-y-4">
          <a href={song.pdf_url} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-[22px] transition-all group/btn shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-widest">Lihat Partitur PDF</span>
            <span className="text-xl group-hover/btn:translate-x-1 transition-transform">📄</span>
          </a>
          <div className="pt-2">
            {voiceLabel ? (
              <AudioPlayer label={voiceLabel} src={audioSrc} />
            ) : (
              <div className="p-5 bg-amber-50 text-amber-600 text-[9px] rounded-3xl font-black text-center border border-amber-100">
                LENGKAPI "JENIS SUARA" DI PROFIL UNTUK AUDIO LATIHAN
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function AudioPlayer({ label, src }) {
  if (!src) return (
    <div className="p-6 bg-slate-50 text-slate-400 text-[10px] rounded-[24px] font-black text-center italic border border-slate-100">
      Audio part {label} belum tersedia.
    </div>
  );

  return (
    <div className="bg-blue-50 p-6 rounded-[30px] border border-blue-100/50 transition-all hover:bg-blue-100/40">
      <div className="flex justify-between items-center mb-4 px-2">
         <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] italic">Guide: {label}</p>
         <div className="flex gap-1">
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse delay-150"></div>
         </div>
      </div>
      <audio controls className="w-full h-10 custom-audio">
        <source src={src} type="audio/mpeg" />
      </audio>
      <style jsx>{`
        .custom-audio::-webkit-media-controls-panel { background-color: transparent; }
        .custom-audio { filter: contrast(1.1) hue-rotate(190deg); }
      `}</style>
    </div>
  );
}