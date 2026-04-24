"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, songs: 0 });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // State Pengumuman
  const [announcement, setAnnouncement] = useState("");
  const [announcementType, setAnnouncementType] = useState("info");
  const [isPosting, setIsPosting] = useState(false);

  // State Modal & Form Lagu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", composer: "" });
  const [selectedFiles, setSelectedFiles] = useState({
    pdf: null, s: null, a: null, t: null, b: null
  });

  async function fetchAdminData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (myProfile?.role !== 'admin') { 
        alert("Akses Ditolak!"); 
        window.location.href = "/member/dashboard"; 
        return; 
      }

      const { data: allProfiles } = await supabase.from("profiles").select("role");
      const { data: allSongs } = await supabase.from("songs").select("id");
      const { data: attData } = await supabase
        .from("attendance")
        .select(`status, profiles(full_name, voice_type), activities(title)`)
        .order("created_at", { ascending: false });

      setStats({ 
        members: allProfiles?.filter(p => p.role === 'member').length || 0, 
        songs: allSongs?.length || 0 
      });
      setAttendance(attData || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchAdminData(); }, []);

  // --- LOGIK PENGUMUMAN ---
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const { error } = await supabase
        .from("announcements")
        .insert([{ content: announcement, type: announcementType }]);

      if (error) throw error;
      alert("📢 Pengumuman berhasil dikirim ke semua anggota!");
      setAnnouncement("");
    } catch (error) {
      alert("Gagal kirim pengumuman: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  // --- LOGIK UPLOAD LAGU ---
  const uploadFile = async (file, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const fullPath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('choir-files')
      .upload(fullPath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('choir-files')
      .getPublicUrl(fullPath);
    
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
        title: newSong.title,
        composer: newSong.composer,
        pdf_url: pdfUrl,
        track_s: trackS,
        track_a: trackA,
        track_t: trackT,
        track_b: trackB
      }]);

      if (error) throw error;
      alert("Lagu Berhasil Diunggah!");
      setIsModalOpen(false);
      setNewSong({ title: "", composer: "" });
      setSelectedFiles({ pdf: null, s: null, a: null, t: null, b: null });
      fetchAdminData();
    } catch (error) {
      alert("Gagal mengunggah: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold animate-bounce text-blue-600 font-sans">Loading Dashboard Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-20">
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-md sticky top-0 z-40">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">ChoirZ ADMIN</h1>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.href="/login")} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all">LOGOUT</button>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
        
        {/* PANEL PENGUMUMAN - NEW FITUR */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm mb-8 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-600 text-white p-2 rounded-lg text-xs font-black">NEW</span>
            <h2 className="font-black text-sm uppercase tracking-widest text-slate-700">Kirim Pengumuman Cepat</h2>
          </div>
          <form onSubmit={handlePostAnnouncement} className="flex flex-col md:flex-row gap-3">
            <input 
              required
              className="flex-1 p-4 bg-gray-100 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Contoh: Latihan hari ini pindah ke Aula Utama ya!"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
            <div className="flex gap-2">
              <select 
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="p-4 bg-gray-100 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="info">ℹ️ Info</option>
                <option value="warning">⚠️ Peringatan</option>
                <option value="important">📢 Penting</option>
              </select>
              <button 
                disabled={isPosting}
                type="submit" 
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-400"
              >
                {isPosting ? "KIRIM..." : "KIRIM"}
              </button>
            </div>
          </form>
        </section>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border-b-4 border-blue-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Anggota</p>
            <p className="text-4xl font-black">{stats.members}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border-b-4 border-emerald-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Koleksi Lagu</p>
            <p className="text-4xl font-black">{stats.songs}</p>
          </div>
        </div>

        {/* RECENT ATTENDANCE */}
        <div className="bg-white rounded-[32px] shadow-sm overflow-hidden mb-8 border border-gray-100">
          <div className="p-6 bg-gray-50/50 border-b font-black text-xs uppercase tracking-widest text-slate-500">Monitoring Absensi</div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-gray-50">
                {attendance.length > 0 ? attendance.map((item, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-bold">{item.profiles?.full_name}</td>
                    <td className="p-4 uppercase text-gray-400 font-black">{item.profiles?.voice_type}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-black text-[10px] ${item.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {item.status === 'present' ? 'HADIR' : 'IZIN'}
                      </span>
                    </td>
                  </tr>
                )) : <tr><td className="p-10 text-center text-gray-300 italic">Belum ada data kehadiran.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* UPLOAD BUTTON */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>🎵</span> UPLOAD LAGU BARU (MP3/PDF)
        </button>

        {/* MODAL UPLOAD LAGU */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Input Partitur & Audio</h2>
              <p className="text-gray-400 text-sm mb-8 font-medium">Lagu akan otomatis muncul di aplikasi Member.</p>
              
              <form onSubmit={handleAddSong} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-black uppercase mb-1 block">Judul Lagu</label>
                    <input required className="w-full p-4 bg-gray-100 rounded-2xl border-none font-bold" type="text" value={newSong.title} onChange={(e) => setNewSong({...newSong, title: e.target.value})} placeholder="Judul lagu..." />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-black uppercase mb-1 block">Komposer</label>
                    <input required className="w-full p-4 bg-gray-100 rounded-2xl border-none font-bold" type="text" value={newSong.composer} onChange={(e) => setNewSong({...newSong, composer: e.target.value})} placeholder="Nama komposer..." />
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-[24px] border-2 border-dashed border-blue-200">
                  <label className="text-xs font-black uppercase mb-2 block text-blue-600">File Partitur (Wajib PDF)</label>
                  <input type="file" accept=".pdf" required onChange={(e) => setSelectedFiles({...selectedFiles, pdf: e.target.files[0]})} className="text-xs font-bold block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['s', 'a', 't', 'b'].map((part) => (
                    <div key={part} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <label className="text-[10px] font-black uppercase mb-2 block opacity-50">
                        Audio {part === 's' ? 'Sopran' : part === 'a' ? 'Alto' : part === 't' ? 'Tenor' : 'Bass'}
                      </label>
                      <input type="file" accept="audio/*" onChange={(e) => setSelectedFiles({...selectedFiles, [part]: e.target.files[0]})} className="text-[10px] w-full cursor-pointer" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    disabled={isUploading}
                    type="submit" 
                    className={`flex-1 ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-2xl font-black shadow-lg transition-all`}
                  >
                    {isUploading ? "SEDANG MENGUNGGAH..." : "MULAI UPLOAD"}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-gray-400 font-bold hover:text-red-500">BATAL</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}