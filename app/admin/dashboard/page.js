"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  // --- STATES DATA ---
  const [stats, setStats] = useState({ members: 0, songs: 0 });
  const [allSongsData, setAllSongsData] = useState([]);
  const [allMembers, setAllMembers] = useState([]); // State untuk list anggota
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

  // --- LOGIKA FETCH DATA ---
  async function fetchAdminData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      // Cek Role Admin
      const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (myProfile?.role !== 'admin') { 
        window.location.href = "/member/dashboard"; 
        return; 
      }

      // 1. Fetch Anggota (Semua Profil)
      const { data: profilesList } = await supabase
        .from("profiles")
        .select("full_name, voice_type, role, created_at")
        .order("full_name", { ascending: true });
      
      setAllMembers(profilesList || []);

      // 2. Fetch Lagu
      const { data: songsList } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });
      
      setAllSongsData(songsList || []);

      // 3. Fetch Absensi (Relasi dengan Profil & Aktivitas)
      const { data: attData } = await supabase
        .from("attendance")
        .select(`status, created_at, profiles(full_name, voice_type), activities(title)`)
        .order("created_at", { ascending: false });

      setAttendance(attData || []);

      // 4. Update Stats
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

  // --- HANDLER PENGUMUMAN ---
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

  // --- HANDLER UPLOAD FILE ---
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

  // --- UI COMPONENTS ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="font-black text-xs text-slate-400 tracking-widest uppercase">Sinkronisasi ChoirZ...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">C</div>
          <span className="text-2xl font-black tracking-tighter text-blue-600">ChoirZ</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black text-sm transition-all ${
              activeTab === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("songs")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black text-sm transition-all ${
              activeTab === "songs" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <span>🎼</span> Koleksi Lagu
          </button>
          <button 
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black text-sm transition-all ${
              activeTab === "members" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <span>👥</span> Anggota
          </button>
        </nav>

        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")}
          className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-[20px] font-black text-sm transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab} Panel</h1>
            <p className="text-slate-400 font-medium text-sm">Manajemen sistem paduan suara.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest"
          >
            + Lagu Baru
          </button>
        </header>

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               {["choir1.png", "choir2.png", "choir3.png"].map((img, i) => (
                 <div key={i} className="h-44 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-slate-200">
                    <img src={`/${img}`} className="w-full h-full object-cover" alt="Choir Activity" 
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400"} />
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Anggota" value={stats.members} />
              <StatCard label="Lagu" value={stats.songs} />
              <StatCard label="Absensi" value={attendance.length} />
              <div className="bg-blue-600 p-6 rounded-[28px] shadow-lg shadow-blue-100 text-white">
                <p className="text-[10px] font-black opacity-70 uppercase mb-1">Status</p>
                <p className="text-2xl font-black tracking-tighter italic uppercase">Live</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <section className="lg:col-span-2 bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 italic"># Broadcast Announcement</h2>
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                   <textarea 
                      required
                      placeholder="Apa pengumuman hari ini?"
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all min-h-[140px]"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                   />
                   <div className="flex flex-col md:flex-row gap-4">
                      <select 
                         value={announcementType}
                         onChange={(e) => setAnnouncementType(e.target.value)}
                         className="bg-slate-50 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="info">ℹ️ Info</option>
                        <option value="warning">⚠️ Peringatan</option>
                        <option value="important">📢 Penting</option>
                      </select>
                      <button 
                        disabled={isPosting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                      >
                        {isPosting ? "Mengirim..." : "Kirim Sekarang"}
                      </button>
                   </div>
                </form>
              </section>

              <section className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
                 <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Log Absensi</h2>
                 <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
                    {attendance.length > 0 ? attendance.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{item.profiles?.full_name || "Unknown"}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.profiles?.voice_type || "-"}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-black text-[9px] ${item.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {item.status === 'present' ? 'HADIR' : 'IZIN'}
                        </span>
                      </div>
                    )) : <p className="text-slate-300 text-center italic text-sm py-10">Belum ada absensi hari ini.</p>}
                 </div>
              </section>
            </div>
          </div>
        )}

        {/* --- TAB: KOLEKSI LAGU --- */}
        {activeTab === "songs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Lagu</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Komposer</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 font-bold text-sm">
                      {allSongsData.length > 0 ? allSongsData.map((song, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">{song.title}</td>
                          <td className="p-6 text-slate-400">{song.composer}</td>
                          <td className="p-6 text-right">
                             <a href={song.pdf_url} target="_blank" className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all mr-2">Partitur</a>
                             <button className="text-red-400 hover:text-red-600 p-2">✕</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="p-20 text-center text-slate-300 italic">Belum ada koleksi lagu.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* --- TAB: ANGGOTA (REPAIRED) --- */}
        {activeTab === "members" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Database Anggota Choir</h2>
                  <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">
                    {allMembers.length} Terdaftar
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="p-6">Nama Lengkap</th>
                        <th className="p-6">Tipe Suara</th>
                        <th className="p-6">Role</th>
                        <th className="p-6">Tanggal Gabung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-sm">
                      {allMembers.length > 0 ? allMembers.map((member, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                          <td className="p-6 flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-[11px] font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {member.full_name?.charAt(0).toUpperCase()}
                            </div>
                            {member.full_name}
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                              member.voice_type === 'Sopran' ? 'bg-pink-100 text-pink-600' :
                              member.voice_type === 'Alto' ? 'bg-purple-100 text-purple-600' :
                              member.voice_type === 'Tenor' ? 'bg-blue-100 text-blue-600' :
                              member.voice_type === 'Bass' ? 'bg-orange-100 text-orange-600' :
                              'bg-slate-100 text-slate-400'
                            }`}>
                              {member.voice_type || 'N/A'}
                            </span>
                          </td>
                          <td className="p-6 uppercase text-[10px] tracking-widest">
                            <span className={member.role === 'admin' ? "text-blue-600 font-black" : "text-slate-400 font-bold"}>
                              {member.role}
                            </span>
                          </td>
                          <td className="p-6 text-slate-400 text-xs">
                            {new Date(member.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="p-20 text-center text-slate-300 italic">Data anggota tidak ditemukan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
        )}

        {/* --- MODAL UPLOAD LAGU --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Tambah Lagu</h2>
                <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
              </div>
              
              <form onSubmit={handleAddSong} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Judul</label>
                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" type="text" value={newSong.title} onChange={(e) => setNewSong({...newSong, title: e.target.value})} placeholder="Ketik judul..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Komposer</label>
                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" type="text" value={newSong.composer} onChange={(e) => setNewSong({...newSong, composer: e.target.value})} placeholder="Pencipta..." />
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-[24px] border-2 border-dashed border-blue-200 text-center">
                  <label className="text-xs font-black uppercase mb-3 block text-blue-600">File Partitur (PDF)</label>
                  <input type="file" accept=".pdf" required onChange={(e) => setSelectedFiles({...selectedFiles, pdf: e.target.files[0]})} className="text-[10px] mx-auto" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['s', 'a', 't', 'b'].map((part) => (
                    <div key={part} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black uppercase mb-2 block text-slate-400">Audio {part.toUpperCase()}</label>
                      <input type="file" accept="audio/*" onChange={(e) => setSelectedFiles({...selectedFiles, [part]: e.target.files[0]})} className="text-[9px] w-full" />
                    </div>
                  ))}
                </div>

                <button 
                  disabled={isUploading}
                  type="submit" 
                  className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl transition-all ${isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
                >
                  {isUploading ? "SEDANG MENGIRIM DATA..." : "SIMPAN LAGU"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Komponen Kecil untuk Stats
function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}