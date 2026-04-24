"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MemberDashboard() {
  const [songs, setSongs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [announcement, setAnnouncement] = useState(null); // State Baru
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Ambil Profil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        // 2. Ambil Pengumuman Terbaru (Limit 1)
        const { data: announceData } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setAnnouncement(announceData);

        // 3. Ambil Jadwal Terdekat
        const { data: activityData } = await supabase
          .from("activities")
          .select("*")
          .order("date_time", { ascending: true })
          .limit(1);
        setActivities(activityData || []);

        // 4. Ambil Lagu
        const { data: songsData } = await supabase.from("songs").select("*");
        setSongs(songsData || []);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  const submitAttendance = async (status) => {
    if (!activities.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("attendance").insert([
      { 
        event_id: activities[0].id, 
        user_id: user.id, 
        status: status, 
        reason: status === 'excused' ? reason : "" 
      }
    ]);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Status kehadiran diperbarui!");
      setAttendanceStatus(status);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900 pb-20">
      
      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-black tracking-tight">Halo, {profile?.full_name?.split(' ')[0]}! 👋</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
            PART: {profile?.voice_type || "Belum diatur"}
          </p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")} 
          className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
        >
          LOGOUT
        </button>
      </header>

      {/* SEKSI PENGUMUMAN - NEW FITUR */}
      {announcement && (
        <div className={`mb-8 p-6 rounded-[32px] flex items-start gap-4 shadow-lg shadow-blue-100/50 border-l-8 animate-in fade-in slide-in-from-top-2 duration-700 ${
          announcement.type === 'warning' ? 'bg-red-50 border-red-500 text-red-900' : 
          announcement.type === 'important' ? 'bg-amber-50 border-amber-500 text-amber-900' : 
          'bg-blue-600 border-blue-800 text-white'
        }`}>
          <span className="text-2xl mt-1">
            {announcement.type === 'warning' ? '⚠️' : announcement.type === 'important' ? '📢' : 'ℹ️'}
          </span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className={`text-[10px] font-black uppercase tracking-widest ${announcement.type === 'info' ? 'text-blue-200' : 'opacity-60'}`}>
                Pengumuman Terbaru
              </p>
              <p className="text-[9px] opacity-50 font-bold">
                {new Date(announcement.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <p className="font-bold leading-relaxed">{announcement.content}</p>
          </div>
        </div>
      )}

      {/* SEKSI JADWAL / ABSENSI */}
      <section className="mb-10 bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl font-black italic select-none">NEXT</div>
        
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400 mb-6">Jadwal Latihan Terdekat</h2>
        
        {activities.length > 0 ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div>
              <p className="text-3xl font-black tracking-tight mb-4">{activities[0].title}</p>
              <div className="space-y-2 text-sm font-medium text-slate-300">
                <p className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
                  📅 {new Date(activities[0].date_time).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                <p className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
                  📍 {activities[0].location}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[240px]">
              {attendanceStatus && attendanceStatus !== 'choosing-excuse' ? (
                <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-center shadow-lg animate-in zoom-in-95 duration-300">
                  {attendanceStatus === 'present' ? '✅ ANDA AKAN HADIR' : '✉️ ANDA SUDAH IZIN'}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => submitAttendance('present')} 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
                  >
                    HADIR
                  </button>
                  <button 
                    onClick={() => setAttendanceStatus('choosing-excuse')} 
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-4 rounded-2xl font-black transition-all active:scale-95"
                  >
                    IZIN
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 italic font-bold">Belum ada jadwal aktif.</div>
        )}

        {/* Input Alasan */}
        {attendanceStatus === 'choosing-excuse' && (
          <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-top-4 duration-500">
            <label className="block text-xs font-black uppercase text-slate-400 mb-3">Alasan Berhalangan Hadir:</label>
            <textarea 
              className="w-full p-4 rounded-2xl text-slate-900 font-bold outline-none border-none shadow-inner min-h-[100px]"
              placeholder="Sakit, acara keluarga, dll..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => submitAttendance('excused')} 
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-xs shadow-md hover:bg-blue-50 transition-colors"
              >
                KIRIM IZIN
              </button>
              <button onClick={() => setAttendanceStatus("")} className="text-xs font-black text-slate-400 px-4">BATAL</button>
            </div>
          </div>
        )}
      </section>

      {/* RUANG LATIHAN */}
      <section>
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 px-2">
          <span className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">🎼</span> Ruang Latihan Mandiri
        </h2>
        
        {songs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {songs.map((song) => (
              <div key={song.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{song.title}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{song.composer}</p>
                </div>
                
                <div className="relative z-10 flex flex-col gap-4">
                  <a 
                    href={song.pdf_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-slate-900 py-4 rounded-[20px] text-xs font-black text-white hover:bg-blue-600 transition-all active:scale-95"
                  >
                    📄 BUKA PARTITUR (PDF)
                  </a>

                  <div className="pt-4 border-t border-gray-50">
                    {/* Logika Filter Suara Otomatis */}
                    {['S', 'A', 'T', 'B'].includes(profile?.voice_type) ? (
                      <AudioPlayer 
                        label={profile.voice_type === 'S' ? 'Sopran' : profile.voice_type === 'A' ? 'Alto' : profile.voice_type === 'T' ? 'Tenor' : 'Bass'} 
                        src={song[`track_${profile.voice_type.toLowerCase()}`]} 
                      />
                    ) : (
                      <div className="p-4 bg-amber-50 text-amber-700 text-[10px] rounded-2xl font-black text-center">
                        Tentukan "Jenis Suara" di profil Admin untuk melihat audio latihan Anda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-100 rounded-[40px] border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">Belum ada materi lagu yang tersedia.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function AudioPlayer({ label, src }) {
  if (!src) return (
    <div className="p-4 bg-gray-50 text-gray-400 text-[10px] rounded-2xl font-black text-center italic">
       Audio part {label} belum diunggah pelatih.
    </div>
  );

  return (
    <div className="bg-blue-50 p-5 rounded-[24px] border border-blue-100 shadow-inner">
      <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 text-center italic">Ready to Practice: {label}</p>
      <audio controls className="w-full h-8 custom-audio scale-105">
        <source src={src} type="audio/mpeg" />
      </audio>
      <style jsx>{`
        .custom-audio::-webkit-media-controls-panel { background-color: #eff6ff; }
      `}</style>
    </div>
  );
}