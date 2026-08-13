/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

import { 
  Menu, X, MapPin, Instagram, AlertTriangle, LogOut, 
  Calendar, Wallet, ClipboardList, MessageCircle, Clock, Shirt, Star, QrCode,
  Users, Info, FileText, CheckCircle, XCircle, Camera, Edit2, UserCircle, Image as ImageIcon, Trash2, Plus,
  Lock, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

type User = {
  nama: string;
  posisi: string;
  wa: string;
  id: string;
  password?: string;
  paymentCycle?: 'mingguan' | 'bulanan';
  isPaid?: boolean;
  lastPaymentDate?: string | null;
  lastActive?: number;
  role?: 'member' | 'admin';
  status?: 'pending' | 'active' | 'rejected';
  avatarUrl?: string;
};

type Schedule = {
  id: string;
  type: 'rutin' | 'laga';
  title: string;
  time: string;
  location: string;
  jersey: string;
};

type Announcement = {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  content: string;
  date: string;
};

type GalleryPhoto = {
  id: string;
  url: string;
  uploader: string;
  date: string;
};

type AppSettings = {
  activePaymentCycle?: 'mingguan' | 'bulanan';
  kasMingguan: number;
  kasBulanan: number;
  jadwalList: Schedule[];
  announcements: Announcement[];
  qrisImageUrl?: string;
  bgVideoUrl?: string;
  bgInsideUrl?: string;
  gallery: GalleryPhoto[];
  adminWa?: string;
  adminPassword?: string;
};

const defaultSettings: AppSettings = {
  activePaymentCycle: 'mingguan',
  kasMingguan: 20000,
  kasBulanan: 80000,
  adminWa: '081244558899',
  adminPassword: 'admin',
  bgVideoUrl: '/logo-futsar.mp4',
  bgInsideUrl: '/logo-futsar.mp4',
  gallery: [],
  jadwalList: [
    {
      id: '1',
      type: 'rutin',
      title: 'Latihan Rutin',
      time: 'Sabtu Malam, 19.30 WIB - Selesai',
      location: 'Lapangan/Gor Batung',
      jersey: 'Bebas'
    },
    {
      id: '2',
      type: 'laga',
      title: 'FUTSAR vs GARUDA',
      time: 'Sabtu, 15 Aug • 19:30 WIB',
      location: 'GOR Batung, Field A',
      jersey: 'Gold (Home)'
    }
  ],
  announcements: [
    {
      id: 'a1',
      tag: 'Hari ini',
      tagColor: '#9b59b6',
      title: 'Pembaruan Sistem Aplikasi',
      content: 'Sistem Kas baru telah aktif! Mohon semua anggota mengecek tagihan dan melakukan pelunasan.',
      date: '11 Aug 2026'
    },
    {
      id: 'a2',
      tag: 'Penting',
      tagColor: '#d4af37',
      title: 'Pembuatan Jersey Baru',
      content: 'Bagi yang belum setor ukuran jersey terbaru, harap segera melapor ke admin grup WA selambat-lambatnya minggu ini.',
      date: '10 Aug 2026'
    }
  ]
};

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'daftar' | 'masuk' | 'jadwal' | 'kas' | 'admin_login' | 'rekap_kas' | 'taktik' | 'info' | 'chat_admin' | 'profile' | 'gallery' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Presence Tracking
  useEffect(() => {
    if (user && user.role !== 'admin' && user.wa) {
      const updatePresence = async () => {
        try {
          await updateDoc(doc(db, "users", user.wa), { lastActive: Date.now() });
        } catch (e) {
          console.error(e);
        }
      };
      
      updatePresence();
      const interval = setInterval(updatePresence, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.wa]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const parsed = docSnap.data() as AppSettings;
        setSettings({ 
          ...defaultSettings, 
          ...parsed, 
          jadwalList: parsed.jadwalList || defaultSettings.jadwalList,
          announcements: parsed.announcements || defaultSettings.announcements 
        });
      } else {
        setDoc(doc(db, "settings", "global"), defaultSettings);
      }
      setIsSettingsLoaded(true);
    });

    const savedWa = localStorage.getItem('futsar_user_wa');
    let unsubUser: () => void;
    if (savedWa && savedWa !== 'ADMIN') {
      unsubUser = onSnapshot(doc(db, "users", savedWa), (docSnap) => {
        if (docSnap.exists()) {
          setUser(docSnap.data() as User);
        } else {
          setUser(null);
          localStorage.removeItem('futsar_user_wa');
        }
        setIsLoaded(true);
      });
    } else if (savedWa === 'ADMIN') {
      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: 'ADMIN',
        id: 'ADMIN',
        role: 'admin'
      };
      setUser(adminUser);
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }

    return () => {
      unsubSettings();
      if (unsubUser) unsubUser();
    };
  }, []);

  const fetchAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as User);
    });
    setAllUsers(users);
  };

  useEffect(() => {
    if (activeModal === 'rekap_kas') {
      fetchAllUsers();
    }
  }, [activeModal]);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await setDoc(doc(db, "settings", "global"), newSettings);
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = formData.get('wa') as string;
    const nama = formData.get('nama') as string;
    const posisi = formData.get('posisi') as string;
    const password = formData.get('password') as string;

    const newUser: User = {
      nama,
      posisi,
      wa,
      id: `FTS${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-2K26`,
      password,
      status: 'pending'
    };

    // Save to Firestore
    setDoc(doc(db, "users", wa), newUser).then(() => {
      localStorage.setItem('futsar_user_wa', wa);
      setUser(newUser);
      setActiveModal(null);
    });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = formData.get('wa') as string;
    const password = formData.get('password') as string;

    const userDoc = await getDoc(doc(db, "users", wa));
    
    if (userDoc.exists()) {
      const savedAccount = userDoc.data() as User;
      if (savedAccount.password === password) {
        localStorage.setItem('futsar_user_wa', wa);
        setUser(savedAccount);
        setActiveModal(null);
        setLoginError(false);
        return;
      }
    }
    
    setLoginError(true);
    setTimeout(() => setLoginError(false), 400); // Reset shake animation
  };

  const handleAdminLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = formData.get('wa') as string;
    const password = formData.get('password') as string;

    const validWa = settings.adminWa || '081244558899';
    const validPassword = settings.adminPassword || 'admin';

    if (wa === validWa && password === validPassword) {
      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: 'ADMIN',
        id: 'ADMIN',
        role: 'admin'
      };
      localStorage.setItem('futsar_user_wa', 'ADMIN');
      setUser(adminUser);
      setActiveModal(null);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 400);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('futsar_user_wa');
    setUser(null);
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const posisi = formData.get('posisi') as string;

    const updatedUser = { ...user, posisi };
    
    await updateDoc(doc(db, "users", user.wa), { posisi });
    // User state is updated via onSnapshot
    
    alert('Profil berhasil diperbarui!');
    setActiveModal(null);
  };

  const handleProfileAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          updateDoc(doc(db, "users", user.wa), { avatarUrl: dataUrl }).catch(console.error);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getNextDueDate = (userData: User) => {
    const date = userData.lastPaymentDate ? new Date(userData.lastPaymentDate) : new Date();
    const cycle = settings.activePaymentCycle || 'mingguan';
    if (cycle === 'bulanan') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (userData: User) => {
    if (!userData.lastPaymentDate) return 0;
    const dueDate = new Date(userData.lastPaymentDate);
    if (settings.activePaymentCycle === 'bulanan') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else {
      dueDate.setDate(dueDate.getDate() + 7);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddGalleryLink = () => {
    if (!user) return;
    const link = prompt('Masukkan Link URL Foto (Contoh: https://contoh.com/foto.jpg):');
    if (link && link.trim() !== '') {
      const newPhoto: GalleryPhoto = {
        id: Math.random().toString(36).substr(2, 9),
        url: link.trim(),
        uploader: user.nama,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      const newSettings = { ...settings, gallery: [newPhoto, ...(settings.gallery || [])] };
      updateSettings(newSettings);
      alert('Foto berhasil ditambahkan ke Galeri via Link!');
    }
  };

  const handleDeleteGallery = (id: string) => {
    if (confirm('Yakin ingin menghapus foto ini?')) {
      const newGallery = (settings.gallery || []).filter((p) => p.id !== id);
      const newSettings = { ...settings, gallery: newGallery };
      updateSettings(newSettings);
    }
  };



  if (!isLoaded || !isSettingsLoaded) return null;

  return (
    <main className="min-h-screen w-full bg-black text-white overflow-x-hidden relative flex flex-col">
      {/* Global Media Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        {(() => {
          const activeBg = user ? (settings.bgInsideUrl || '/logo-futsar.mp4') : (settings.bgVideoUrl || '/logo-futsar.mp4');
          const isVideo = activeBg.match(/\.(mp4|webm|ogg)$/i) || activeBg.includes('youtube.com') || activeBg === '/logo-futsar.mp4';
          
          if (isVideo) {
            return (
              <video 
                key={activeBg}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
              >
                <source src={activeBg} />
              </video>
            );
          }
          
          return (
            <img 
              key={activeBg}
              src={activeBg} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518605368461-1ee51188cd8d?q=80&w=2000&auto=format&fit=crop'; }}
            />
          );
        })()}
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>
      </div>
      
      {/* Global Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.08)_0%,transparent_60%)] z-0 pointer-events-none"></div>
      
      {/* --- NOT LOGGED IN: HERO SECTION --- */}
      {!user && (
        <div className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between p-6 z-10 overflow-hidden">

          {/* Top Menu Button */}
          <div className="w-full flex justify-between items-center z-50 pt-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-[#d4af37] bg-black/40 backdrop-blur-md p-3 rounded-full border border-[#d4af37]/30 hover:bg-[#d4af37]/20 transition active:scale-95 shadow-lg"
              title="Buka Menu Sidebar"
            >
              <Menu size={26} />
            </button>

          </div>

          {/* Centered Content Card */}
          <div className="relative z-20 text-center w-full max-w-[380px] my-auto py-8 px-6 bg-black/50 backdrop-blur-xl border border-[#d4af37]/30 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <div className="text-[13px] font-bold tracking-[3px] mb-1 uppercase text-[#ddd]">
              Welcome To Mini Site
            </div>
            <h1 className="text-[48px] sm:text-[55px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffe89c] via-[#d4af37] to-[#997913] mb-6 drop-shadow-[0_4px_25px_rgba(212,175,55,0.5)] tracking-[4px] leading-tight">
              FUTSAR
            </h1>
            
            <div className="flex flex-col gap-3.5">
              <button 
                onClick={() => setActiveModal('daftar')}
                className="w-full py-3.5 rounded-full text-[15px] font-bold uppercase tracking-[2px] bg-gradient-to-r from-[#d4af37] to-[#b8911f] text-[#0a0a0a] shadow-[0_5px_25px_rgba(212,175,55,0.4)] transition-all active:scale-95 hover:brightness-110"
              >
                Daftar
              </button>
              <button 
                onClick={() => setActiveModal('masuk')}
                className="w-full py-3.5 rounded-full text-[15px] font-bold uppercase tracking-[2px] bg-black/40 text-white border-2 border-[#d4af37] transition-all active:scale-95 hover:bg-[#d4af37]/20"
              >
                Masuk
              </button>
            </div>
            
            <button 
              className="mt-6 text-[12px] font-bold text-[#aaa] hover:text-[#d4af37] transition-colors flex items-center justify-center gap-1.5 mx-auto py-1" 
              onClick={() => setActiveModal('admin_login')}
            >
              <Lock size={14} className="text-[#d4af37]" />
              Admin
            </button>
          </div>

          {/* Footer Credits */}
          <div className="relative z-20 text-center text-[10px] text-[#aaa] tracking-[1px] flex flex-col items-center gap-2 pb-2">
            <div>&copy; 2K26 website mini futsar club By T0M_^</div>
          </div>
        </div>
      )}

      {/* --- LOGGED IN: PENDING STATUS --- */}
      {user && user.role !== 'admin' && user.status === 'pending' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 z-10 animate-in fade-in duration-500 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none z-0"></div>
           <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-8 md:p-12 rounded-3xl text-center max-w-md w-full relative z-10 shadow-2xl">
             <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <Clock size={40} className="text-[#d4af37] animate-pulse" />
             </div>
             <h2 className="text-[#d4af37] text-2xl font-black uppercase tracking-[2px] mb-4">Menunggu Persetujuan</h2>
             <p className="text-[#888] text-[13px] leading-relaxed mb-8">
               Pendaftaran Anda sebagai <b>{user.nama}</b> sedang diproses oleh pengurus klub. Silakan tunggu beberapa saat atau hubungi admin.
             </p>
             <button onClick={handleLogout} className="w-full py-4 bg-transparent border border-[#d4af37]/30 text-[#d4af37] font-bold rounded-xl hover:bg-[#d4af37]/10 transition-colors uppercase tracking-widest text-sm active:scale-95">
               Keluar Akun
             </button>
           </div>
        </div>
      )}

      {/* --- LOGGED IN: REJECTED STATUS --- */}
      {user && user.role !== 'admin' && user.status === 'rejected' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 z-10 animate-in fade-in duration-500 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,62,62,0.08)_0%,transparent_70%)] pointer-events-none z-0"></div>
           <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-8 md:p-12 rounded-3xl text-center max-w-md w-full relative z-10 shadow-2xl">
             <div className="w-20 h-20 bg-[#e53e3e]/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <XCircle size={40} className="text-[#e53e3e]" />
             </div>
             <h2 className="text-[#e53e3e] text-2xl font-black uppercase tracking-[2px] mb-4">Pendaftaran Ditolak</h2>
             <p className="text-[#888] text-[13px] leading-relaxed mb-8">
               Maaf, pendaftaran Anda tidak dapat disetujui oleh admin saat ini. Silakan hubungi pengurus untuk informasi lebih lanjut.
             </p>
             <button onClick={handleLogout} className="w-full py-4 bg-[#e53e3e] text-white font-bold rounded-xl hover:bg-[#c53030] transition-colors uppercase tracking-widest text-sm active:scale-95">
               Kembali
             </button>
           </div>
        </div>
      )}

      {/* --- LOGGED IN: DASHBOARD (ACTIVE) --- */}
      {user && user.role !== 'admin' && (!user.status || user.status === 'active') && (
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500">
          {/* Header / Nav (Immersive UI Style) */}
          <nav className="z-20 px-4 md:px-8 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-[#d4af37]/20 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center">
                 <Shirt size={24} className="text-black" />
              </div>
              <span className="font-black tracking-[4px] text-[#d4af37] text-xl md:text-2xl">FUTSAR</span>
            </div>
            
            <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-[#aaa]">
              <button className="text-[#d4af37] border-b border-[#d4af37] pb-1 cursor-default">Dashboard</button>
              <button onClick={() => setActiveModal('jadwal')} className="hover:text-white transition-colors">Jadwal</button>
              <button onClick={() => setActiveModal('kas')} className="hover:text-white transition-colors">Kas</button>
              <button onClick={() => setActiveModal('gallery')} className="hover:text-white transition-colors">Galeri</button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-[#d4af37]">STATUS</p>
                <p className="text-xs font-bold uppercase">ACTIVE MEMBER</p>
              </div>
              <button onClick={handleLogout} className="w-[45px] h-[45px] border-2 border-[#d4af37] rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#e53e3e] hover:bg-[#e53e3e]/10 transition-colors">
                <LogOut size={20} className="ml-1" /> 
              </button>
            </div>
          </nav>

          <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-8 z-10 relative">
            <section className="w-full flex flex-col gap-6">
              {/* Member Card */}
              <div className="bg-gradient-to-br from-[#151515]/70 to-[#0a0a0a]/70 backdrop-blur-md border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                  <Shirt size={240} className="text-[#d4af37]" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#d4af37]" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a]/60 backdrop-blur-sm border-2 border-[#d4af37] flex items-center justify-center">
                          <UserCircle size={32} className="text-[#d4af37]" />
                        </div>
                      )}
                      <div>
                        <h2 className="font-black text-[28px] md:text-[34px] text-[#d4af37] tracking-tight mb-0 capitalize leading-none">Welcome, {user.nama}</h2>
                        <p className="text-gray-400 text-xs mt-1">Your stats are looking good this season.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 md:gap-12 mt-6">
                      <div className="border-l-2 border-[#d4af37] pl-4">
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Member ID</p>
                        <p className="text-lg md:text-xl font-mono font-bold">{user.id}</p>
                      </div>
                      <div className="border-l-2 border-[#d4af37] pl-4">
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Position</p>
                        <p className="text-lg md:text-xl font-bold uppercase">{user.posisi}</p>
                      </div>
                      <div className="border-l-2 border-[#d4af37] pl-4">
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Contact</p>
                        <p className="text-lg md:text-xl font-bold">{user.wa}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setActiveModal('profile')} className="self-start px-4 py-2 bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#d4af37]/10 transition-colors active:scale-95 shrink-0">
                    <Edit2 size={14} /> Edit Profil
                  </button>
                </div>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                <button onClick={() => setActiveModal('jadwal')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#d4af37]/10 p-3 rounded-xl">
                      <Calendar className="text-[#d4af37]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Jadwal Main</h3>
                    <p className="text-xs text-gray-500">Info lokasi dan waktu</p>
                  </div>
                </button>

                <button onClick={() => setActiveModal('kas')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#27ae60]/10 p-3 rounded-xl">
                      <Wallet className="text-[#27ae60]" size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${user.isPaid ? 'bg-[#27ae60] text-white' : 'bg-[#e53e3e] text-white'}`}>
                      {user.isPaid ? 'Lunas' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Tagihan Kas</h3>
                    <p className="text-xs text-gray-500">Bayar kas individu</p>
                  </div>
                </button>

                <button onClick={() => setActiveModal('rekap_kas')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#e67e22]/10 p-3 rounded-xl">
                      <Users className="text-[#e67e22]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Catatan Kas</h3>
                    <p className="text-xs text-gray-500">Status bayar semua anggota</p>
                  </div>
                </button>

                <button onClick={() => setActiveModal('gallery')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#9b59b6]/10 p-3 rounded-xl">
                      <ImageIcon className="text-[#9b59b6]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Galeri</h3>
                    <p className="text-xs text-gray-500">Foto momen kebersamaan</p>
                  </div>
                </button>

                <button onClick={() => setActiveModal('taktik')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#3498db]/10 p-3 rounded-xl">
                      <ClipboardList className="text-[#3498db]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Taktik</h3>
                    <p className="text-xs text-gray-500">Formasi dan peran</p>
                  </div>
                </button>
                
                <button onClick={() => setActiveModal('info')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#9b59b6]/10 p-3 rounded-xl">
                      <Info className="text-[#9b59b6]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Info & Pengumuman</h3>
                    <p className="text-xs text-gray-500">Kabar terbaru klub</p>
                  </div>
                </button>

                <button onClick={() => setActiveModal('chat_admin')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Chat Admin</h3>
                    <p className="text-xs text-gray-500">Hubungi pengurus</p>
                  </div>
                </button>
              </div>
            </section>
          </main>
          
          {/* Footer for logged in */}
          <footer className="px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-gray-600 bg-black z-20 gap-2 mt-auto">
            <div className="tracking-widest uppercase">&copy; 2026 FUTSAR CLUB • OFFICIALLY REGISTERED</div>
            <div className="flex gap-4">
              <span className="text-[#d4af37]">V2.4.0-STABLE</span>
              <span>SYSTEM ONLINE</span>
            </div>
          </footer>
        </div>
      )}

      {/* --- SIDEBAR MENU --- */}
      <div className={`fixed top-0 left-0 w-[280px] h-full bg-[#0a0a0a]/95 backdrop-blur-md z-[200] transition-transform duration-300 ease-in-out p-[30px] shadow-[5px_0_20px_rgba(0,0,0,0.8)] border-r border-[#d4af37]/20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-right text-[24px] text-[#d4af37] cursor-pointer mb-5 flex justify-end" onClick={() => setIsSidebarOpen(false)}>
          <X size={28} />
        </div>
        <h2 className="text-[#d4af37] mt-0 tracking-[1px] uppercase text-xl font-bold mb-4">Tentang !</h2>
        <p className="text-[14px] leading-[1.6] text-[#aaa]">
          Website mini ini dibuat {'{ Sel, 11 Aug 2026 }'} sebagai platform resmi untuk Member Futsar Club. Harapannya agar semua member Futsar ini bisa lebih produktif.<br/><br/>Terima Kasih!
        </p>
        <div className="mt-10 border-t border-[#333] pt-5 space-y-3">
          <p className="text-[12px] text-[#d4af37] flex items-center gap-2"><MapPin size={14}/> Basecamp: Rumah Saep</p>
          <p className="text-[12px] text-[#d4af37] flex items-center gap-2"><Instagram size={14}/> @futsar_teuing</p>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500] flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111] w-full max-w-[380px] max-h-[85vh] rounded-[15px] border border-[#d4af37] p-[25px] relative overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-300 scrollbar-thin scrollbar-thumb-[#d4af37]">
            <button onClick={() => setActiveModal(null)} className="absolute top-[15px] right-[20px] text-[#d4af37] hover:opacity-80">
              <X size={24} />
            </button>

            {/* PROFILE MODAL */}
            {activeModal === 'profile' && user && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Edit Profil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#d4af37]" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#1a1a1a]/60 backdrop-blur-sm border-4 border-[#d4af37] flex items-center justify-center">
                          <UserCircle size={48} className="text-[#d4af37]" />
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera size={24} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleProfileAvatarUpload} className="hidden" />
                      </label>
                    </div>
                    <p className="text-[10px] text-[#888] uppercase tracking-widest text-center">Ketuk untuk ganti foto</p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888] font-bold uppercase mb-1">Pilih Posisi Main</label>
                    <select name="posisi" defaultValue={user.posisi} className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37]" required>
                      <option value="Kiper">Kiper (GK)</option>
                      <option value="Anchor">Anchor (Bawah)</option>
                      <option value="Flank">Flank (Sayap)</option>
                      <option value="Pivot">Pivot (Depan)</option>
                      <option value="All-Round">All-Round (Bebas)</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full p-4 rounded-lg bg-[#d4af37] text-black text-[15px] font-black uppercase tracking-[1px] transition-transform active:scale-95 shadow-[0_5px_15px_rgba(212,175,55,0.3)]">
                    Simpan Profil
                  </button>
                </form>
              </>
            )}

            {/* DAFTAR MODAL */}
            {activeModal === 'daftar' && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Daftar Baru</h2>
                <form onSubmit={handleRegister} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nama Lengkap</label>
                    <input type="text" name="nama" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="Contoh: Budi Santoso" required />
                  </div>
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Posisi Bermain</label>
                    <select name="posisi" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors appearance-none" required defaultValue="">
                      <option value="" disabled>Pilih posisi...</option>
                      <option value="Kiper">GoalKeeper (Penjaga Gawang)</option>
                      <option value="Anchor">Anchor (Pemain Bertahan)</option>
                      <option value="Flank">Flank (Pemain Sayap / Ala)</option>
                      <option value="Pivot">Pivot (Penyerang Utama)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">No. WhatsApp</label>
                    <input type="number" name="wa" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="0812..." required />
                  </div>
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Buat Kata Sandi</label>
                    <input type="password" name="password" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="Buat sandi rahasiamu..." required minLength={4} />
                  </div>
                  <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95 mt-2">
                    Buat Akun
                  </button>
                </form>
              </>
            )}

            {/* MASUK MODAL */}
            {activeModal === 'masuk' && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Masuk Akun</h2>
                
                {loginError && (
                  <div className="bg-[#ff4d4d]/10 text-[#ff4d4d] text-[12px] font-bold text-center mb-4 p-2.5 rounded-lg border border-[#ff4d4d] flex items-center justify-center gap-2 animate-[animasiGetar_0.4s_ease]">
                    <AlertTriangle size={14} /> Nomor WA atau Kata Sandi salah!
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">No. WhatsApp</label>
                    <input type="number" name="wa" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="Masukkan No WA terdaftar" required />
                  </div>
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Kata Sandi</label>
                    <input type="password" name="password" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="********" required />
                  </div>
                  <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95 mt-2">
                    Masuk
                  </button>
                </form>
              </>
            )}

            {/* ADMIN LOGIN MODAL */}
            {activeModal === 'admin_login' && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Admin Login</h2>
                
                
                {loginError && (
                  <div className="bg-[#ff4d4d]/10 text-[#ff4d4d] text-[12px] font-bold text-center mb-4 p-2.5 rounded-lg border border-[#ff4d4d] flex items-center justify-center gap-2 animate-[animasiGetar_0.4s_ease]">
                    <AlertTriangle size={14} /> Kredensial Admin Salah!
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">No. WhatsApp Admin</label>
                    <input type="number" name="wa" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="0812..." required />
                  </div>
                  <div>
                    <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Kata Sandi</label>
                    <input type="password" name="password" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="********" required />
                  </div>
                  <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95 mt-2">
                    Masuk Admin
                  </button>
                </form>
              </>
            )}

            {/* JADWAL MODAL */}
            {activeModal === 'jadwal' && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Jadwal Main</h2>
                <p className="text-[12px] text-[#888] text-left mb-5">Berikut adalah jadwal kegiatan klub terdekat:</p>
                
                {(settings.jadwalList || []).map((jadwal) => (
                  <div key={jadwal.id} className={`bg-[#1a1a1a]/60 backdrop-blur-sm border-l-4 ${jadwal.type === 'laga' ? 'border-[#e53e3e]' : 'border-[#d4af37]'} p-4 mb-4 rounded-lg text-left shadow-[0_4px_10px_rgba(0,0,0,0.3)]`}>
                    <div className={`inline-block px-3 py-1 ${jadwal.type === 'laga' ? 'bg-[#e53e3e] text-white' : 'bg-[#d4af37] text-[#0a0a0a]'} rounded-full text-[10px] font-bold mb-2 tracking-[1px] uppercase`}>
                      {jadwal.type === 'laga' ? 'Sparing / Laga' : 'Latihan Rutin'}
                    </div>
                    <h3 className="m-0 mb-1.5 text-white text-[16px] font-bold">{jadwal.title}</h3>
                    <p className="m-1 text-[#aaa] text-[12px] flex items-center gap-2"><Clock size={12}/> {jadwal.time}</p>
                    <p className="m-1 text-[#aaa] text-[12px] flex items-center gap-2"><MapPin size={12}/> {jadwal.location}</p>
                    <p className="m-1 text-[#aaa] text-[12px] flex items-center gap-2"><Shirt size={12} className="text-[#d4af37]"/> Jersey : {jadwal.jersey}</p>
                  </div>
                ))}
                
                {settings.jadwalList.length === 0 && (
                  <p className="text-sm text-gray-500 mb-5">Belum ada jadwal terbaru.</p>
                )}

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
                  Tutup
                </button>
              </>
            )}

            {/* KAS MODAL */}
            {activeModal === 'kas' && user && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Tagihan Kas</h2>
                
                <div className="flex flex-col gap-2 mb-5 text-left">
                  <label className="text-[11px] text-[#888] font-bold uppercase tracking-[1px]">Siklus Pembayaran Aktif:</label>
                  <div className="bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/30 py-2.5 rounded-lg text-[13px] font-black uppercase text-center tracking-widest shadow-inner">
                    {(!settings.activePaymentCycle || settings.activePaymentCycle === 'mingguan') ? '/ Minggu' : '/ Bulan'}
                  </div>
                </div>

                <div className={`bg-[#1a1a1a]/60 backdrop-blur-sm border rounded-xl p-4 text-left shadow-[0_5px_15px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors ${user.isPaid ? 'border-[#27ae60]' : 'border-[#e53e3e]'}`}>
                  <Star className={`absolute top-3 right-3 opacity-20 ${user.isPaid ? 'text-[#27ae60]' : 'text-[#e53e3e]'}`} size={24} />
                  
                  <div className="flex justify-between items-center border-b border-dashed border-[#333] py-3">
                    <span className="text-[#888] text-[11px] uppercase tracking-[1px] font-semibold">Nama Member</span>
                    <span className="text-white text-[13px] font-bold text-right capitalize">{user.nama}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-[#333] py-3">
                    <span className="text-[#888] text-[11px] uppercase tracking-[1px] font-semibold">{user.isPaid ? 'Berlaku Sampai' : 'Tgl Tagihan'}</span>
                    <span className="text-white text-[13px] font-bold text-right">{user.isPaid ? getNextDueDate(user) : getTodayDate()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-[#333] py-3">
                    <span className="text-[#888] text-[11px] uppercase tracking-[1px] font-semibold">Nominal Tagihan</span>
                    <span className={`${user.isPaid ? 'text-[#27ae60]' : 'text-[#ff4d4d]'} text-[16px] font-black text-right`}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.activePaymentCycle === 'bulanan' ? settings.kasBulanan : settings.kasMingguan)}
                    </span>
                  </div>
                  {user.isPaid && (
                    <div className="flex justify-between items-center border-b border-dashed border-[#333] py-3">
                      <span className="text-[#888] text-[11px] uppercase tracking-[1px] font-semibold">Sisa Waktu</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getDaysRemaining(user) <= 0 ? 'bg-[#e53e3e]/10 text-[#ff4d4d] border-[#ff4d4d]' : getDaysRemaining(user) <= 3 ? 'bg-[#f39c12]/10 text-[#f39c12] border-[#f39c12]' : 'bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]'}`}>
                        {getDaysRemaining(user) > 0 ? `${getDaysRemaining(user)} Hari Lagi` : getDaysRemaining(user) === 0 ? 'Jatuh Tempo Hari Ini' : 'Lewat Jatuh Tempo'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#888] text-[11px] uppercase tracking-[1px] font-semibold">Status</span>
                    {user.isPaid ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getDaysRemaining(user) <= 0 ? 'bg-[#e53e3e]/10 text-[#ff4d4d] border-[#ff4d4d]' : 'bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]'}`}>
                        {getDaysRemaining(user) <= 0 ? 'KADALUARSA' : 'LUNAS'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#e53e3e]/10 text-[#ff4d4d] border border-[#ff4d4d]">BELUM LUNAS</span>
                    )}
                  </div>
                </div>

                {!user.isPaid && (
                  <div className="bg-white p-4 rounded-xl text-center mt-5">
                    <p className="text-[#333] text-[12px] font-bold m-0 mb-3">Scan QRIS untuk Membayar</p>
                    {settings.qrisImageUrl ? (
                      <div className="mx-auto w-[220px] relative rounded-lg border-2 border-dashed border-[#d4af37] p-2 flex items-center justify-center bg-gray-50 overflow-hidden">
                        <img src={settings.qrisImageUrl} alt="QRIS Futsar" className="max-w-full h-auto object-contain rounded" />
                      </div>
                    ) : (
                      <div className="mx-auto w-[180px] h-[180px] relative rounded-lg border-2 border-dashed border-[#d4af37] p-2 flex items-center justify-center bg-gray-50">
                        <QrCode size={120} className="text-[#d4af37]" />
                      </div>
                    )}
                    <div className="flex gap-2 justify-center mt-4">
                      {settings.qrisImageUrl ? (
                        <a href={settings.qrisImageUrl} download="qris_futsar.png" className="inline-block bg-black text-white px-5 py-2.5 rounded-full text-[12px] font-bold no-underline shadow-md transition-transform active:scale-95">
                          Unduh QRIS
                        </a>
                      ) : (
                        <a href="#" className="inline-block bg-black text-white px-5 py-2.5 rounded-full text-[12px] font-bold no-underline shadow-md transition-transform active:scale-95 opacity-50 cursor-not-allowed">
                          Unduh QRIS
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-4 text-[11px] color-[#aaa] text-left bg-[#25d366]/10 p-3 rounded-lg border-l-4 border-[#25d366]">
                      <p className="text-gray-600 m-0 leading-relaxed">Setelah transfer, silakan konfirmasi pembayaran ke Admin melalui WhatsApp dengan menyertakan bukti transfer.</p>
                    </div>
                  </div>
                )}
                {user.isPaid && (
                  <div className="bg-[#27ae60]/10 border border-[#27ae60] p-4 rounded-xl text-center mt-5">
                     <p className="text-[#27ae60] text-[12px] font-bold mb-2">Pembayaran Berhasil Diverifikasi!</p>
                     <p className="text-[#aaa] text-[11px]">Terima kasih telah membayar tagihan kas. Akses fasilitas lapangan aman sampai {getNextDueDate(user)}.</p>
                  </div>
                )}
              </>
            )}

            {/* REKAP KAS MODAL */}
            {activeModal === 'rekap_kas' && (
              <>
                <h2 className="text-[#d4af37] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Catatan Kas</h2>
                <p className="text-[12px] text-[#888] text-left mb-5">Status tagihan semua anggota Futsar Club yang terdaftar:</p>
                
                <div className="flex flex-col gap-3 mb-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37] pr-2">
                  {allUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Belum ada anggota yang mendaftar.</p>
                  ) : (
                    allUsers.map((u) => (
                      <div key={u.id} className={`flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border-l-4 ${u.isPaid ? 'border-[#27ae60]' : 'border-[#ff4d4d]'}`}>
                        <div className="flex flex-col text-left">
                          <span className="text-[14px] font-bold text-white capitalize">{u.nama}</span>
                          <span className="text-[10px] text-[#aaa]">{u.id} • {settings.activePaymentCycle === 'bulanan' ? 'Bulanan' : 'Mingguan'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          {u.isPaid ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#27ae60] bg-[#27ae60]/10 px-2 py-1 rounded">
                              <CheckCircle size={10} /> LUNAS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff4d4d] bg-[#e53e3e]/10 px-2 py-1 rounded">
                              <XCircle size={10} /> PENDING
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
                  Tutup
                </button>
              </>
            )}

            {/* GALLERY MODAL */}
            {activeModal === 'gallery' && (
              <>
                <div className="flex justify-between items-center mt-2 mb-5 border-b border-[#333] pb-2">
                  <h2 className="text-[#9b59b6] text-[24px] font-black uppercase tracking-[1px]">Galeri Futsar</h2>
                  {user?.role === 'admin' && (
                    <button onClick={handleAddGalleryLink} className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Tambah Link
                    </button>
                  )}
                  {user?.role !== 'admin' && (
                    <button onClick={handleAddGalleryLink} className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Tambah Link
                    </button>
                  )}
                </div>
                
                <p className="text-[12px] text-[#888] text-left mb-5">Dokumentasi momen kebersamaan dan pertandingan.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#9b59b6] pr-1">
                  {!settings.gallery || settings.gallery.length === 0 ? (
                    <div className="col-span-full py-10 text-center">
                      <ImageIcon className="mx-auto mb-2 text-[#444]" size={40} />
                      <p className="text-sm text-gray-500 italic">Belum ada foto di galeri.</p>
                    </div>
                  ) : (
                    settings.gallery.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333]">
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left">
                          <span className="text-white text-[10px] font-bold truncate">{photo.uploader}</span>
                          <span className="text-[#aaa] text-[9px]">{photo.date}</span>
                        </div>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDeleteGallery(photo.id)} className="absolute top-2 right-2 bg-black/60 text-[#e53e3e] w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* TAKTIK MODAL */}
            {activeModal === 'taktik' && (
              <>
                <h2 className="text-[#3498db] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Taktik & Formasi</h2>
                
                <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] rounded-lg p-4 mb-5 shadow-lg">
                  <div className="w-full aspect-[3/4] bg-[#27ae60]/20 rounded border-2 border-[#27ae60] relative overflow-hidden flex flex-col items-center justify-between p-4 mb-4">
                    {/* Lapangan Lines */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#27ae60]/50 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full border-2 border-[#27ae60]/50 -translate-x-1/2 -translate-y-1/2"></div>
                    
                    {/* Players 1-2-1 */}
                    <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white relative z-10 text-black text-[10px] flex items-center justify-center font-bold">P</div>
                    <div className="flex w-full justify-between px-8 relative z-10">
                      <div className="w-6 h-6 bg-[#3498db] rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold">F</div>
                      <div className="w-6 h-6 bg-[#3498db] rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold">F</div>
                    </div>
                    <div className="w-6 h-6 bg-[#e67e22] rounded-full border-2 border-white relative z-10 text-white text-[10px] flex items-center justify-center font-bold">A</div>
                    <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white relative z-10 text-black text-[10px] flex items-center justify-center font-bold">K</div>
                  </div>

                  <h3 className="text-[14px] font-bold text-white text-left mb-2">Formasi Utama: 1-2-1 (Diamond)</h3>
                  <p className="text-[12px] text-[#aaa] text-left leading-relaxed">
                    Fokus pada transisi cepat dan penguasaan area tengah. Anchor bertahan di belakang, flank melebar untuk variasi serangan, dan pivot membuka ruang di depan.
                  </p>
                </div>

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
                  Tutup
                </button>
              </>
            )}

            {/* INFO MODAL */}
            {activeModal === 'info' && (
              <>
                <h2 className="text-[#9b59b6] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Info & Kabar</h2>
                
                <div className="flex flex-col gap-4 mb-5 text-left">
                  {(settings.announcements || []).map((announcement) => (
                    <div key={announcement.id} className="bg-[#1a1a1a]/60 backdrop-blur-sm border-l-4 p-4 rounded-lg shadow-md" style={{ borderLeftColor: announcement.tagColor }}>
                      <p className="text-[10px] font-bold uppercase mb-1" style={{ color: announcement.tagColor }}>{announcement.tag} • {announcement.date}</p>
                      <p className="text-[14px] font-bold text-white mb-2">{announcement.title}</p>
                      <p className="text-[12px] text-[#aaa] leading-relaxed whitespace-pre-line">
                        {announcement.content}
                      </p>
                    </div>
                  ))}
                  {settings.announcements.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Belum ada pengumuman terbaru.</p>
                  )}
                </div>

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
                  Tutup
                </button>
              </>
            )}

            {/* CHAT ADMIN MODAL */}
            {activeModal === 'chat_admin' && (
              <>
                <h2 className="text-[#25D366] text-[24px] font-black uppercase tracking-[1px] mt-2 mb-5 border-b border-[#333] pb-2">Chat & Komunitas</h2>
                <p className="text-[12px] text-[#888] text-left mb-6 leading-relaxed">
                  Pilih saluran komunikasi WhatsApp yang ingin Anda gunakan. Anda bisa bergabung dengan grup tim atau mengirim pesan langsung ke admin (@T0M_15).
                </p>

                <div className="flex flex-col gap-4 mb-6">
                  <button 
                    onClick={() => window.open('https://chat.whatsapp.com/IPrL7B7BYoF71VC2CSRH1D', '_blank')} 
                    className="w-full bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#25D366]/50 p-4 rounded-xl flex items-center gap-4 group hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all"
                  >
                    <div className="bg-[#25D366]/20 p-3 rounded-full text-[#25D366] group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-white mb-1">Grup WhatsApp Futsar</p>
                      <p className="text-[11px] text-[#aaa]">Bergabung dengan komunitas grup</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => window.open('https://wa.me/6283813356675?text=Halo%20Admin%20@T0M_15,%20saya%20anggota%20Futsar', '_blank')} 
                    className="w-full bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#25D366]/50 p-4 rounded-xl flex items-center gap-4 group hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all"
                  >
                    <div className="bg-[#25D366]/20 p-3 rounded-full text-[#25D366] group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-white mb-1">Chat Admin Pribadi</p>
                      <p className="text-[11px] text-[#aaa]">Hubungi Admin @T0M_15 langsung</p>
                    </div>
                  </button>
                </div>

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-4 rounded-lg text-[15px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
                  Tutup
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Style for the shake animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes animasiGetar { 
          0% { transform: translateX(0); } 
          25% { transform: translateX(-5px); } 
          50% { transform: translateX(5px); } 
          75% { transform: translateX(-5px); } 
          100% { transform: translateX(0); } 
        }
      `}} />

      {/* --- ADMIN DASHBOARD --- */}
      {user && user.role === 'admin' && (
        <AdminDashboard settings={settings} onUpdateSettings={updateSettings} onLogout={handleLogout} />
      )}
    </main>
  );
}

function AdminDashboard({ settings, onUpdateSettings, onLogout }: { settings: AppSettings, onUpdateSettings: (s: AppSettings) => void, onLogout: () => void }) {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const pUsers: User[] = [];
      const aUsers: User[] = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data() as User;
        if (u.status === 'pending') {
          pUsers.push(u);
        } else if (u.status === 'active') {
          aUsers.push(u);
        }
      });
      setPendingUsers(pUsers);
      setActiveUsers(aUsers);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (wa: string) => {
    await updateDoc(doc(db, "users", wa), { status: 'active' });
  };

  const handleReject = async (wa: string) => {
    await updateDoc(doc(db, "users", wa), { status: 'rejected' });
  };

  const handleTogglePayment = async (wa: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "users", wa), { 
      isPaid: !currentStatus, 
      lastPaymentDate: !currentStatus ? new Date().toISOString() : null 
    });
  };
  
  const handleKasSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const m = parseInt(fd.get('kasMingguan') as string, 10);
    const b = parseInt(fd.get('kasBulanan') as string, 10);
    const cycle = fd.get('activePaymentCycle') as 'mingguan' | 'bulanan';
    onUpdateSettings({ ...settings, kasMingguan: m, kasBulanan: b, activePaymentCycle: cycle });
    alert('Pengaturan nominal kas dan siklus berhasil disimpan!');
  };

  const handleBgSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bgUrl = fd.get('bgVideoUrl') as string;
    const bgInside = fd.get('bgInsideUrl') as string;
    onUpdateSettings({ ...settings, bgVideoUrl: bgUrl, bgInsideUrl: bgInside });
    alert('Latar belakang berhasil diperbarui!');
  };

  const handleAdminSecuritySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newWa = fd.get('adminWa') as string;
    const newPassword = fd.get('adminPassword') as string;
    if (!newWa || !newPassword) {
      alert('Nomor WA dan Kata Sandi wajib diisi!');
      return;
    }
    onUpdateSettings({ ...settings, adminWa: newWa, adminPassword: newPassword });
    alert('Kredensial Admin berhasil diperbarui! Gunakan No. WA & Password baru ini untuk login selanjutnya.');
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateSettings({ ...settings, qrisImageUrl: base64String });
        alert('Gambar QRIS berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQris = () => {
    const newSettings = { ...settings };
    delete newSettings.qrisImageUrl;
    onUpdateSettings(newSettings);
    alert('Gambar QRIS berhasil dihapus!');
  };


  const handleAddSchedule = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newSchedule: Schedule = {
      id: Math.random().toString(36).substr(2, 9),
      type: fd.get('type') as 'rutin' | 'laga',
      title: fd.get('title') as string,
      time: fd.get('time') as string,
      location: fd.get('location') as string,
      jersey: fd.get('jersey') as string
    };
    onUpdateSettings({ ...settings, jadwalList: [...settings.jadwalList, newSchedule] });
    (e.target as HTMLFormElement).reset();
    alert('Jadwal berhasil ditambahkan!');
  };

  const handleDeleteSchedule = (id: string) => {
    onUpdateSettings({ ...settings, jadwalList: settings.jadwalList.filter(s => s.id !== id) });
  };

  const handleAddAnnouncement = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newAnnouncement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      tag: fd.get('tag') as string,
      tagColor: fd.get('tagColor') as string,
      title: fd.get('title') as string,
      content: fd.get('content') as string,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    onUpdateSettings({ ...settings, announcements: [newAnnouncement, ...(settings.announcements || [])] });
    (e.target as HTMLFormElement).reset();
    alert('Pengumuman berhasil ditambahkan!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    onUpdateSettings({ ...settings, announcements: (settings.announcements || []).filter(a => a.id !== id) });
  };

  const handleDeleteGalleryPhoto = (id: string) => {
    if (confirm('Yakin ingin menghapus foto dari galeri?')) {
      onUpdateSettings({ ...settings, gallery: (settings.gallery || []).filter(p => p.id !== id) });
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xl z-[100] flex flex-col overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.08)_0%,transparent_60%)] z-0 pointer-events-none"></div>
      
      <nav className="z-20 px-4 md:px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e53e3e] rounded-lg flex items-center justify-center">
             <AlertTriangle size={24} className="text-white" />
          </div>
          <span className="font-black tracking-[4px] text-white text-xl md:text-2xl">ADMIN PANEL</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogout} className="px-4 py-2 bg-[#1a1a1a] text-[#e53e3e] border border-[#e53e3e] rounded-lg text-xs font-bold uppercase transition-colors hover:bg-[#e53e3e] hover:text-white">
            Keluar Admin
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 z-10 flex flex-col lg:flex-row gap-8">
        
        {/* KIRI: Pengaturan Kas */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#d4af37] font-black text-xl mb-1 uppercase tracking-widest">Pengaturan Uang Kas & QRIS</h3>
            <p className="text-xs text-[#888] mb-6">Atur nominal tagihan dan kode QRIS pembayaran.</p>
            
            <form onSubmit={handleKasSubmit} className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#333]">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Siklus Pembayaran Aktif</label>
                <select name="activePaymentCycle" defaultValue={settings.activePaymentCycle || 'mingguan'} className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors">
                  <option value="mingguan">Mingguan (/ Minggu)</option>
                  <option value="bulanan">Bulanan (/ Bulan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Mingguan (Rp)</label>
                <input type="number" name="kasMingguan" defaultValue={settings.kasMingguan} className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Bulanan (Rp)</label>
                <input type="number" name="kasBulanan" defaultValue={settings.kasBulanan} className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Simpan Nominal Kas
              </button>
            </form>

            <div className="flex flex-col gap-4">
              <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Gambar QRIS (Upload)</label>
              {settings.qrisImageUrl ? (
                <div className="relative inline-block border-2 border-dashed border-[#d4af37] p-2 rounded-lg bg-gray-50 self-start">
                  <img src={settings.qrisImageUrl} alt="QRIS Futsar" className="max-w-[120px] max-h-[120px] object-contain rounded" />
                  <button type="button" onClick={handleRemoveQris} className="absolute -top-3 -right-3 bg-[#e53e3e] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#c53030] transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic mb-2">Belum ada gambar QRIS. Default placeholder akan digunakan.</div>
              )}
              <div className="relative overflow-hidden inline-block w-full">
                <button type="button" className="w-full bg-[#1a1a1a]/60 backdrop-blur-sm text-white border border-[#333] p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-white/10 transition-colors">
                  Pilih Gambar QRIS Baru
                </button>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleQrisUpload} 
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#d4af37] font-black text-xl mb-1 uppercase tracking-widest">Pengaturan Latar Belakang</h3>
            <p className="text-xs text-[#888] mb-6">Gunakan Link Foto (.jpg/.png) atau Link Video (.mp4) untuk latar belakang.</p>
            
            <form onSubmit={handleBgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Latar Halaman Depan</label>
                <input type="text" name="bgVideoUrl" defaultValue={settings.bgVideoUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Latar Halaman Dalam (Dashboard & Menu)</label>
                <input type="text" name="bgInsideUrl" defaultValue={settings.bgInsideUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar2.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Simpan Latar
              </button>
            </form>
          </div>



          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#9b59b6] font-black text-xl mb-1 uppercase tracking-widest">Tambah Pengumuman</h3>
            <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-4 mt-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Tag (Misal: Penting)</label>
                  <input type="text" name="tag" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#9b59b6]" required />
                </div>
                <div className="flex-[0.5]">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Warna Tag</label>
                  <input type="color" name="tagColor" defaultValue="#9b59b6" className="w-full h-[46px] p-1 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] cursor-pointer" required />
                </div>
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Judul Pengumuman</label>
                <input type="text" name="title" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#9b59b6]" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Isi Pengumuman</label>
                <textarea name="content" rows={4} className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#9b59b6] resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-[#9b59b6] text-white border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Tambah Info
              </button>
            </form>
          </div>

          {/* UBAH KREDENSIAL ADMIN */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#e53e3e]/40 p-6 rounded-2xl shadow-xl">
            <h3 className="text-[#e53e3e] font-black text-xl mb-1 uppercase tracking-widest flex items-center gap-2">
              <Lock size={20} /> Ubah Sandi Admin
            </h3>
            <p className="text-xs text-[#888] mb-6">Ganti No. WA dan Kata Sandi Admin agar orang lain tidak bisa masuk.</p>
            
            <form onSubmit={handleAdminSecuritySubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">No. WhatsApp Admin</label>
                <input 
                  type="text" 
                  name="adminWa" 
                  defaultValue={settings.adminWa || '081244558899'} 
                  className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#e53e3e] transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Kata Sandi Admin Baru</label>
                <input 
                  type="text" 
                  name="adminPassword" 
                  defaultValue={settings.adminPassword || 'admin'} 
                  className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#e53e3e] transition-colors" 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-[#e53e3e] text-white border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-[#c53030] transition-colors mt-2 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Simpan Kata Sandi Admin
              </button>
            </form>
          </div>
        </section>

        {/* KANAN: Pendaftar Baru & Pengaturan Jadwal */}
        <section className="flex-[1.5] flex flex-col gap-6">
          
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#3498db] font-black text-xl mb-4 uppercase tracking-widest">Pendaftar Baru ({pendingUsers.length})</h3>
            
            <div className="flex flex-col gap-3">
              {pendingUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Tidak ada pendaftar baru yang menunggu persetujuan.</p>
              ) : (
                pendingUsers.map((u) => (
                  <div key={u.wa} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#3498db] gap-4">
                    <div className="text-left">
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">{u.nama} <span className="text-[10px] text-[#3498db] ml-2">({u.id})</span></p>
                      <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • Posisi: {u.posisi}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button onClick={() => handleApprove(u.wa)} className="flex-1 md:flex-none px-4 py-2 bg-[#27ae60]/10 text-[#27ae60] hover:bg-[#27ae60] hover:text-white border border-[#27ae60] rounded-lg text-[10px] font-bold uppercase transition-colors text-center">
                        Setujui
                      </button>
                      <button onClick={() => handleReject(u.wa)} className="flex-1 md:flex-none px-4 py-2 bg-[#e53e3e]/10 text-[#e53e3e] hover:bg-[#e53e3e] hover:text-white border border-[#e53e3e] rounded-lg text-[10px] font-bold uppercase transition-colors text-center">
                        Tolak
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#27ae60] font-black text-xl mb-4 uppercase tracking-widest">Manajemen Uang Kas</h3>
            <p className="text-xs text-[#888] mb-5">Konfirmasi pembayaran anggota yang aktif.</p>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#27ae60] pr-2">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Belum ada anggota yang aktif.</p>
              ) : (
                activeUsers.map((u) => (
                  <div key={u.wa} className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 ${u.isPaid ? 'border-[#27ae60]' : 'border-[#ff4d4d]'} gap-4`}>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">{u.nama} <span className="text-[10px] text-[#aaa] ml-2">({u.id})</span></p>
                      <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • {settings.activePaymentCycle === 'bulanan' ? 'Bulanan' : 'Mingguan'}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button 
                        onClick={() => handleTogglePayment(u.wa, !!u.isPaid)} 
                        className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-[10px] font-bold uppercase transition-colors text-center ${u.isPaid ? 'bg-[#ff4d4d]/10 text-[#ff4d4d] hover:bg-[#ff4d4d] hover:text-white border-[#ff4d4d]' : 'bg-[#27ae60]/10 text-[#27ae60] hover:bg-[#27ae60] hover:text-white border-[#27ae60]'}`}
                      >
                        {u.isPaid ? 'Batalkan Kas' : 'Konfirmasi Lunas'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#9b59b6] font-black text-xl mb-4 uppercase tracking-widest">Manajemen Akun Terdaftar</h3>
            <p className="text-xs text-[#888] mb-5">Daftar semua anggota aktif. Hapus akun jika melanggar.</p>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#9b59b6] pr-2">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Belum ada anggota yang aktif.</p>
              ) : (
                activeUsers.map((u) => {
                  const now = new Date().getTime();
                  const isOnline = u.lastActive && (now - u.lastActive < 60000); // 1 menit
                  return (
                    <div key={u.wa} className="flex justify-between items-center bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#9b59b6] gap-4">
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-white uppercase tracking-wide">{u.nama}</p>
                          <span 
                            className="flex items-center justify-center w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: isOnline ? '#27ae60' : '#e53e3e', boxShadow: isOnline ? '0 0 8px rgba(39,174,96,0.5)' : 'none' }}
                            title={isOnline ? "Online" : "Offline"}
                          ></span>
                        </div>
                        <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • Sandi: {u.password || '-'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus akun ${u.nama}?`)) {
                            deleteDoc(doc(db, "users", u.wa));
                          }
                        }}
                        className="text-[#e53e3e] hover:text-white transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#d4af37] font-black text-xl mb-1 uppercase tracking-widest">Tambah Jadwal Baru</h3>
            <form onSubmit={handleAddSchedule} className="flex flex-col gap-4 mt-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Tipe</label>
                  <select name="type" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] appearance-none" required>
                    <option value="rutin">Latihan Rutin</option>
                    <option value="laga">Sparing / Laga</option>
                  </select>
                </div>
                <div className="flex-[2]">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Judul Jadwal</label>
                  <input type="text" name="title" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37]" placeholder="Contoh: Latihan Rutin Sabtu" required />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Waktu / Tanggal</label>
                  <input type="text" name="time" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37]" placeholder="Contoh: 19:30 WIB" required />
                </div>
                <div className="flex-1">
                  <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Lokasi / Lapangan</label>
                  <input type="text" name="location" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37]" placeholder="Contoh: Gor Batung" required />
                </div>
              </div>

              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Jersey</label>
                <input type="text" name="jersey" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37]" placeholder="Contoh: Home (Gold) / Bebas" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Tambah Jadwal
              </button>
            </form>
          </div>

          {/* List of Schedules */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">Jadwal Saat Ini</h3>
            <div className="flex flex-col gap-3">
              {(settings.jadwalList || []).map((j) => (
                <div key={j.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border-l-4 border-[#333]">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-1 ${j.type === 'laga' ? 'bg-[#e53e3e] text-white' : 'bg-[#d4af37] text-black'}`}>
                      {j.type}
                    </span>
                    <p className="text-sm font-bold m-0">{j.title}</p>
                    <p className="text-[10px] text-[#aaa] m-0">{j.time} • {j.location}</p>
                  </div>
                  <button onClick={() => handleDeleteSchedule(j.id)} className="w-8 h-8 flex items-center justify-center bg-[#e53e3e]/10 text-[#e53e3e] rounded hover:bg-[#e53e3e] hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {settings.jadwalList.length === 0 && (
                <p className="text-xs text-[#888] italic">Belum ada jadwal yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* List of Announcements */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-widest">Pengumuman Saat Ini</h3>
            <div className="flex flex-col gap-3">
              {(settings.announcements || []).map((a) => (
                <div key={a.id} className="flex justify-between items-start bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4" style={{ borderLeftColor: a.tagColor }}>
                  <div className="flex-1 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-2" style={{ backgroundColor: `${a.tagColor}20`, color: a.tagColor }}>
                      {a.tag} • {a.date}
                    </span>
                    <p className="text-sm font-bold m-0 text-white mb-1">{a.title}</p>
                    <p className="text-[10px] text-[#aaa] m-0 line-clamp-2">{a.content}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#e53e3e]/10 text-[#e53e3e] rounded hover:bg-[#e53e3e] hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {(settings.announcements || []).length === 0 && (
                <p className="text-xs text-[#888] italic">Belum ada pengumuman yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* List of Gallery Photos (Admin Management) */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-widest">Manajemen Galeri ({ (settings.gallery || []).length })</h3>
            <p className="text-xs text-[#888] mb-4">Kelola foto kegiatan klub yang telah diunggah.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <button 
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      className="self-end bg-[#e53e3e] text-white p-1.5 rounded-md hover:bg-[#c53030] transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="text-[9px] text-[#aaa] truncate">
                      <p className="text-white font-bold truncate">{photo.uploader}</p>
                      <p>{photo.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(settings.gallery || []).length === 0 && (
              <p className="text-xs text-[#888] italic">Belum ada foto di galeri.</p>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
