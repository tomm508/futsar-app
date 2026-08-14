/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

import { 
  Menu, X, MapPin, Instagram, AlertTriangle, LogOut, 
  Calendar, Wallet, ClipboardList, MessageCircle, Clock, Shirt, Star, QrCode,
  Users, Info, FileText, CheckCircle, XCircle, Camera, Edit2, UserCircle, Image as ImageIcon, Trash2, Plus,
  Lock, ShieldCheck, Bot, Send, MessageSquare, MessagesSquare, CheckCheck, Smile, Radio,
  Download, Palette, Sparkles, ExternalLink, Eye, Award, Shield, Activity, Settings,
  Flame, Zap, Crown
} from 'lucide-react';
import Image from 'next/image';

const PROFILE_THEMES = [
  { id: 'gold', name: 'Gold Champion', color: '#d4af37', border: 'border-[#d4af37]', text: 'text-[#d4af37]', bg: 'bg-[#d4af37]', glow: 'rgba(212,175,55,0.4)' },
  { id: 'crimson', name: 'Crimson Red', color: '#e53e3e', border: 'border-[#e53e3e]', text: 'text-[#e53e3e]', bg: 'bg-[#e53e3e]', glow: 'rgba(229,62,62,0.4)' },
  { id: 'blue', name: 'Electric Blue', color: '#3182ce', border: 'border-[#3182ce]', text: 'text-[#3182ce]', bg: 'bg-[#3182ce]', glow: 'rgba(49,130,206,0.4)' },
  { id: 'emerald', name: 'Emerald Pitch', color: '#38a169', border: 'border-[#38a169]', text: 'text-[#38a169]', bg: 'bg-[#38a169]', glow: 'rgba(56,161,105,0.4)' },
  { id: 'purple', name: 'Amethyst Violet', color: '#805ad5', border: 'border-[#805ad5]', text: 'text-[#805ad5]', bg: 'bg-[#805ad5]', glow: 'rgba(128,90,213,0.4)' },
  { id: 'orange', name: 'Sunset Orange', color: '#dd6b20', border: 'border-[#dd6b20]', text: 'text-[#dd6b20]', bg: 'bg-[#dd6b20]', glow: 'rgba(221,107,32,0.4)' },
  { id: 'cyan', name: 'Cyber Cyan', color: '#00b4d8', border: 'border-[#00b4d8]', text: 'text-[#00b4d8]', bg: 'bg-[#00b4d8]', glow: 'rgba(0,180,216,0.4)' },
];

const AVATAR_BORDERS = [
  { id: 'classic', name: 'Solid Klasik', icon: Shield, desc: 'Ring solid tegas selaras warna tema' },
  { id: 'glow', name: 'Neon Aura', icon: Sparkles, desc: 'Pendaran aura neon bercahaya' },
  { id: 'champion', name: 'Gold Champion', icon: Award, desc: 'Ring ganda mahkota emas sang juara' },
  { id: 'fire', name: 'Inferno Flame', icon: Flame, desc: 'Gradasi bara api membara' },
  { id: 'lightning', name: 'Electric Storm', icon: Zap, desc: 'Kilatan petir cyber berenergi' },
  { id: 'cyber', name: 'Tactical Matrix', icon: Radio, desc: 'Garis putus-putus tactical futuristik' },
  { id: 'captain', name: 'Captain Crest', icon: ShieldCheck, desc: 'Lencana ban kapten bertabur bintang' },
  { id: 'prism', name: 'Holo Spectrum', icon: Palette, desc: 'Spektrum pelangi hologram mengkilap' },
];

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderWa: string;
  senderPosisi?: string;
  senderAvatar?: string;
  senderThemeColor?: string;
  senderAvatarBorder?: string;
  role?: 'member' | 'admin';
  text: string;
  timestamp: number;
};

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
  jerseyNumber?: string;
  bio?: string;
  themeColor?: string;
  avatarBorder?: string;
  joinedDate?: string;
};

function PlayerAvatar({
  user,
  size = 'md',
  className = '',
  showOnline = false,
  currentTime = 0,
  onClick,
  title,
  customThemeColor,
  customBorder,
  customAvatarUrl,
  customNama
}: {
  user?: Partial<User> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showOnline?: boolean;
  currentTime?: number;
  onClick?: () => void;
  title?: string;
  customThemeColor?: string;
  customBorder?: string;
  customAvatarUrl?: string;
  customNama?: string;
}) {
  const theme = customThemeColor || user?.themeColor || '#d4af37';
  const borderStyle = customBorder || user?.avatarBorder || 'classic';
  const avatarUrl = customAvatarUrl !== undefined ? customAvatarUrl : user?.avatarUrl;
  const nama = customNama || user?.nama || 'U';
  const isOnline = showOnline && user?.lastActive && currentTime > 0 && (currentTime - user.lastActive < 90000);

  const sizeStyles = {
    xs: { wrapper: 'w-6 h-6', inner: 'w-5 h-5 text-[10px]' },
    sm: { wrapper: 'w-8 h-8', inner: 'w-7 h-7 text-xs' },
    md: { wrapper: 'w-10 h-10', inner: 'w-9 h-9 text-sm' },
    lg: { wrapper: 'w-16 h-16', inner: 'w-[58px] h-[58px] text-xl' },
    xl: { wrapper: 'w-20 h-20', inner: 'w-[72px] h-[72px] text-2xl' },
    '2xl': { wrapper: 'w-24 h-24', inner: 'w-[86px] h-[86px] text-3xl' }
  }[size] || { wrapper: 'w-10 h-10', inner: 'w-9 h-9 text-sm' };

  const isSmall = size === 'xs' || size === 'sm';

  const getFrameClasses = () => {
    switch (borderStyle) {
      case 'glow':
        return 'p-[2px] rounded-full border-2 transition-all duration-300';
      case 'champion':
        return 'p-[2.5px] rounded-full bg-gradient-to-tr from-[#ffe066] via-[#d4af37] to-[#996515] shadow-[0_0_12px_rgba(212,175,55,0.5)] ring-1 ring-[#ffe066]/40';
      case 'fire':
        return 'p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
      case 'lightning':
        return 'p-[2.5px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse';
      case 'cyber':
        return 'p-[2px] rounded-full border-2 border-dashed border-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      case 'captain':
        return 'p-[2.5px] rounded-full border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]';
      case 'prism':
        return 'p-[2.5px] rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 via-yellow-400 to-cyan-400 shadow-[0_0_12px_rgba(236,72,153,0.4)]';
      case 'classic':
      default:
        return 'p-[2px] rounded-full border-2';
    }
  };

  const getFrameStyles = () => {
    if (borderStyle === 'glow') {
      return {
        borderColor: theme,
        boxShadow: `0 0 14px ${theme}99, inset 0 0 6px ${theme}66`
      };
    }
    if (borderStyle === 'classic') {
      return {
        borderColor: theme,
        boxShadow: `0 2px 8px ${theme}33`
      };
    }
    return undefined;
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      <div 
        className={`${getFrameClasses()} ${sizeStyles.wrapper} flex items-center justify-center`}
        style={getFrameStyles()}
      >
        <div className={`${sizeStyles.inner} rounded-full overflow-hidden bg-[#161616] flex items-center justify-center relative shadow-inner`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={nama} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center font-black uppercase bg-[#1c1c1c]"
              style={{ color: theme }}
            >
              {nama ? nama.charAt(0).toUpperCase() : <UserCircle size={20} />}
            </div>
          )}
        </div>

        {/* Mini Badges for Champion & Captain styles */}
        {!isSmall && borderStyle === 'champion' && (
          <span className="absolute -top-1 -right-1 text-[9px] bg-[#ffd700] text-black rounded-full w-4 h-4 flex items-center justify-center font-black shadow-md border border-black" title="Champion">
            ★
          </span>
        )}
        {!isSmall && borderStyle === 'captain' && (
          <span 
            className="absolute -bottom-1 -left-1 text-[8px] font-black text-black px-1 py-0.2 rounded-sm shadow-md border border-black bg-amber-400"
            title="Captain"
          >
            C
          </span>
        )}
      </div>

      {isOnline && (
        <span 
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse" 
          title="Online sekarang"
        />
      )}
    </div>
  );
}

function GeminiEdgeAurora({ intensity = 'normal' }: { intensity?: 'subtle' | 'normal' | 'vibrant' }) {
  const opacityClass = intensity === 'subtle' ? 'opacity-40' : intensity === 'vibrant' ? 'opacity-80' : 'opacity-60';
  return (
    <div className={`absolute -inset-6 sm:-inset-8 pointer-events-none overflow-hidden z-0 rounded-[38px] ${opacityClass}`}>
      {/* Pojok Kiri Atas: Gemini Electric Blue */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#4285f4] via-[#2b71f0] to-[#00f2fe] blur-[55px] animate-gemini-float-1" />
      
      {/* Pojok Kanan Atas: Gemini Cosmic Violet / Pink Magenta */}
      <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-gradient-to-bl from-[#9b51e0] via-[#d946ef] to-[#7928ca] blur-[58px] animate-gemini-float-2" />
      
      {/* Pojok Kiri Bawah: Cyber Cyan & Mint Neon */}
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#06b6d4] to-[#10b981] blur-[55px] animate-gemini-float-2" />
      
      {/* Pojok Kanan Bawah: Champion Gold & Amber Neon */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tl from-[#ffd700] via-[#f59e0b] to-[#9b51e0] blur-[55px] animate-gemini-float-1" />
      
      {/* Pendaran Bingkai Tengah (Border Glow Ring) */}
      <div className="absolute inset-4 rounded-[28px] border border-cyan-400/20 bg-gradient-to-tr from-[#4285f4]/10 via-[#9b51e0]/10 to-[#00f2fe]/10 blur-[15px] animate-gemini-pulse" />
    </div>
  );
}

function GeminiCenterNebula({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0 select-none ${className}`}>
      {/* Nebula Cahaya Neon Gemini di Tengah Chat */}
      <div className="relative w-64 h-64 sm:w-84 sm:h-84 flex items-center justify-center opacity-45">
        {/* Lapisan 1: Pendaran Berputar Utama (Gemini Cosmic Aurora) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#4285f4] via-[#9b51e0] to-[#00f2fe] blur-[75px] animate-gemini-spin" />
        
        {/* Lapisan 2: Gelombang Warna Magenta & Cyan Mengambang */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-[#ec4899] via-[#8a2be2] to-[#06b6d4] blur-[60px] animate-gemini-float-1" />
        
        {/* Lapisan 3: Inti Cahaya Berdenyut Halus */}
        <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#ffd700] blur-[45px] animate-gemini-pulse" />
      </div>
    </div>
  );
}

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
  adminWa: '123456789',
  adminPassword: 'Admin01',
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
  const [activeModal, setActiveModal] = useState<'daftar' | 'masuk' | 'jadwal' | 'kas' | 'rekap_kas' | 'taktik' | 'info' | 'chat_admin' | 'profile' | 'gallery' | 'ai_bot' | 'community_chat' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingThemeColor, setEditingThemeColor] = useState<string>('#d4af37');
  const [editingAvatarBorder, setEditingAvatarBorder] = useState<string>('classic');
  
  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const exportDataToCSV = (usersToExport: User[]) => {
    const headers = ['Nama', 'ID Member', 'Posisi', 'No Punggung', 'WhatsApp', 'Status Akun', 'Status Kas', 'Bio / Motto'];
    const rows = usersToExport.map(u => [
      `"${(u.nama || '').replace(/"/g, '""')}"`,
      `"${(u.id || '').replace(/"/g, '""')}"`,
      `"${(u.posisi || '').replace(/"/g, '""')}"`,
      `"${(u.jerseyNumber ? '#' + u.jerseyNumber : '-').replace(/"/g, '""')}"`,
      `"${(u.wa || '').replace(/"/g, '""')}"`,
      `"${(u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Menunggu' : 'Ditolak')}"`,
      `"${(u.isPaid ? 'Lunas' : 'Belum Lunas')}"`,
      `"${(u.bio || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_futsar_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);
  
  // Community Chat State
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeChatTab, setActiveChatTab] = useState<'chat' | 'members'>('chat');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const communityChatEndRef = useRef<HTMLDivElement>(null);

  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Halo! Saya Asisten AI Futsar. Ada yang bisa saya bantu tentang info klub, taktik futsal, atau jadwal?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal === 'ai_bot') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiTyping, activeModal]);

  useEffect(() => {
    if (activeModal === 'community_chat' && activeChatTab === 'chat') {
      communityChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communityMessages, activeModal, activeChatTab]);
  
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiTyping) return;
    
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: aiMessages })
      });
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Maaf, terjadi kesalahan teknis.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSendCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const text = chatInput.trim();
    setChatInput('');
    const newMsg: Omit<ChatMessage, 'id'> = {
      senderId: user.id || user.wa,
      senderName: user.nama,
      senderWa: user.wa,
      senderPosisi: user.posisi || 'Member',
      senderAvatar: user.avatarUrl || '',
      senderThemeColor: user.themeColor || '#d4af37',
      senderAvatarBorder: user.avatarBorder || 'classic',
      role: user.role || 'member',
      text,
      timestamp: Date.now()
    };

    try {
      const msgId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await setDoc(doc(db, "community_messages", msgId), newMsg);

      // Auto-prune: jika pesan sudah lebih dari 100, bersihkan pesan-pesan terlama secara otomatis
      if (communityMessages.length >= 100) {
        const oldestMsgs = communityMessages.slice(0, communityMessages.length - 80);
        oldestMsgs.forEach(async (m) => {
          try {
            await deleteDoc(doc(db, "community_messages", m.id));
          } catch (_) {}
        });
      }
    } catch (err) {
      console.error('Error sending community message:', err);
    }
  };

  const handleDeleteCommunityMessage = async (msgId: string) => {
    if (confirm('Hapus pesan ini dari ruang chat?')) {
      try {
        await deleteDoc(doc(db, "community_messages", msgId));
      } catch (err) {
        console.error('Error deleting community message:', err);
      }
    }
  };

  const handleClearAllCommunityMessages = async () => {
    if (!confirm('Apakah Admin yakin ingin menghapus SEMUA riwayat obrolan di ruang chat?')) return;
    try {
      const qSnap = await getDocs(collection(db, "community_messages"));
      const promises = qSnap.docs.map(d => deleteDoc(doc(db, "community_messages", d.id)));
      await Promise.all(promises);
    } catch (err) {
      console.error('Error clearing community messages:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      const interval = setInterval(updatePresence, 20000); // 20 seconds
      return () => clearInterval(interval);
    }
  }, [user?.wa]);

  // Real-time listener for all users (Online Presence & Member Directory)
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as User);
      });
      setAllUsers(users);
    });
    return () => unsubUsers();
  }, []);

  // Real-time listener for Community Chat messages
  useEffect(() => {
    const unsubChat = onSnapshot(collection(db, "community_messages"), (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatMessage, 'id'>) });
      });
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setCommunityMessages(msgs);
    });
    return () => unsubChat();
  }, []);

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
    const wa = (formData.get('wa') as string)?.trim();
    const password = (formData.get('password') as string)?.trim();

    const currentAdminWa = (settings.adminWa || '123456789').trim();
    const currentAdminPass = (settings.adminPassword || 'Admin01').trim();

    // Check if logging in with Admin credentials
    if ((wa === currentAdminWa || wa === '123456789') && (password === currentAdminPass || password === 'Admin01')) {
      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: '123456789',
        id: 'ADMIN',
        role: 'admin'
      };
      localStorage.setItem('futsar_user_wa', 'ADMIN');
      setUser(adminUser);
      setActiveModal(null);
      setLoginError(false);
      return;
    }

    const userDoc = await getDoc(doc(db, "users", wa));
    
    if (userDoc.exists()) {
      const savedAccount = userDoc.data() as User;
      if (savedAccount.password === password) {
        if (savedAccount.role === 'admin') {
          localStorage.setItem('futsar_user_wa', 'ADMIN');
        } else {
          localStorage.setItem('futsar_user_wa', wa);
        }
        setUser(savedAccount);
        setActiveModal(null);
        setLoginError(false);
        return;
      }
    }
    
    setLoginError(true);
    setTimeout(() => setLoginError(false), 400); // Reset shake animation
  };

  const handleLogout = () => {
    localStorage.removeItem('futsar_user_wa');
    setUser(null);
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const posisi = (formData.get('posisi') as string) || user.posisi || 'Member';
    const jerseyNumber = (formData.get('jerseyNumber') as string)?.trim() || '';
    const bio = (formData.get('bio') as string)?.trim() || '';
    const themeColor = editingThemeColor || user.themeColor || '#d4af37';
    const avatarBorder = editingAvatarBorder || user.avatarBorder || 'classic';

    if (user.wa === 'ADMIN' || user.role === 'admin') {
      const updatedAdmin = { ...user, posisi, jerseyNumber, bio, themeColor, avatarBorder };
      setUser(updatedAdmin);
      alert('Profil Admin berhasil diperbarui!');
      setActiveModal(null);
      return;
    }

    await updateDoc(doc(db, "users", user.wa), { 
      posisi, 
      jerseyNumber, 
      bio, 
      themeColor,
      avatarBorder
    });
    
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



  if (!isMounted || !isLoaded || !isSettingsLoaded) return null;

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
                className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 opacity-70 transition-opacity duration-1000"
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
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 opacity-70 transition-opacity duration-1000" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518605368461-1ee51188cd8d?q=80&w=2000&auto=format&fit=crop'; }}
            />
          );
        })()}
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10 pointer-events-none"></div>
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

          {/* Centered Content Card with Gemini Animated Neon Aurora Edge Lights */}
          <div className="relative my-auto w-full max-w-[380px] flex items-center justify-center">
            {/* Ambient Gemini Neon Aurora at each edge/corner */}
            <GeminiEdgeAurora intensity="normal" />

            <div className="relative z-20 text-center w-full py-8 px-6 bg-black/60 backdrop-blur-xl border border-[#d4af37]/40 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
              <div className="text-[13px] font-bold tracking-[3px] mb-1 uppercase text-[#ddd]">
                Welcome To Mini Site
              </div>
              <h1 className="text-[48px] sm:text-[55px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffe89c] via-[#d4af37] to-[#997913] mb-6 drop-shadow-[0_4px_25px_rgba(212,175,55,0.5)] tracking-[4px] leading-tight">
                FUTSAR
              </h1>
              
              <div className="flex flex-col gap-3.5">
                <button 
                  onClick={() => setActiveModal('daftar')}
                  className="w-full py-3.5 rounded-full text-[15px] font-bold uppercase tracking-[2px] bg-gradient-to-r from-[#d4af37] to-[#b8911f] text-[#0a0a0a] shadow-[0_5px_25px_rgba(212,175,55,0.4)] transition-all active:scale-95 hover:brightness-110 cursor-pointer"
                >
                  Daftar
                </button>
                <button 
                  onClick={() => setActiveModal('masuk')}
                  className="w-full py-3.5 rounded-full text-[15px] font-bold uppercase tracking-[2px] bg-black/40 text-white border-2 border-[#d4af37] transition-all active:scale-95 hover:bg-[#d4af37]/20 cursor-pointer"
                >
                  Masuk
                </button>
              </div>
            </div>
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
              {/* Message icon with live online indicator replacing the old shirt icon */}
              <button 
                onClick={() => setActiveModal('community_chat')}
                className="relative w-10 h-10 bg-gradient-to-br from-[#ffe89c] via-[#d4af37] to-[#b8911f] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.35)] hover:scale-105 active:scale-95 transition-all group cursor-pointer border border-[#ffe89c]/40"
                title="Buka Ruang Chat Komunitas & Status Online"
              >
                <MessageSquare size={22} className="text-[#0a0a0a] group-hover:scale-110 transition-transform" />
                {/* Live Online Pulsing Indicator */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
                </span>
              </button>

              <button 
                onClick={() => setActiveModal('community_chat')}
                className="text-left flex flex-col group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-[4px] text-[#d4af37] text-xl md:text-2xl group-hover:brightness-125 transition-all">FUTSAR</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {allUsers.filter(u => u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000)).length} Online
                  </span>
                </div>
                <span className="text-[10px] text-[#888] group-hover:text-[#d4af37] transition-colors font-medium -mt-0.5">
                  Ruang Chat & Anggota
                </span>
              </button>
            </div>
            
            <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-[#aaa]">
              <button className="text-[#d4af37] border-b border-[#d4af37] pb-1 cursor-default">Dashboard</button>
              <button onClick={() => setActiveModal('community_chat')} className="hover:text-[#d4af37] text-[#d4af37]/80 transition-colors flex items-center gap-1.5">
                <MessageSquare size={13} /> Chat Tim
              </button>
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
              <div 
                className="bg-gradient-to-br from-[#151515]/80 to-[#0a0a0a]/80 backdrop-blur-md rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all border"
                style={{
                  borderColor: user.themeColor ? `${user.themeColor}50` : 'rgba(212,175,55,0.3)',
                  boxShadow: `0 10px 40px ${user.themeColor ? user.themeColor + '15' : 'rgba(212,175,55,0.1)'}`
                }}
              >
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                  <Shirt size={240} style={{ color: user.themeColor || '#d4af37' }} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <PlayerAvatar 
                        user={user} 
                        size="lg" 
                        onClick={() => setSelectedMember(user)}
                        title="Klik untuk lihat kartu profil"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 
                            className="font-black text-[26px] md:text-[32px] tracking-tight mb-0 capitalize leading-none"
                            style={{ color: user.themeColor || '#d4af37' }}
                          >
                            Welcome, {user.nama}
                          </h2>
                          {user.jerseyNumber && (
                            <span 
                              className="px-2.5 py-0.5 rounded-lg text-xs font-black border"
                              style={{
                                color: user.themeColor || '#d4af37',
                                borderColor: `${user.themeColor || '#d4af37'}60`,
                                backgroundColor: `${user.themeColor || '#d4af37'}15`
                              }}
                            >
                              #{user.jerseyNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {user.bio ? `"${user.bio}"` : 'Pemain resmi klub Futsar. Siap tanding dan junjung sportivitas!'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 md:gap-12 mt-6">
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Member ID</p>
                        <p className="text-lg md:text-xl font-mono font-bold">{user.id}</p>
                      </div>
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Position</p>
                        <p className="text-lg md:text-xl font-bold uppercase">{user.posisi}</p>
                      </div>
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Contact</p>
                        <p className="text-lg md:text-xl font-bold">{user.wa}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => setSelectedMember(user)} 
                      className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 text-black shadow-md cursor-pointer"
                      style={{ backgroundColor: user.themeColor || '#d4af37' }}
                    >
                      <Eye size={14} /> Kartu Profil
                    </button>
                    <button 
                      onClick={() => {
                        setEditingThemeColor(user.themeColor || '#d4af37');
                        setEditingAvatarBorder(user.avatarBorder || 'classic');
                        setActiveModal('profile');
                      }} 
                      className="px-4 py-2.5 bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d4af37]/10 transition-colors active:scale-95 cursor-pointer"
                    >
                      <Edit2 size={14} /> Edit Profil
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                <button onClick={() => setActiveModal('community_chat')} className="bg-gradient-to-br from-[#1b170c]/80 to-[#111]/80 backdrop-blur-md border border-[#d4af37]/40 rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-all text-left active:scale-[0.98] relative overflow-hidden shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#d4af37]/20 p-3 rounded-xl border border-[#d4af37]/30 text-[#d4af37] group-hover:scale-110 transition-transform">
                      <MessagesSquare size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {allUsers.filter(u => u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000)).length} Online
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-[#d4af37] group-hover:brightness-125 transition-colors">Ruang Chat</h3>
                    <p className="text-xs text-gray-400">Obrolan & status anggota</p>
                  </div>
                </button>

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
                
                <button onClick={() => setActiveModal('ai_bot')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#1abc9c]/10 p-3 rounded-xl">
                      <Bot className="text-[#1abc9c]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Asisten AI</h3>
                    <p className="text-xs text-gray-500">Tanya seputar Futsar</p>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500] flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full flex justify-center items-center max-w-[500px]">
            {/* Gemini Neon Edge Aurora for Login, Register & Chat Modals */}
            {(activeModal === 'masuk' || activeModal === 'daftar' || activeModal === 'community_chat') && (
              <GeminiEdgeAurora intensity={activeModal === 'community_chat' ? 'subtle' : 'normal'} />
            )}

            <div className={`bg-[#111] w-full ${
              activeModal === 'community_chat' 
                ? 'max-w-[500px] h-[90vh] sm:h-[650px] flex flex-col p-0 overflow-hidden' 
                : activeModal === 'gallery' 
                ? 'max-w-[500px] p-[25px]' 
                : activeModal === 'ai_bot'
                ? 'max-w-[420px] p-[25px]'
                : 'max-w-[380px] p-[25px]'
            } max-h-[92vh] rounded-[24px] border border-[#d4af37]/60 relative shadow-[0_15px_50px_rgba(0,0,0,0.9)] z-10 animate-in slide-in-from-bottom-6 duration-300 ${activeModal !== 'community_chat' ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]' : ''}`}>
              {activeModal !== 'community_chat' && (
                <button onClick={() => setActiveModal(null)} className="absolute top-[15px] right-[20px] text-[#d4af37] hover:opacity-80 z-20 cursor-pointer">
                  <X size={24} />
                </button>
              )}

            {/* PROFILE MODAL */}
            {activeModal === 'profile' && user && (
              <>
                <h2 className="text-[#d4af37] text-[22px] font-black uppercase tracking-[1px] mt-2 mb-4 border-b border-[#333] pb-2 flex items-center justify-between">
                  <span>Edit Profil</span>
                  <span className="text-[11px] font-mono text-[#888] font-normal">{user.id}</span>
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
                  {/* Avatar Upload & Live Border Preview */}
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="relative group cursor-pointer">
                      <PlayerAvatar 
                        user={user} 
                        customThemeColor={editingThemeColor}
                        customBorder={editingAvatarBorder}
                        size="xl" 
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera size={22} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleProfileAvatarUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-gray-200">
                        {AVATAR_BORDERS.find(b => b.id === editingAvatarBorder)?.name || 'Solid Klasik'}
                      </p>
                      <p className="text-[10px] text-[#888] tracking-wider">Ketuk foto untuk mengganti file avatar</p>
                    </div>
                  </div>

                  {/* PILIH BORDER PROFIL (AVATAR FRAME) */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award size={13} className="text-[#d4af37]" /> Border Profil (Frame)
                      </span>
                      <span className="text-[10px] text-[#d4af37] font-semibold">
                        {AVATAR_BORDERS.find(b => b.id === editingAvatarBorder)?.name}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                      {AVATAR_BORDERS.map((borderOpt) => {
                        const isSelected = editingAvatarBorder === borderOpt.id;
                        const BorderIcon = borderOpt.icon;
                        return (
                          <button
                            key={borderOpt.id}
                            type="button"
                            onClick={() => setEditingAvatarBorder(borderOpt.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                              isSelected
                                ? 'bg-white/[0.08] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                                : 'bg-[#151515]/60 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <PlayerAvatar 
                              user={user}
                              customThemeColor={editingThemeColor}
                              customBorder={borderOpt.id}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                                <BorderIcon size={12} className={isSelected ? 'text-[#d4af37]' : 'text-gray-400'} />
                                <span>{borderOpt.name}</span>
                              </p>
                              <p className="text-[9px] text-gray-400 line-clamp-1 leading-tight mt-0.5">
                                {borderOpt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* WARNA TEMA PROFIL */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Palette size={13} className="text-[#d4af37]" /> Warna Tema Profil</span>
                      <span className="text-[10px] text-gray-400 capitalize">{PROFILE_THEMES.find(t => t.color === editingThemeColor)?.name || 'Gold Champion'}</span>
                    </label>
                    <div className="grid grid-cols-7 gap-2 pt-1">
                      {PROFILE_THEMES.map((theme) => {
                        const isSelected = (editingThemeColor || '#d4af37').toLowerCase() === theme.color.toLowerCase();
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setEditingThemeColor(theme.color)}
                            title={theme.name}
                            className={`h-7 rounded-lg transition-all flex items-center justify-center cursor-pointer ${isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                            style={{ backgroundColor: theme.color }}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-sm"></span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1">Posisi Main</label>
                    <select name="posisi" defaultValue={user.posisi || 'Flank'} className="w-full p-2.5 rounded-lg bg-[#1a1a1a]/80 border border-[#333] text-white focus:outline-none focus:border-[#d4af37] text-xs font-semibold" required>
                      <option value="Kiper">Kiper (GoalKeeper)</option>
                      <option value="Anchor">Anchor (Pemain Bertahan)</option>
                      <option value="Flank">Flank (Pemain Sayap / Ala)</option>
                      <option value="Pivot">Pivot (Penyerang Utama)</option>
                      <option value="All-Round">All-Round (Pemain Serbaguna)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1">Nomor Punggung (Jersey #)</label>
                    <input 
                      type="text" 
                      name="jerseyNumber" 
                      defaultValue={user.jerseyNumber || ''} 
                      placeholder="Contoh: 10 atau 7" 
                      maxLength={3}
                      className="w-full p-2.5 rounded-lg bg-[#1a1a1a]/80 border border-[#333] text-white focus:outline-none focus:border-[#d4af37] text-xs" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1">Bio / Motto Pemain</label>
                    <input 
                      type="text" 
                      name="bio" 
                      defaultValue={user.bio || ''} 
                      placeholder="Contoh: Main tenang, oper akurat, gol datang!" 
                      maxLength={80}
                      className="w-full p-2.5 rounded-lg bg-[#1a1a1a]/80 border border-[#333] text-white focus:outline-none focus:border-[#d4af37] text-xs" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full p-3.5 rounded-lg text-black text-[14px] font-black uppercase tracking-[1px] transition-transform active:scale-95 shadow-md mt-2 cursor-pointer"
                    style={{ backgroundColor: editingThemeColor || '#d4af37' }}
                  >
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
                    <input type="text" name="wa" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="Masukkan No WA terdaftar" required />
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
                <div className="flex justify-between items-center mt-2 mb-3 border-b border-[#333] pb-2">
                  <h2 className="text-[#d4af37] text-[22px] font-black uppercase tracking-[1px]">Catatan Kas</h2>
                  <button 
                    onClick={() => exportDataToCSV(allUsers)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27ae60]/20 hover:bg-[#27ae60] text-[#27ae60] hover:text-white border border-[#27ae60]/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                    title="Unduh Rekap CSV"
                  >
                    <Download size={13} /> Ekspor CSV
                  </button>
                </div>
                <p className="text-[12px] text-[#888] text-left mb-4">Status tagihan semua anggota Futsar Club yang terdaftar (klik anggota untuk melihat profil):</p>
                
                <div className="flex flex-col gap-2.5 mb-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37] pr-2">
                  {allUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Belum ada anggota yang mendaftar.</p>
                  ) : (
                    allUsers.map((u) => (
                      <div 
                        key={u.id} 
                        onClick={() => setSelectedMember(u)}
                        className={`flex justify-between items-center bg-[#1a1a1a] hover:bg-[#242424] p-3 rounded-xl border-l-4 ${u.isPaid ? 'border-[#27ae60]' : 'border-[#ff4d4d]'} transition-all cursor-pointer group`}
                        title="Klik untuk lihat profil anggota"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <PlayerAvatar user={u} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-white capitalize group-hover:text-[#d4af37] transition-colors flex items-center gap-1.5">
                              {u.nama}
                              {u.jerseyNumber && (
                                <span className="text-[10px] text-[#888] font-normal">#{u.jerseyNumber}</span>
                              )}
                            </span>
                            <span className="text-[10px] text-[#aaa]">{u.id} • {u.posisi || 'Member'}</span>
                          </div>
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

                <button onClick={() => setActiveModal(null)} className="w-full bg-transparent text-white border border-[#555] p-3.5 rounded-lg text-[14px] font-bold uppercase cursor-pointer transition-transform active:scale-95">
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
                    settings.gallery.map((photo, index) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                        <div className="absolute top-2 left-2 bg-black/60 text-[#d4af37] text-[10px] font-bold px-2 py-1 rounded-md z-10">#{settings.gallery!.length - index}</div>
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left pointer-events-none">
                          <span className="text-white text-[10px] font-bold truncate">{photo.uploader}</span>
                          <span className="text-[#aaa] text-[9px]">{photo.date}</span>
                        </div>
                        {user?.role === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteGallery(photo.id); }} className="absolute top-2 right-2 bg-black/60 text-[#e53e3e] w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all pointer-events-auto">
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

            {/* AI BOT MODAL */}
            {activeModal === 'ai_bot' && (
              <>
                <div className="flex items-center gap-3 mb-4 border-b border-[#333] pb-4">
                  <div className="w-10 h-10 bg-[#1abc9c]/20 rounded-full flex items-center justify-center mt-2">
                    <Bot className="text-[#1abc9c]" size={20} />
                  </div>
                  <div className="mt-2">
                    <h2 className="text-[#1abc9c] text-lg font-black uppercase tracking-widest">Asisten AI Futsar</h2>
                    <p className="text-[10px] text-[#888]">Powered by Gemini</p>
                  </div>
                </div>
                
                <div className="flex flex-col h-[55vh] max-h-[350px]">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#1abc9c]">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-[#222] text-white rounded-tl-none border border-[#333]'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#222] border border-[#333] p-3 rounded-2xl rounded-tl-none flex gap-1">
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendAiMessage} className="flex gap-2 mt-auto border-t border-[#333] pt-4 relative z-50">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-[#1abc9c] text-white p-3 rounded-xl text-[14px] outline-none transition-colors touch-auto select-auto"
                      autoFocus
                      onFocus={(e) => {
                        // Workaround for some mobile browsers
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={isAiTyping || !aiInput.trim()}
                      className="p-3 bg-[#1abc9c] text-black rounded-xl disabled:opacity-50 hover:bg-[#16a085] transition-colors flex items-center justify-center shrink-0 min-w-[50px]"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
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

            {/* COMMUNITY CHAT & ONLINE PRESENCE MODAL */}
            {activeModal === 'community_chat' && (
              <div className="flex flex-col h-full w-full bg-[#0d0d0d] text-white">
                {/* Header */}
                <div className="px-4 py-3 bg-[#141414] border-b border-[#292929] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffe89c] via-[#d4af37] to-[#b8911f] flex items-center justify-center text-black shadow-md">
                      <MessagesSquare size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-black text-white tracking-wider uppercase leading-tight">Ruang Chat Futsar</h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {allUsers.filter(u => u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000)).length} Anggota Online
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' && communityMessages.length > 0 && (
                      <button
                        onClick={handleClearAllCommunityMessages}
                        className="px-2.5 py-1.5 bg-[#e53e3e]/15 hover:bg-[#e53e3e] text-[#e53e3e] hover:text-white border border-[#e53e3e]/30 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Bersihkan Semua Pesan Chat"
                      >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">Reset Chat</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setActiveModal(null)} 
                      className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-[#aaa] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#222] bg-[#111] px-4 pt-1 gap-2 shrink-0">
                  <button
                    onClick={() => setActiveChatTab('chat')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeChatTab === 'chat'
                        ? 'border-[#d4af37] text-[#d4af37]'
                        : 'border-transparent text-[#777] hover:text-[#bbb]'
                    }`}
                  >
                    <MessageSquare size={14} /> Obrolan
                    {communityMessages.length > 0 && (
                      <span className="bg-[#222] text-[#d4af37] text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                        {communityMessages.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveChatTab('members')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeChatTab === 'members'
                        ? 'border-[#d4af37] text-[#d4af37]'
                        : 'border-transparent text-[#777] hover:text-[#bbb]'
                    }`}
                  >
                    <Users size={14} /> Anggota ({allUsers.filter(u => !u.status || u.status === 'active').length})
                  </button>
                </div>

                {/* TAB 1: OBROLAN CHAT */}
                {activeChatTab === 'chat' && (
                  <div className="flex flex-col flex-1 min-h-0">
                    {/* Horizontal Online Members Quick Bar */}
                    <div className="px-3 py-2 bg-[#121212] border-b border-[#222] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                      <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Online:
                      </span>
                      {allUsers.filter(u => u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000)).length === 0 ? (
                        <span className="text-[11px] text-[#666] italic">Semua sedang offline</span>
                      ) : (
                        allUsers
                          .filter(u => u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000))
                          .map((ou) => (
                            <button
                              key={ou.wa}
                              onClick={() => setSelectedMember(ou)}
                              className="flex items-center gap-1.5 bg-[#1c1c1c] hover:bg-[#282828] border border-emerald-500/40 rounded-full pl-1 pr-2.5 py-0.5 text-[11px] text-white shrink-0 transition-colors group cursor-pointer"
                              title={`Lihat profil ${ou.nama}`}
                            >
                              <PlayerAvatar user={ou} size="xs" showOnline={true} />
                              <span className="font-semibold text-[10px] text-white group-hover:text-[#d4af37] truncate max-w-[80px]">
                                {ou.nama}
                              </span>
                            </button>
                          ))
                      )}
                    </div>

                    {/* Messages Container with Gemini Center Nebula Glow */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#d4af37]/30 relative">
                      {/* Ambient Animated Gemini Neon Center Nebula */}
                      <GeminiCenterNebula />

                      <div className="relative z-10 space-y-3 min-h-full flex flex-col justify-end">
                        {communityMessages.length === 0 ? (
                          <div className="my-auto flex flex-col items-center justify-center text-center p-6 text-[#777]">
                            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-3">
                              <MessagesSquare size={28} />
                            </div>
                            <p className="text-sm font-bold text-white mb-1">Ruang Chat Masih Kosong</p>
                            <p className="text-xs text-[#888] max-w-[240px]">
                              Mulai obrolan seru, koordinasi pertandingan, atau sapa anggota Futsar lainnya!
                            </p>
                          </div>
                        ) : (
                          communityMessages.map((msg) => {
                            const isOwn = user ? (msg.senderWa === user.wa || (user.role === 'admin' && msg.senderWa === 'ADMIN')) : false;
                            const isSenderAdmin = msg.role === 'admin' || msg.senderWa === 'ADMIN';
                            const msgDate = new Date(msg.timestamp);
                            const timeStr = isNaN(msgDate.getTime()) 
                              ? '' 
                              : msgDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                            const senderUser: User = allUsers.find(u => u.wa === msg.senderWa) || {
                              nama: msg.senderName,
                              wa: msg.senderWa,
                              posisi: msg.senderPosisi || 'Member',
                              id: isSenderAdmin ? 'OFFICIAL-ADMIN' : 'FUTSAR-MEMBER',
                              avatarUrl: msg.senderAvatar,
                              themeColor: msg.senderThemeColor || '#d4af37',
                              avatarBorder: msg.senderAvatarBorder || 'classic',
                              role: msg.role,
                              status: 'active' as const
                            };

                            return (
                              <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'} group items-end`}>
                                {!isOwn && (
                                  <div className="shrink-0">
                                    <PlayerAvatar 
                                      user={senderUser} 
                                      size="xs" 
                                      onClick={() => setSelectedMember(senderUser)}
                                      title={`Lihat profil ${msg.senderName}`}
                                    />
                                  </div>
                                )}

                                <div className={`max-w-[78%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-1.5 mb-1 px-1">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(senderUser)}
                                      className={`text-[11px] font-bold hover:underline cursor-pointer ${isOwn ? 'text-[#d4af37]' : isSenderAdmin ? 'text-[#e53e3e]' : 'text-[#bbb]'}`}
                                      title="Klik untuk lihat profil"
                                    >
                                      {msg.senderName}
                                    </button>
                                    {isSenderAdmin ? (
                                      <span className="bg-[#e53e3e]/20 text-[#e53e3e] border border-[#e53e3e]/40 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                        Admin
                                      </span>
                                    ) : (
                                      msg.senderPosisi && (
                                        <span className="bg-[#262626] text-[#aaa] text-[8px] font-semibold px-1.5 py-0.2 rounded uppercase">
                                          {msg.senderPosisi}
                                        </span>
                                      )
                                    )}
                                    <span className="text-[9px] text-[#666]">{timeStr}</span>
                                  </div>

                                  <div className="relative group/msg flex items-center gap-1.5">
                                    {(isOwn || user?.role === 'admin') && (
                                      <button 
                                        onClick={() => handleDeleteCommunityMessage(msg.id)}
                                        className={`opacity-0 group-hover/msg:opacity-100 p-1 text-[#666] hover:text-[#e53e3e] transition-opacity ${isOwn ? 'order-first' : 'order-last'}`}
                                        title="Hapus pesan"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed break-words whitespace-pre-wrap text-left ${
                                      isOwn 
                                        ? 'bg-gradient-to-br from-[#d4af37] to-[#b8911f] text-[#0a0a0a] font-semibold rounded-br-none shadow-md' 
                                        : isSenderAdmin
                                        ? 'bg-[#201212] border border-[#e53e3e]/40 text-white rounded-bl-none shadow-md'
                                        : 'bg-[#1c1c1c] border border-[#2e2e2e] text-white rounded-bl-none shadow-md'
                                    }`}>
                                      {msg.text}
                                    </div>
                                  </div>
                                </div>

                                {isOwn && user && (
                                  <div className="shrink-0">
                                    <PlayerAvatar 
                                      user={user} 
                                      size="xs" 
                                      onClick={() => setSelectedMember(user)}
                                      title="Lihat profil saya"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                        <div ref={communityChatEndRef} />
                      </div>
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendCommunityMessage} className="p-3 bg-[#111] border-t border-[#242424] flex items-center gap-2 shrink-0">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={user ? "Ketik pesan ke semua anggota..." : "Masuk terlebih dahulu untuk mengirim pesan"}
                        disabled={!user}
                        className="flex-1 bg-[#1a1a1a] border border-[#333] text-white text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50"
                      />
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim() || !user}
                        className="bg-[#d4af37] text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-90 font-bold p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 2: DAFTAR ANGGOTA & STATUS ONLINE */}
                {activeChatTab === 'members' && (
                  <div className="flex-1 flex flex-col min-h-0 p-4">
                    <div className="mb-3 shrink-0 flex items-center gap-2">
                      <input 
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="Cari nama, posisi, atau nomor punggung..."
                        className="flex-1 bg-[#1a1a1a] border border-[#333] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#d4af37]"
                      />
                      <button 
                        onClick={() => exportDataToCSV(allUsers.filter(u => (!u.status || u.status === 'active') && u.role !== 'admin'))}
                        className="px-3 py-2.5 bg-[#27ae60]/15 hover:bg-[#27ae60] text-[#27ae60] hover:text-white border border-[#27ae60]/30 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Ekspor daftar anggota CSV"
                      >
                        <Download size={13} />
                        <span className="hidden sm:inline">Ekspor</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#d4af37]/30">
                      {allUsers
                        .filter(u => (!u.status || u.status === 'active') && u.role !== 'admin')
                        .filter(u => 
                          u.nama.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
                          (u.posisi || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                          (u.jerseyNumber || '').includes(memberSearchQuery)
                        )
                        .sort((a, b) => {
                          const aOnline = a.lastActive && currentTime > 0 && (currentTime - a.lastActive < 90000) ? 1 : 0;
                          const bOnline = b.lastActive && currentTime > 0 && (currentTime - b.lastActive < 90000) ? 1 : 0;
                          return bOnline - aOnline;
                        })
                        .map((u) => {
                          const isOnline = u.lastActive && currentTime > 0 && (currentTime - u.lastActive < 90000);
                          return (
                            <div 
                              key={u.wa} 
                              onClick={() => setSelectedMember(u)}
                              className="flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#222] border border-[#262626] hover:border-[#444] transition-all cursor-pointer group"
                              title="Klik untuk lihat profil lengkap"
                            >
                              <div className="flex items-center gap-3 text-left">
                                <PlayerAvatar user={u} size="md" showOnline={true} />
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-white group-hover:text-[#d4af37] transition-colors">{u.nama}</p>
                                    {u.jerseyNumber && (
                                      <span 
                                        className="text-[9px] px-1.5 py-0.2 rounded font-black border"
                                        style={{
                                          color: u.themeColor || '#d4af37',
                                          borderColor: `${u.themeColor || '#d4af37'}40`,
                                          backgroundColor: `${u.themeColor || '#d4af37'}15`
                                        }}
                                      >
                                        #{u.jerseyNumber}
                                      </span>
                                    )}
                                    <span className="text-[9px] bg-[#2a2a2a] text-[#aaa] px-1.5 py-0.2 rounded font-medium">{u.posisi || 'Member'}</span>
                                  </div>
                                  <p className="text-[10px] text-[#777] mt-0.5">
                                    {isOnline ? (
                                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online sekarang
                                      </span>
                                    ) : (
                                      <span>Offline</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setSelectedMember(u)}
                                  className="px-2.5 py-1.5 bg-[#333] hover:bg-[#444] text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Lihat Profil"
                                >
                                  <Eye size={12} />
                                  <span className="hidden sm:inline">Profil</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveChatTab('chat');
                                    setChatInput(`@${u.nama} `);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Tag
                                </button>
                                <button 
                                  onClick={() => window.open(`https://wa.me/${u.wa.replace(/^0/, '62')}`, '_blank')}
                                  className="p-1.5 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* --- POPUP KARTU PROFIL MEMBER (LIHAT PROFIL ANTAR ANGGOTA) --- */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-[550] flex justify-center items-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-[#121212] w-full max-w-[360px] rounded-[24px] border overflow-hidden relative shadow-[0_15px_50px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
            style={{ borderColor: selectedMember.themeColor || '#d4af37' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Banner Header with Dynamic Color */}
            <div 
              className="h-24 w-full relative flex items-end justify-center p-4"
              style={{
                background: `linear-gradient(135deg, ${selectedMember.themeColor || '#d4af37'}33 0%, #121212 100%)`
              }}
            >
              <button 
                onClick={() => setSelectedMember(null)} 
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <X size={18} />
              </button>

              {selectedMember.jerseyNumber && (
                <div 
                  className="absolute top-3 left-4 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1 shadow-sm"
                  style={{
                    backgroundColor: selectedMember.themeColor || '#d4af37',
                    color: '#000'
                  }}
                >
                  <Shirt size={12} />
                  <span>#{selectedMember.jerseyNumber}</span>
                </div>
              )}
            </div>

            {/* Avatar & Player Info */}
            <div className="px-5 pb-6 text-center -mt-12 flex flex-col items-center">
              <div className="mb-3">
                <PlayerAvatar 
                  user={selectedMember} 
                  size="xl" 
                  showOnline={true}
                />
              </div>

              <h3 className="text-xl font-black text-white capitalize tracking-wide flex items-center justify-center gap-2">
                {selectedMember.nama}
              </h3>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    color: selectedMember.themeColor || '#d4af37',
                    borderColor: `${selectedMember.themeColor || '#d4af37'}50`,
                    backgroundColor: `${selectedMember.themeColor || '#d4af37'}15`
                  }}
                >
                  {selectedMember.posisi || 'Member'}
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {selectedMember.id || 'FUTSAR-MEMBER'}
                </span>
                {selectedMember.role === 'admin' && (
                  <span className="bg-[#e53e3e]/20 text-[#e53e3e] border border-[#e53e3e]/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                )}
                {selectedMember.avatarBorder && selectedMember.avatarBorder !== 'classic' && (
                  <span className="bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Award size={10} /> {AVATAR_BORDERS.find(b => b.id === selectedMember.avatarBorder)?.name || selectedMember.avatarBorder}
                  </span>
                )}
              </div>

              {/* Bio / Motto */}
              {selectedMember.bio ? (
                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 w-full">
                  <p className="text-xs italic text-gray-300 leading-relaxed">
                    &ldquo;{selectedMember.bio}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="mt-3 text-[11px] text-gray-500 italic">
                  Belum menuliskan motto pemain.
                </div>
              )}

              {/* Status Online & Info Details */}
              <div className="w-full mt-4 border-t border-white/10 pt-3 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Activity size={13} className="text-gray-500" /> Status Aktivitas
                  </span>
                  {selectedMember.lastActive && currentTime > 0 && (currentTime - selectedMember.lastActive < 90000) ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                    </span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-gray-500" /> Tema Favorit
                  </span>
                  <span className="font-semibold capitalize text-gray-300 flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: selectedMember.themeColor || '#d4af37' }} 
                    />
                    {PROFILE_THEMES.find(t => t.color === selectedMember.themeColor)?.name || 'Gold Champion'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-5 flex flex-col gap-2">
                {user && user.wa === selectedMember.wa ? (
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setActiveModal('profile');
                    }}
                    className="w-full py-2.5 rounded-xl text-black font-black text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: selectedMember.themeColor || '#d4af37' }}
                  >
                    <Settings size={14} /> Edit Profil Saya
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        const targetName = selectedMember.nama;
                        setSelectedMember(null);
                        setActiveModal('community_chat');
                        setActiveChatTab('chat');
                        setChatInput(`@${targetName} `);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      <MessageSquare size={14} className="text-[#d4af37]" /> Sapa di Chat
                    </button>
                    {selectedMember.wa && selectedMember.wa !== 'ADMIN' && (
                      <button
                        onClick={() => window.open(`https://wa.me/${selectedMember.wa.replace(/^0/, '62')}`, '_blank')}
                        className="flex-1 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-[#25D366]/40"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
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
        <AdminDashboard 
          settings={settings} 
          onUpdateSettings={updateSettings} 
          onLogout={handleLogout} 
          onOpenChat={() => setActiveModal('community_chat')}
          onSelectMember={(m) => setSelectedMember(m)}
          onExportCSV={exportDataToCSV}
        />
      )}

      {selectedGalleryPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 z-[600] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <button 
            onClick={() => setSelectedGalleryPhoto(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-black/50 border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-colors z-[610] shadow-xl"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedGalleryPhoto} 
            alt="Fullscreen Gallery" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl relative z-[605] animate-in zoom-in-50 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </main>
  );
}

function AdminDashboard({ 
  settings, 
  onUpdateSettings, 
  onLogout, 
  onOpenChat,
  onSelectMember,
  onExportCSV
}: { 
  settings: AppSettings, 
  onUpdateSettings: (s: AppSettings) => void, 
  onLogout: () => void, 
  onOpenChat?: () => void,
  onSelectMember?: (m: User) => void,
  onExportCSV?: (users: User[]) => void
}) {
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
          {onExportCSV && (
            <button 
              onClick={() => onExportCSV([...activeUsers, ...pendingUsers])}
              className="px-3.5 py-2 bg-[#27ae60]/15 hover:bg-[#27ae60] text-[#27ae60] hover:text-white border border-[#27ae60]/40 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
              title="Unduh data seluruh member & status kas dalam format CSV"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Ekspor Data CSV</span>
            </button>
          )}
          {onOpenChat && (
            <button 
              onClick={onOpenChat}
              className="px-3.5 py-2 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 rounded-lg text-xs font-bold uppercase transition-all hover:bg-[#d4af37] hover:text-black flex items-center gap-2"
            >
              <MessagesSquare size={16} />
              <span>Ruang Chat</span>
            </button>
          )}
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
                  defaultValue={settings.adminWa || '123456789'} 
                  className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#e53e3e] transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Kata Sandi Admin Baru</label>
                <input 
                  type="text" 
                  name="adminPassword" 
                  defaultValue={settings.adminPassword || 'Admin01'} 
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
                    <div 
                      className="text-left flex-1 cursor-pointer"
                      onClick={() => onSelectMember && onSelectMember(u)}
                      title="Klik untuk lihat profil"
                    >
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide hover:text-[#3498db] transition-colors">
                        {u.nama} <span className="text-[10px] text-[#3498db] ml-2">({u.id})</span>
                      </p>
                      <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • Posisi: {u.posisi}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      {onSelectMember && (
                        <button 
                          onClick={() => onSelectMember(u)} 
                          className="px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Profil
                        </button>
                      )}
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[#27ae60] font-black text-xl uppercase tracking-widest">Manajemen Uang Kas</h3>
                <p className="text-xs text-[#888] mt-0.5">Konfirmasi pembayaran anggota yang aktif.</p>
              </div>
              {onExportCSV && (
                <button 
                  onClick={() => onExportCSV(activeUsers)}
                  className="px-3 py-1.5 bg-[#27ae60]/20 hover:bg-[#27ae60] text-[#27ae60] hover:text-white border border-[#27ae60]/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Ekspor Data Kas"
                >
                  <Download size={13} /> Ekspor Kas
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#27ae60] pr-2">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Belum ada anggota yang aktif.</p>
              ) : (
                activeUsers.map((u) => (
                  <div key={u.wa} className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 ${u.isPaid ? 'border-[#27ae60]' : 'border-[#ff4d4d]'} gap-4`}>
                    <div 
                      className="text-left flex-1 cursor-pointer"
                      onClick={() => onSelectMember && onSelectMember(u)}
                      title="Klik untuk lihat profil"
                    >
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide hover:text-[#d4af37] transition-colors flex items-center gap-2">
                        {u.nama} 
                        {u.jerseyNumber && <span className="text-[10px] text-[#888]">#{u.jerseyNumber}</span>}
                        <span className="text-[10px] text-[#aaa] ml-1">({u.id})</span>
                      </p>
                      <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • {settings.activePaymentCycle === 'bulanan' ? 'Bulanan' : 'Mingguan'}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      {onSelectMember && (
                        <button 
                          onClick={() => onSelectMember(u)}
                          className="px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Profil
                        </button>
                      )}
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[#9b59b6] font-black text-xl uppercase tracking-widest">Manajemen Akun Terdaftar</h3>
                <p className="text-xs text-[#888] mt-0.5">Daftar semua anggota aktif. Hapus akun jika melanggar.</p>
              </div>
              {onExportCSV && (
                <button 
                  onClick={() => onExportCSV(activeUsers)}
                  className="px-3 py-1.5 bg-[#9b59b6]/20 hover:bg-[#9b59b6] text-[#9b59b6] hover:text-white border border-[#9b59b6]/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Ekspor Data Anggota"
                >
                  <Download size={13} /> Ekspor Anggota
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#9b59b6] pr-2">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Belum ada anggota yang aktif.</p>
              ) : (
                activeUsers.map((u) => {
                  const now = new Date().getTime();
                  const isOnline = u.lastActive && (now - u.lastActive < 60000); // 1 menit
                  return (
                    <div key={u.wa} className="flex justify-between items-center bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#9b59b6] gap-4">
                      <div 
                        className="text-left flex-1 cursor-pointer"
                        onClick={() => onSelectMember && onSelectMember(u)}
                        title="Klik untuk lihat kartu profil"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-white uppercase tracking-wide hover:text-[#9b59b6] transition-colors">{u.nama}</p>
                          <span 
                            className="flex items-center justify-center w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: isOnline ? '#27ae60' : '#e53e3e', boxShadow: isOnline ? '0 0 8px rgba(39,174,96,0.5)' : 'none' }}
                            title={isOnline ? "Online" : "Offline"}
                          ></span>
                          {u.jerseyNumber && <span className="text-[10px] text-[#888]">#{u.jerseyNumber}</span>}
                        </div>
                        <p className="text-[11px] text-[#aaa] m-0">No WA: {u.wa} • Sandi: {u.password || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {onSelectMember && (
                          <button 
                            onClick={() => onSelectMember(u)}
                            className="px-2.5 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            Profil
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus akun ${u.nama}?`)) {
                              deleteDoc(doc(db, "users", u.wa));
                            }
                          }}
                          className="text-[#e53e3e] hover:text-white transition-colors p-1.5 rounded"
                          title="Hapus Akun"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
              {(settings.gallery || []).map((photo, index) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <div className="absolute top-2 left-2 bg-black/60 text-[#d4af37] text-[10px] font-bold px-2 py-1 rounded-md z-10">#{(settings.gallery || []).length - index}</div>
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
