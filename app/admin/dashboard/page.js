"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  // --- STATES DATA (Logic Tetap) ---
  const [stats, setStats] = useState({ members: 0, songs: 0 });
  const [allSongsData, setAllSongsData] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATES UI ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATES FORM ---
  const [announcement, setAnnouncement] = useState("");
  const [announcementType, setAnnouncementType] = useState("info");
  const [isPosting, setIsPosting] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", composer: "" });
  const [selectedFiles, setSelectedFiles] = useState({
    pdf: null, s: null, a: null, t: null, b: null
  });

  // --- LOGIKA FETCH DATA (Logic Tetap) ---
  async function fetchAdminData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (myProfile?.role !== 'admin') { 
        window.location.href = "/member/dashboard"; 
        return; 
      }

      const { data: profilesList } = await supabase
        .from("profiles")
        .select("full_name, voice_type, role, created_at")
        .order("full_name", { ascending: true });
      
      setAllMembers(profilesList || []);

      const { data: songsList } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });
      
      setAllSongsData(songsList || []);

      const { data: attData } = await supabase
        .from("attendance")
        .select(`status, created_at, profiles(full_name, voice_type), activities(title)`)
        .order("created_at", { ascending: false });

      setAttendance(attData || []);

      setStats({ 
        members: profilesList?.filter(p => p.role === 'member').length || 0, 
        songs: songsList?.length || 0 
      });

    } catch (e) { 
      console.error("Error fetching data:", e); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { fetchAdminData(); }, []);

  // --- HANDLERS (Logic Tetap) ---
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement) return;
    setIsPosting(true);
    try {
      const { error } = await supabase.from("announcements").insert([{ content: announcement, type: announcementType }]);
      if (error) throw error;
      alert("📢 Pengumuman berhasil disiarkan!");
      setAnnouncement("");
    } catch (err) { alert(err.message); } finally { setIsPosting(false); }
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const fullPath = `${path}/${fileName}`;
    const { error } = await supabase.storage.from('choir-files').upload(fullPath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('choir-files').getPublicUrl(fullPath);
    return publicUrl;
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const [pdfUrl, trackS, trackA, trackT, trackB] = await Promise.all([
        uploadFile(selectedFiles.pdf, 'partiturs'),
        uploadFile(selectedFiles.s, 'audio/sopran'),
        uploadFile(selectedFiles.a, 'audio/alto'),
        uploadFile(selectedFiles.t, 'audio/tenor'),
        uploadFile(selectedFiles.b, 'audio/bass')
      ]);
      const { error } = await supabase.from("songs").insert([{
        title: newSong.title, composer: newSong.composer, pdf_url: pdfUrl,
        track_s: trackS, track_a: trackA, track_t: trackT, track_b: trackB
      }]);
      if (error) throw error;
      alert("Lagu Berhasil Diunggah!");
      setIsModalOpen(false);
      setNewSong({ title: "", composer: "" });
      setSelectedFiles({ pdf: null, s: null, a: null, t: null, b: null });
      fetchAdminData();
    } catch (err) { alert(err.message); } finally { setIsUploading(false); }
  }

  // --- LOADING UI (Dipercantik) ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-6 shadow-xl shadow-blue-100"></div>
        <p className="font-black text-[10px] text-slate-400 tracking-[0.3em] uppercase">Sinkronisasi ChoirZ...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex font-sans text-slate-900">
      
      {/* SIDEBAR (Gaya konsisten dengan card-design) */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 transition-transform hover:scale-105">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">Z</div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">ChoirZ <span className="text-blue-600">Admin</span></span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <SidebarLink active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon="📊" label="Dashboard" />
          <SidebarLink active={activeTab === "songs"} onClick={() => setActiveTab("songs")} icon="🎼" label="Koleksi Lagu" />
          <SidebarLink active={activeTab === "members"} onClick={() => setActiveTab("members")} icon="👥" label="Anggota" />
        </nav>

        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")}
          className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all mt-auto"
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
              <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab} Control</h1>
            </div>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Choir Management Console v1.0</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            + Unggah Lagu Baru
          </button>
        </header>

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Gallery Mini */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               {["choir1.png", "choir2.png", "choir3.png"].map((img, i) => (
                 <div key={i} className="h-44 rounded-[32px] overflow-hidden border-4 border-white shadow-xl hover:rotate-2 transition-transform duration-500 bg-slate-200">
                    <img src={`/${img}`} className="w-full h-full object-cover" alt="ChoirZ Activity" 
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400"} />
                 </div>
               ))}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="Total Member" value={stats.members} />
              <StatCard label="Total Lagu" value={stats.songs} />
              <StatCard label="Log Absensi" value={attendance.length} />
              <div className="bg-blue-600 p-7 rounded-[32px] shadow-lg shadow-blue-200 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-125 transition-transform">⚡</div>
                <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Server Status</p>
                <p className="text-3xl font-black tracking-tighter">ONLINE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Announcement Box */}
              <section className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative">
                <div className="flex items-center gap-3 mb-8">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">📢</span>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Broadcast Pengumuman</h2>
                </div>
                <form onSubmit={handlePostAnnouncement} className="space-y-6">
                   <textarea 
                      required
                      placeholder="Tulis pesan yang akan muncul di dashboard member..."
                      className="w-full p-7 bg-slate-50 border border-slate-100 rounded-[28px] font-bold text-sm focus:ring-8 focus:ring-blue-500/5 focus:bg-white outline-none transition-all min-h-[160px] placeholder:text-slate-300"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                   />
                   <div className="flex flex-col md:flex-row gap-4">
                      <select 
                         value={announcementType}
                         onChange={(e) => setAnnouncementType(e.target.value)}
                         className="bg-slate-50 p-4 px-6 rounded-[20px] font-black text-[10px] uppercase tracking-widest border-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-500"
                      >
                        <option value="info">ℹ️ Info Biasa</option>
                        <option value="warning">⚠️ Peringatan</option>
                        <option value="important">🔥 Sangat Penting</option>
                      </select>
                      <button 
                        disabled={isPosting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isPosting ? "MENGIRIM..." : "SIARKAN SEKARANG"}
                      </button>
                   </div>
                </form>
              </section>

              {/* Attendance Log Mini */}
              <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">Log Absensi Terbaru</h2>
                 <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
                    {attendance.length > 0 ? attendance.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div>
                          <p className="text-[11px] font-black text-slate-900 leading-none mb-2 uppercase">{item.profiles?.full_name}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.profiles?.voice_type}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full font-black text-[8px] tracking-widest ${item.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {item.status === 'present' ? 'HADIR' : 'IZIN'}
                        </span>
                      </div>
                    )) : <p className="text-slate-300 text-center italic text-xs py-20 uppercase tracking-widest">Belum ada aktivitas.</p>}
                 </div>
              </section>
            </div>
          </div>
        )}

        {/* --- TAB: KOLEKSI LAGU (Logic Tetap) --- */}
        {activeTab === "songs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/80 border-b">
                     <tr>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Judul Karya</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Komposer</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Berkas</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 font-bold text-sm">
                     {allSongsData.length > 0 ? allSongsData.map((song, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-8 text-slate-900 font-black tracking-tight">{song.title}</td>
                          <td className="p-8 text-slate-400 italic text-xs">by {song.composer}</td>
                          <td className="p-8 text-right">
                             <a href={song.pdf_url} target="_blank" className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Preview PDF</a>
                          </td>
                        </tr>
                     )) : (
                        <tr><td colSpan="3" className="p-32 text-center text-slate-300 italic uppercase text-xs tracking-[0.3em]">Dataset Kosong</td></tr>
                     )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* --- TAB: ANGGOTA (Logic Tetap) --- */}
        {activeTab === "members" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Database Suara Member</h2>
                  <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    {allMembers.length} Personel
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="p-8">Profil</th>
                        <th className="p-8">Klasifikasi Suara</th>
                        <th className="p-8">Hak Akses</th>
                        <th className="p-8">Bergabung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-sm">
                      {allMembers.map((member, i) => (
                        <tr key={i} className="hover:bg-blue-50/20 transition-all group">
                          <td className="p-8 flex items-center gap-4">
                            <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-[12px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                              {member.full_name?.charAt(0)}
                            </div>
                            <span className="font-black text-slate-900 tracking-tight">{member.full_name}</span>
                          </td>
                          <td className="p-8">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                              member.voice_type?.toLowerCase() === 'sopran' ? 'bg-pink-50 text-pink-500 border border-pink-100' :
                              member.voice_type?.toLowerCase() === 'alto' ? 'bg-purple-50 text-purple-500 border border-purple-100' :
                              member.voice_type?.toLowerCase() === 'tenor' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                              'bg-orange-50 text-orange-500 border border-orange-100'
                            }`}>
                              {member.voice_type || 'NONE'}
                            </span>
                          </td>
                          <td className="p-8">
                             <div className={`text-[10px] font-black uppercase tracking-widest ${member.role === 'admin' ? 'text-blue-600' : 'text-slate-300'}`}>
                               {member.role}
                             </div>
                          </td>
                          <td className="p-8 text-slate-300 text-[11px] font-black">
                            {new Date(member.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
        )}

        {/* --- MODAL UPLOAD (Dipercantik) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl p-12 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black tracking-tighter">Digitalize <span className="text-blue-600">Song</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">✕</button>
              </div>
              
              <form onSubmit={handleAddSong} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Judul Lagu</label>
                    <input required className="w-full p-5 bg-slate-50 border-none rounded-[24px] font-black text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" type="text" value={newSong.title} onChange={(e) => setNewSong({...newSong, title: e.target.value})} placeholder="Ex: O Fortuna" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Komposer</label>
                    <input required className="w-full p-5 bg-slate-50 border-none rounded-[24px] font-black text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" type="text" value={newSong.composer} onChange={(e) => setNewSong({...newSong, composer: e.target.value})} placeholder="Ex: Carl Orff" />
                  </div>
                </div>

                <div className="p-10 bg-blue-50/50 rounded-[40px] border-4 border-dashed border-blue-100 text-center group hover:bg-blue-50 transition-colors">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 block text-blue-600">Sheet Music (PDF)</label>
                  <input type="file" accept=".pdf" required onChange={(e) => setSelectedFiles({...selectedFiles, pdf: e.target.files[0]})} className="text-[10px] font-black text-slate-400 cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['s', 'a', 't', 'b'].map((part) => (
                    <div key={part} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 hover:border-blue-200 transition-all">
                      <label className="text-[9px] font-black uppercase tracking-widest mb-3 block text-slate-400">Audio {part.toUpperCase()}</label>
                      <input type="file" accept="audio/*" onChange={(e) => setSelectedFiles({...selectedFiles, [part]: e.target.files[0]})} className="text-[9px] font-black text-blue-500 w-full" />
                    </div>
                  ))}
                </div>

                <button 
                  disabled={isUploading}
                  type="submit" 
                  className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${isUploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-slate-900 text-white shadow-blue-200'}`}
                >
                  {isUploading ? "PROCESS UPLOADING..." : "SYNC TO CLOUD"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---

function SidebarLink({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${
        active ? "bg-blue-600 text-white shadow-xl shadow-blue-100 -translate-y-1" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="text-lg">{icon}</span> {label}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}