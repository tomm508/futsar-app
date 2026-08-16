/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { hashPassword, verifyPassword } from '../lib/security';
import { FutsarClubLogo } from '../components/FutsarLogo';

import { 
  Menu, X, MapPin, Instagram, AlertTriangle, LogOut, 
  Calendar, Wallet, ClipboardList, MessageCircle, Clock, Shirt, Star, QrCode,
  Users, Info, FileText, CheckCircle, XCircle, Camera, Edit2, UserCircle, Image as ImageIcon, Trash2, Plus,
  Lock, ShieldCheck, Bot, Send, MessageSquare, MessagesSquare, CheckCheck, Smile, Radio,
  Download, Palette, Sparkles, ExternalLink, Eye, Award, Shield, Activity, Settings,
  Flame, Zap, Crown, Gift, Ticket, ArrowLeft, Check, Layers, Quote
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

export const PROFILE_COVERS = [
  { id: 'ancient_god', name: 'Dewa Kuno Surgawi', price: 0, category: 'Renegade Series', url: '/cover-ancient-god.jpg', desc: 'Aura dewa kuno emas berawan mistis & cahaya kosmik abadi' },
  { id: 'dragon', name: 'Naga Kosmik Emas', price: 15000, category: 'Dragon Series', url: '/cover-dragon.jpg', desc: 'Naga emas legendaris meluncur di kabut nebula kosmik' },
  { id: 'cyber', name: 'Cyber Stadium Night', price: 10000, category: 'Cyber Series', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80', desc: 'Stadion megah berlatar lampu neon modern' },
  { id: 'aurora', name: 'Golden Sunset Aurora', price: 10000, category: 'Golden Series', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80', desc: 'Cahaya emas senja hangat berkilau' },
  { id: 'abyss', name: 'Cosmic Violet Realm', price: 15000, category: 'Abyss Series', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80', desc: 'Galaksi ungu mistis dan gugusan bintang bersinar' },
];

export type StyleItemConfig = {
  id: string;
  name?: string;
  price: number;
  category?: string;
  desc?: string;
  isAvailable?: boolean;
};

export type CustomVoucher = {
  id: string;
  code: string;
  rewardPoints: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
};

const DEFAULT_AVATAR_BORDERS: StyleItemConfig[] = [
  { id: 'classic', name: 'Solid Klasik', price: 0, category: 'Basic', desc: 'Ring solid tegas selaras warna tema', isAvailable: true },
  { id: 'dewa_kuno', name: '亗 Dewa Kuno (Ancient God)', price: 30000, category: 'Renegade Series', desc: 'Mahkota suci emas, bintang kristal 3D, dan sayap surgawi dewa kuno', isAvailable: true },
  { id: 'wanglin', name: 'Wang Lin (Slaughter Flame)', price: 15000, category: 'Renegade Series', desc: 'Aura spiritual domain pembantaian berapi merah emas', isAvailable: true },
  { id: 'wanglin2', name: 'Wang Lin II (Cosmic Void)', price: 25000, category: 'Renegade Series', desc: 'Evolusi aura spiritual tingkat dewa galaksi kosmik', isAvailable: true },
  { id: 'dragon', name: 'White Imperial Dragon', price: 15000, category: 'Dragon Series', desc: 'Naga emas legendaris dengan mutiara naga bersinar', isAvailable: true },
  { id: 'nika', name: 'Sun God Nika', price: 25000, category: 'One Piece Series', desc: 'Aura kebebasan sang dewa matahari dengan petir keemasan', isAvailable: true },
  { id: 'sasuke', name: 'Sasuke Susanoo', price: 15000, category: 'Naruto Series', desc: 'Cakra ungu Susanoo dengan mata Sharingan berputar', isAvailable: true },
];

const AVATAR_BORDERS = DEFAULT_AVATAR_BORDERS;

export const getMergedBorders = (settings?: AppSettings): StyleItemConfig[] => {
  if (!settings?.styleList || settings.styleList.length === 0) {
    return DEFAULT_AVATAR_BORDERS;
  }
  return DEFAULT_AVATAR_BORDERS.map(def => {
    const custom = settings.styleList?.find(s => s.id === def.id);
    if (custom) {
      return { ...def, ...custom };
    }
    return def;
  });
};

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
  passwordHash?: string;
  paymentCycle?: 'mingguan' | 'bulanan';
  isPaid?: boolean;
  lastPaymentDate?: string | null;
  lastActive?: number;
  role?: 'member' | 'admin';
  status?: 'pending' | 'active' | 'rejected';
  avatarUrl?: string;
  coverUrl?: string;
  jerseyNumber?: string;
  bio?: string;
  themeColor?: string;
  avatarBorder?: string;
  nickStyle?: string;
  points?: number;
  ownedBorders?: string[];
  ownedCovers?: string[];
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
    xs: { wrapper: 'w-[34px] h-[34px]', inner: 'w-[24px] h-[24px] text-[10px]' },
    sm: { wrapper: 'w-[44px] h-[44px]', inner: 'w-[32px] h-[32px] text-xs' },
    md: { wrapper: 'w-[56px] h-[56px]', inner: 'w-[40px] h-[40px] text-sm' },
    lg: { wrapper: 'w-[78px] h-[78px]', inner: 'w-[56px] h-[56px] text-xl' },
    xl: { wrapper: 'w-[104px] h-[104px]', inner: 'w-[74px] h-[74px] text-2xl' },
    '2xl': { wrapper: 'w-[128px] h-[128px]', inner: 'w-[90px] h-[90px] text-3xl' }
  }[size] || { wrapper: 'w-[56px] h-[56px]', inner: 'w-[40px] h-[40px] text-sm' };

  const isSmall = size === 'xs';

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      <div className={`${sizeStyles.wrapper} relative flex items-center justify-center`}>
        {/* ================= ANIMATED BORDER LAYERS (Hanya Border yang Bergerak) ================= */}
        {borderStyle === 'dewa_kuno' && (
          <>
            {/* Outer Divine Ancient God Celestial Halo */}
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 blur-[8px] opacity-90 animate-dewa-pulse pointer-events-none" />
            
            {/* Layer 1: Rotating Ancient Golden Rune Ring */}
            <div className="absolute -inset-0.5 rounded-full bg-[conic-gradient(from_0deg,#ffd700,#fff5c0,#d4af37,#ffffff,#b45309,#fef08a,#ffd700)] p-[3.5px] shadow-[0_0_22px_rgba(245,158,11,1),0_0_32px_rgba(253,224,71,0.9)] animate-flame-flow pointer-events-none" />
            
            {/* Layer 2: Counter-Rotating Diamond Runic Stars Ring */}
            <div className="absolute inset-0 rounded-full border border-yellow-200/90 animate-reverse-spin pointer-events-none" />
            
            {/* Layer 3: Orbiting 4-Point Celestial Diamonds */}
            <div className="absolute -inset-1 rounded-full animate-dragon-orbit pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 shadow-[0_0_10px_#ffffff,0_0_16px_#ffd700] block animate-star-twinkle" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-yellow-200 rotate-45 shadow-[0_0_10px_#fde047] block animate-star-twinkle" />
            </div>
            
            {/* Inner Golden Bevel */}
            <div className="absolute inset-[3.5px] rounded-full border-2 border-amber-300/90 pointer-events-none" />
          </>
        )}

        {borderStyle === 'nika' && (
          <>
            {/* Outer Solar Flame / Steam Aura */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-white via-cyan-300 to-amber-300 blur-[6px] opacity-75 animate-cloud-float pointer-events-none" />
            {/* Rotating Sun God Nika Frame (Vivid High Contrast Conic) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ffffff,#38bdf8,#fef08a,#f59e0b,#38bdf8,#ffffff)] p-[3.5px] shadow-[0_0_16px_rgba(255,255,255,0.95),0_0_24px_rgba(56,189,248,0.85)] animate-nika-spin pointer-events-none" />
            {/* Orbiting Solar Lightning Sparkle */}
            <div className="absolute inset-0 rounded-full animate-nika-spin pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#fde047] block" />
            </div>
            <div className="absolute inset-[3px] rounded-full border border-amber-300/80 pointer-events-none" />
          </>
        )}

        {borderStyle === 'sasuke' && (
          <>
            {/* Outer Susanoo Chakra Aura */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-fuchsia-600 blur-[7px] opacity-80 animate-susanoo-flame pointer-events-none" />
            {/* Pulsing & Rotating Susanoo Dark Flame Ring (Vivid Conic) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#c084fc,#9333ea,#4f46e5,#f43f5e,#9333ea,#c084fc)] p-[3.5px] shadow-[0_0_18px_rgba(168,85,247,0.95),0_0_26px_rgba(126,34,206,0.8)] animate-susanoo-pulse pointer-events-none" />
            {/* Orbiting Susanoo Purple Spark */}
            <div className="absolute inset-0 rounded-full animate-sharingan-spin pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-200 shadow-[0_0_8px_#c084fc,0_0_14px_#a855f7] block" />
            </div>
            <div className="absolute inset-[3px] rounded-full border border-purple-300/80 pointer-events-none" />
          </>
        )}

        {borderStyle === 'dragon' && (
          <>
            {/* Outer Dragon Shimmer Aura */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 blur-[6px] opacity-80 animate-celestial-pulse pointer-events-none" />
            {/* Rotating Imperial Dragon Golden Ring (Vivid Conic) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#fbbf24,#f59e0b,#ffffff,#fef08a,#d97706,#fbbf24)] p-[3.5px] shadow-[0_0_18px_rgba(245,158,11,0.95),0_0_28px_rgba(251,191,36,0.85)] animate-dragon-orbit pointer-events-none" />
            {/* Orbiting Golden Dragon Pearl */}
            <div className="absolute inset-0 rounded-full animate-dragon-orbit pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_8px_#fbbf24,0_0_14px_#fde047] block" />
            </div>
            <div className="absolute inset-[3px] rounded-full border border-yellow-200/90 pointer-events-none" />
          </>
        )}

        {borderStyle === 'wanglin' && (
          <>
            {/* Outer Ancient Slaughter Domain Aura */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-red-600 via-amber-500 to-red-800 blur-[6px] opacity-80 animate-celestial-pulse pointer-events-none" />
            {/* Flowing Slaughter Flame Ring (Vivid Conic) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ef4444,#f59e0b,#991b1b,#fca5a5,#dc2626,#ef4444)] p-[3.5px] shadow-[0_0_18px_rgba(239,68,68,0.95),0_0_28px_rgba(217,119,6,0.8)] animate-flame-flow pointer-events-none" />
            {/* Orbiting Slaughter Spark */}
            <div className="absolute inset-0 rounded-full animate-flame-flow pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_8px_#ef4444,0_0_14px_#f59e0b] block" />
            </div>
            <div className="absolute inset-[3px] rounded-full border border-amber-300/80 pointer-events-none" />
          </>
        )}

        {borderStyle === 'wanglin2' && (
          <>
            {/* Outer Cosmic Void Energy */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 blur-[7px] opacity-85 animate-pulse pointer-events-none" />
            {/* Cosmic Void Domain Rotating Core Ring (Vivid Conic) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#ec4899,#06b6d4,#38bdf8)] p-[3.5px] shadow-[0_0_20px_rgba(56,189,248,0.95),0_0_30px_rgba(147,51,234,0.85)] animate-cosmic-spin pointer-events-none" />
            {/* Orbiting Cosmic Divine Energy Bead */}
            <div className="absolute inset-0 rounded-full animate-cosmic-spin pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_10px_#38bdf8,0_0_18px_#06b6d4] block" />
            </div>
            <div className="absolute inset-[3px] rounded-full border border-cyan-300/90 pointer-events-none" />
          </>
        )}

        {(borderStyle === 'classic' || !AVATAR_BORDERS.find(b => b.id === borderStyle)) && (
          <div 
            className="absolute inset-0 rounded-full border-[3px] pointer-events-none"
            style={{ 
              borderColor: theme, 
              boxShadow: `0 0 14px ${theme}66` 
            }} 
          />
        )}

        {/* ================= STATIC INNER PHOTO (Foto Tetap Diam & Jernih) ================= */}
        <div className={`${sizeStyles.inner} rounded-full overflow-hidden bg-[#161616] flex items-center justify-center relative z-10 shadow-inner ring-1 ring-black/80 shrink-0`}>
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

        {/* ================= FRAME EMBELLISHMENTS & BADGES (Z-20) ================= */}
        {/* Dewa Kuno (Ancient God) Embellishments */}
        {!isSmall && borderStyle === 'dewa_kuno' && (
          <>
            {/* Top Ancient God Sovereign Golden Crown with Ruby Gem */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none filter drop-shadow-[0_2px_8px_rgba(245,158,11,1)]" title="Mahkota Dewa Kuno">
              <svg viewBox="0 0 28 14" className="w-8 h-4">
                <path d="M2 14 L5 4 L10 9 L14 1 L18 9 L23 4 L26 14 Z" fill="url(#goldCrownGrad)" stroke="#ffd700" strokeWidth="0.8" />
                <circle cx="14" cy="5" r="1.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
                <circle cx="5" cy="4" r="1" fill="#ffffff" />
                <circle cx="23" cy="4" r="1" fill="#ffffff" />
                <defs>
                  <linearGradient id="goldCrownGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff8db" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Bottom Imperial Gold Sovereign Plaque / Wings */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" title="Segel Dewa Kuno">
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-yellow-200 text-[8px] font-black text-black tracking-widest shadow-md">
                <span>亗</span>
              </div>
            </div>

            {/* Right Diamond Star Sparkle */}
            <span className="absolute top-1/2 -right-2.5 -translate-y-1/2 z-20 text-[12px] text-yellow-100 animate-star-twinkle drop-shadow-[0_0_6px_rgba(255,255,255,1)] pointer-events-none" title="Bintang Surgawi">
              ✦
            </span>
            {/* Left Diamond Star Sparkle */}
            <span className="absolute top-1/2 -left-2.5 -translate-y-1/2 z-20 text-[12px] text-yellow-100 animate-star-twinkle drop-shadow-[0_0_6px_rgba(255,255,255,1)] pointer-events-none" title="Bintang Surgawi">
              ✦
            </span>
          </>
        )}

        {/* Nika Series Embellishments */}
        {!isSmall && borderStyle === 'nika' && (
          <>
            <span className="absolute -bottom-1.5 -left-2 z-20 flex items-center justify-center filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" title="Sun God Nika Straw Hat">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <ellipse cx="12" cy="15" rx="10" ry="3.5" fill="#eab308" stroke="#a16207" strokeWidth="1" />
                <path d="M7 14 C7 8 17 8 17 14 Z" fill="#facc15" stroke="#a16207" strokeWidth="1" />
                <rect x="7" y="12.5" width="10" height="2" fill="#ef4444" rx="0.5" />
              </svg>
            </span>
            <span className="absolute -top-1.5 -right-1.5 z-20 text-[13px] text-amber-300 animate-lightning-flash drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] font-black" title="Nika Lightning">
              ⚡
            </span>
          </>
        )}

        {/* Sasuke Series Embellishments */}
        {!isSmall && borderStyle === 'sasuke' && (
          <>
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none" title="Susanoo Crest">
              <svg viewBox="0 0 24 12" className="w-7 h-3.5 text-purple-400 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]">
                <path d="M2 12 L8 2 L12 7 L16 2 L22 12 Z" fill="currentColor" />
              </svg>
            </span>
            <span className="absolute -bottom-1.5 -right-1.5 z-20 w-4.5 h-4.5 rounded-full bg-red-600 border border-black flex items-center justify-center animate-sharingan-spin shadow-[0_0_10px_rgba(239,68,68,0.9)]" title="Sharingan Tomoe">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-black">
                <circle cx="10" cy="10" r="2" fill="black" />
                <circle cx="10" cy="5" r="1.5" fill="black" />
                <circle cx="6" cy="13" r="1.5" fill="black" />
                <circle cx="14" cy="13" r="1.5" fill="black" />
              </svg>
            </span>
          </>
        )}

        {/* Dragon Series Embellishments */}
        {!isSmall && borderStyle === 'dragon' && (
          <>
            <span className="absolute -top-2 -right-2 z-20 text-[15px] drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" title="White Dragon Head">
              🐉
            </span>
            <span className="absolute -bottom-1.5 -left-1.5 z-20 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-amber-400" title="Dragon Pearl" />
          </>
        )}

        {/* Wang Lin Series Embellishments */}
        {!isSmall && borderStyle === 'wanglin' && (
          <>
            <span className="absolute -top-2 -left-2 z-20 text-[14px] drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" title="Ancient Slaughter Essence">
              🔥
            </span>
            <span className="absolute -bottom-1.5 -right-1.5 z-20 w-3.5 h-3.5 rotate-45 bg-gradient-to-tr from-red-600 to-amber-400 border border-amber-300 shadow-[0_0_8px_rgba(239,68,68,0.9)]" title="Slaughter Domain" />
          </>
        )}

        {/* Wang Lin II Cosmic Embellishments */}
        {!isSmall && borderStyle === 'wanglin2' && (
          <>
            <span className="absolute -top-2 -right-2 z-20 text-[14px] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] font-black" title="Cosmic Void Domain">
              ✨
            </span>
            <span className="absolute -bottom-1.5 -left-1.5 z-20 w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.9)] border border-white" title="Divine Core" />
          </>
        )}
      </div>

      {isOnline && (
        <span 
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse z-30" 
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


function GeminiScreenAurora({ intensity = 'subtle' }: { intensity?: 'subtle' | 'normal' | 'vibrant' }) {
  const opacityClass = intensity === 'subtle' ? 'opacity-30' : intensity === 'vibrant' ? 'opacity-60' : 'opacity-40';
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${opacityClass}`}>
      {/* Top Left */}
      <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#4285f4] via-[#2b71f0] to-[#00f2fe] blur-[80px] animate-gemini-float-1" />
      
      {/* Top Right */}
      <div className="absolute -top-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-[#9b51e0] via-[#d946ef] to-[#7928ca] blur-[90px] animate-gemini-float-2" />
      
      {/* Bottom Left */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#06b6d4] to-[#10b981] blur-[80px] animate-gemini-float-2" />
      
      {/* Bottom Right */}
      <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-[#ffd700] via-[#f59e0b] to-[#9b51e0] blur-[80px] animate-gemini-float-1" />
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
  dailyClaimPoints?: number;
  styleList?: StyleItemConfig[];
  customVouchers?: CustomVoucher[];
};

const defaultSettings: AppSettings = {
  activePaymentCycle: 'mingguan',
  kasMingguan: 20000,
  kasBulanan: 80000,
  adminWa: '123456789',
  adminPassword: 'Admin01',
  bgVideoUrl: '/logo-futsar.mp4',
  bgInsideUrl: '/logo-futsar.mp4',
  dailyClaimPoints: 1000,
  styleList: DEFAULT_AVATAR_BORDERS,
  customVouchers: [
    { id: 'v1', code: 'FUTSARJUARA', rewardPoints: 5000, description: 'Bonus Selamat Datang', isActive: true },
    { id: 'v2', code: 'NIKA2026', rewardPoints: 10000, description: 'Series One Piece Promo', isActive: true },
    { id: 'v3', code: 'SASUKE2026', rewardPoints: 10000, description: 'Series Naruto Promo', isActive: true },
    { id: 'v4', code: 'DRAGON2026', rewardPoints: 10000, description: 'Series Dragon Promo', isActive: true },
    { id: 'v5', code: 'WANGLIN2026', rewardPoints: 15000, description: 'Series Renegade Promo', isActive: true },
    { id: 'v6', code: 'FUTSARSTYLE', rewardPoints: 5000, description: 'Bonus Spesial Futsar Style', isActive: true }
  ],
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
  const [activeModal, setActiveModal] = useState<'daftar' | 'masuk' | 'jadwal' | 'kas' | 'rekap_kas' | 'taktik' | 'info' | 'chat_admin' | 'profile' | 'gallery' | 'ai_bot' | 'community_chat' | 'deco' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingThemeColor, setEditingThemeColor] = useState<string>('#d4af37');
  const [editingAvatarBorder, setEditingAvatarBorder] = useState<string>('classic');
  const [editingCoverUrl, setEditingCoverUrl] = useState<string>('/cover-ancient-god.jpg');
  const [editingNickStyle, setEditingNickStyle] = useState<string>('dewa');
  
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
  const [lastChatSendTime, setLastChatSendTime] = useState<number>(0);
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
  

  // Deco & Points State
  const [decoTab, setDecoTab] = useState<'deco' | 'covers' | 'kado' | 'voucher' | 'riwayat'>('deco');
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherFeedback, setVoucherFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [kadoRecipientWa, setKadoRecipientWa] = useState('');
  const [kadoAmount, setKadoAmount] = useState('');
  const [kadoBorderId, setKadoBorderId] = useState('dewa_kuno');

  const handleBuyBorder = async (borderId: string, price: number) => {
    if (!user) return;
    if (user.role === 'admin') {
      const currentOwned = user.ownedBorders || ['classic'];
      const newOwned = currentOwned.includes(borderId) ? currentOwned : [...currentOwned, borderId];
      setUser({ ...user, avatarBorder: borderId, ownedBorders: newOwned });
      alert('Border berhasil diaktifkan untuk Admin!');
      return;
    }

    if ((user.points || 0) < price) {
      alert('Poin kamu tidak cukup untuk membeli border ini! Dapatkan poin lewat klaim harian, voucher, atau minta admin.');
      return;
    }
    const currentOwned = user.ownedBorders || ['classic'];
    if (currentOwned.includes(borderId)) {
      alert('Border ini sudah kamu miliki! Klik Pakai untuk menggunakannya.');
      return;
    }
    
    try {
      await updateDoc(doc(db, "users", user.wa), {
        points: (user.points || 0) - price,
        ownedBorders: [...currentOwned, borderId],
        avatarBorder: borderId
      });
      alert('Selamat! Border berhasil dibeli dan langsung dipakai.');
    } catch (err) {
      console.error(err);
      alert('Gagal membeli border. Silakan coba lagi.');
    }
  };

  const handleEquipBorder = async (borderId: string) => {
    if (!user) return;
    if (user.role === 'admin') {
      setUser({ ...user, avatarBorder: borderId });
      alert('Border berhasil dipakai!');
      return;
    }
    try {
      await updateDoc(doc(db, "users", user.wa), {
        avatarBorder: borderId
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyCover = async (coverUrl: string, price: number) => {
    if (!user) return;
    if (user.role === 'admin') {
      const currentOwned = user.ownedCovers || ['/cover-ancient-god.jpg'];
      const newOwned = currentOwned.includes(coverUrl) ? currentOwned : [...currentOwned, coverUrl];
      setUser({ ...user, coverUrl, ownedCovers: newOwned });
      alert('Sampul profil berhasil diaktifkan untuk Admin!');
      return;
    }

    if ((user.points || 0) < price) {
      alert('Poin kamu tidak cukup untuk membeli sampul ini!');
      return;
    }
    const currentOwned = user.ownedCovers || ['/cover-ancient-god.jpg'];
    if (currentOwned.includes(coverUrl)) {
      alert('Sampul ini sudah kamu miliki!');
      return;
    }
    
    try {
      await updateDoc(doc(db, "users", user.wa), {
        points: (user.points || 0) - price,
        ownedCovers: [...currentOwned, coverUrl],
        coverUrl
      });
      alert('Selamat! Sampul profil berhasil dibeli dan langsung dipakai.');
    } catch (err) {
      console.error(err);
      alert('Gagal membeli sampul profil. Silakan coba lagi.');
    }
  };

  const handleEquipCover = async (coverUrl: string) => {
    if (!user) return;
    if (user.role === 'admin') {
      setUser({ ...user, coverUrl });
      alert('Sampul profil berhasil dipakai!');
      return;
    }
    try {
      await updateDoc(doc(db, "users", user.wa), {
        coverUrl
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimDailyPoints = async () => {
    if (!user) return;
    if (user.role === 'admin') {
      alert('Admin memiliki akses tak terbatas ke semua fitur & style.');
      return;
    }

    const todayStr = new Date().toDateString();
    const lastClaim = localStorage.getItem(`daily_claim_${user.wa}`);
    const claimAmount = settings.dailyClaimPoints || 1000;
    if (lastClaim === todayStr) {
      alert(`Kamu sudah klaim bonus harian hari ini (+${claimAmount.toLocaleString()} Poin)! Silakan kembali besok.`);
      return;
    }

    try {
      const newPoints = (user.points || 0) + claimAmount;
      await updateDoc(doc(db, "users", user.wa), { points: newPoints });
      localStorage.setItem(`daily_claim_${user.wa}`, todayStr);
      alert(`🎉 Hore! Berhasil klaim +${claimAmount.toLocaleString()} Poin Harian Futsar Style!`);
    } catch (e) {
      console.error(e);
      alert('Gagal klaim poin. Coba beberapa saat lagi.');
    }
  };

  const handleRedeemVoucher = async () => {
    if (!user) return;
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherFeedback({ type: 'error', message: 'Masukkan kode voucher terlebih dahulu!' });
      return;
    }

    const defaultVouchers: Record<string, number> = {
      'FUTSARJUARA': 5000,
      'NIKA2026': 10000,
      'SASUKE2026': 10000,
      'DRAGON2026': 10000,
      'WANGLIN2026': 15000,
      'FUTSALASIK': 3000,
      'FUTSARSTYLE': 5000,
      'POINBONUS': 5000,
      'FUTSAR2026': 10000
    };

    const customVoucherMap: Record<string, number> = {};
    if (settings.customVouchers) {
      settings.customVouchers.forEach(v => {
        if (v.isActive !== false) {
          customVoucherMap[v.code.trim().toUpperCase()] = v.rewardPoints;
        }
      });
    }

    const allVouchers = { ...defaultVouchers, ...customVoucherMap };

    if (!allVouchers[code]) {
      setVoucherFeedback({ type: 'error', message: 'Kode voucher tidak valid atau sudah kadaluarsa.' });
      return;
    }

    const reward = allVouchers[code];
    const redeemedKey = `voucher_${code}_${user.wa}`;
    if (localStorage.getItem(redeemedKey)) {
      setVoucherFeedback({ type: 'error', message: `Kamu sudah pernah menukarkan kode voucher ${code}!` });
      return;
    }

    try {
      if (user.role !== 'admin') {
        const newPoints = (user.points || 0) + reward;
        await updateDoc(doc(db, "users", user.wa), { points: newPoints });
      }
      localStorage.setItem(redeemedKey, 'true');
      setVoucherInput('');
      setVoucherFeedback({ type: 'success', message: `Selamat! Berhasil menukarkan kode ${code} dan mendapatkan +${reward.toLocaleString()} Poin Futsar Style!` });
    } catch (e) {
      console.error(e);
      setVoucherFeedback({ type: 'error', message: 'Gagal menukarkan voucher. Silakan coba lagi.' });
    }
  };

  const handleTransferPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = Number(kadoAmount);
    if (!kadoRecipientWa) {
      alert('Pilih teman penerima terlebih dahulu!');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('Masukkan jumlah poin yang valid!');
      return;
    }
    if ((user.points || 0) < amount && user.role !== 'admin') {
      alert('Poin kamu tidak mencukupi untuk transfer!');
      return;
    }

    const recipient = allUsers.find(u => u.wa === kadoRecipientWa);
    if (!recipient) {
      alert('Member penerima tidak ditemukan.');
      return;
    }

    try {
      if (user.role !== 'admin') {
        await updateDoc(doc(db, "users", user.wa), { points: (user.points || 0) - amount });
      }
      await updateDoc(doc(db, "users", recipient.wa), { points: (recipient.points || 0) + amount });
      alert(`Berhasil mengirimkan ${amount.toLocaleString()} Poin ke ${recipient.nama}!`);
      setKadoAmount('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan poin.');
    }
  };

  const handleGiftBorderToFriend = async () => {
    if (!user) return;
    if (!kadoRecipientWa) {
      alert('Pilih teman penerima terlebih dahulu!');
      return;
    }
    const border = AVATAR_BORDERS.find(b => b.id === kadoBorderId);
    if (!border) return;

    if ((user.points || 0) < border.price && user.role !== 'admin') {
      alert('Poin kamu tidak mencukupi untuk menghadiahkan border ini!');
      return;
    }

    const recipient = allUsers.find(u => u.wa === kadoRecipientWa);
    if (!recipient) {
      alert('Member penerima tidak ditemukan.');
      return;
    }

    const recipientOwned = recipient.ownedBorders || ['classic'];
    if (recipientOwned.includes(border.id)) {
      alert(`${recipient.nama} sudah memiliki border ${border.name}!`);
      return;
    }

    try {
      if (user.role !== 'admin') {
        await updateDoc(doc(db, "users", user.wa), { points: (user.points || 0) - border.price });
      }
      await updateDoc(doc(db, "users", recipient.wa), {
        ownedBorders: [...recipientOwned, border.id]
      });
      alert(`Berhasil menghadiahkan border ${border.name} kepada ${recipient.nama}!`);
    } catch (err) {
      console.error(err);
      alert('Gagal menghadiahkan border.');
    }
  };

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

    const now = Date.now();
    if (user.role !== 'admin' && now - lastChatSendTime < 1500) {
      alert('Tunggu 1-2 detik sebelum mengirim pesan berikutnya.');
      return;
    }

    const text = chatInput.trim().slice(0, 1000); // Batasi panjang pesan
    setChatInput('');
    setLastChatSendTime(now);
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
      timestamp: now
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

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = (formData.get('wa') as string)?.trim();
    const nama = (formData.get('nama') as string)?.trim();
    const posisi = formData.get('posisi') as string;
    const password = (formData.get('password') as string)?.trim();

    if (!wa || !nama || !password) {
      alert('Mohon isi semua data dengan lengkap.');
      return;
    }

    const passHash = await hashPassword(password);

    const newUser: User = {
      nama,
      posisi,
      wa,
      id: `FTS${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-2K26`,
      passwordHash: passHash,
      status: 'pending',
      points: 25000,
      ownedBorders: ['classic'],
      avatarBorder: 'classic'
    };

    // Save to Firestore with hashed credential
    try {
      await setDoc(doc(db, "users", wa), newUser);
      localStorage.setItem('futsar_user_wa', wa);
      setUser(newUser);
      setActiveModal(null);
    } catch (err) {
      console.error("Register error:", err);
      alert("Gagal melakukan pendaftaran. Silakan coba lagi.");
    }
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

    try {
      const userDoc = await getDoc(doc(db, "users", wa));
      
      if (userDoc.exists()) {
        const savedAccount = userDoc.data() as User;
        const isValid = await verifyPassword(password, savedAccount.password, savedAccount.passwordHash);
        
        if (isValid) {
          // Auto upgrade password ke hash jika masih plain text
          if (!savedAccount.passwordHash && savedAccount.password) {
            const newHash = await hashPassword(password);
            updateDoc(doc(db, "users", wa), { 
              passwordHash: newHash,
              password: '' // Bersihkan plain password
            }).catch(console.error);
          }

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
    } catch (err) {
      console.error("Login verification error:", err);
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
    const coverUrl = editingCoverUrl || user.coverUrl || '/cover-ancient-god.jpg';
    const nickStyle = editingNickStyle || user.nickStyle || 'dewa';

    if (user.wa === 'ADMIN' || user.role === 'admin') {
      const updatedAdmin = { ...user, posisi, jerseyNumber, bio, themeColor, avatarBorder, coverUrl, nickStyle };
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
      avatarBorder,
      coverUrl,
      nickStyle
    });
    
    alert('Profil berhasil diperbarui!');
    setActiveModal(null);
  };

  const handleProfileCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 960;
          const MAX_HEIGHT = 540;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          
          setEditingCoverUrl(dataUrl);
          if (user.wa !== 'ADMIN') {
            updateDoc(doc(db, "users", user.wa), { coverUrl: dataUrl }).catch(console.error);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500 relative">
          <GeminiScreenAurora intensity="subtle" />
          {/* Header / Nav (Immersive UI Style) */}
          <nav className="z-20 px-4 md:px-8 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-[#d4af37]/20 relative">
            <div className="flex items-center gap-3">
              {/* 3D Gold Crest Logo with Diamond Stars */}
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.5)] border border-[#d4af37]/70 bg-black/80 flex items-center justify-center p-1 group shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-white/20 pointer-events-none" />
                <FutsarClubLogo className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] group-hover:scale-110 transition-transform duration-300 relative z-10" />
              </div>
              <div className="flex flex-col select-none">
                <span className="font-black tracking-[5px] text-gold-3d-diamond text-xl md:text-2xl leading-none">
                  FUTSAR
                </span>
                <span className="text-[8px] font-extrabold tracking-[3px] text-[#e6ca65]/90 uppercase mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  OFFICIAL CLUB
                </span>
              </div>
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
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Points</p>
                        <p className="text-lg md:text-xl font-bold text-[#ffd700] flex items-center gap-1.5"><Star size={16} fill="#ffd700" /> {user.points?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => setSelectedMember(user)} 
                      className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 text-black shadow-lg cursor-pointer hover:opacity-95"
                      style={{ backgroundColor: user.themeColor || '#d4af37' }}
                    >
                      <Eye size={15} /> Kartu Profil
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
                
                <button onClick={() => setActiveModal('deco')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#ffd700] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#ffd700]/10 p-3 rounded-xl">
                      <Star className="text-[#ffd700]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Futsar Style</h3>
                    <p className="text-xs text-gray-500">Beli & pakai style profil</p>
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
            {/* Gemini Neon Edge Aurora for Chat Modals only */}
            {activeModal === 'community_chat' && (
              <GeminiEdgeAurora intensity="subtle" />
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
                  <span>Edit Profil & Style</span>
                  <span className="text-[11px] font-mono text-[#888] font-normal">{user.id}</span>
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
                  {/* LIVE PROFILE CARD PREVIEW (Sampul + Avatar + Nama) */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden relative shadow-lg bg-[#141414]">
                    {/* Top Cover Banner Preview */}
                    <div 
                      className="h-28 w-full relative bg-cover bg-center flex items-end justify-center p-2"
                      style={{
                        backgroundImage: `url(${editingCoverUrl || user.coverUrl || '/cover-ancient-god.jpg'})`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />
                      
                      {/* Upload Cover Button */}
                      <label className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-sm transition-all z-20">
                        <ImageIcon size={12} className="text-[#ffd700]" />
                        <span>Ganti Sampul</span>
                        <input type="file" accept="image/*" onChange={handleProfileCoverUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Centered Avatar with Selected Border */}
                    <div className="px-4 pb-4 text-center -mt-10 flex flex-col items-center relative z-10">
                      <div className="relative group cursor-pointer mb-2">
                        <PlayerAvatar 
                          user={user} 
                          customThemeColor={editingThemeColor}
                          customBorder={editingAvatarBorder}
                          customAvatarUrl={user.avatarUrl}
                          size="xl" 
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera size={22} className="text-white" />
                          <input type="file" accept="image/*" onChange={handleProfileAvatarUpload} className="hidden" />
                        </label>
                      </div>

                      <h4 className="text-sm font-black text-white capitalize tracking-wide flex items-center justify-center gap-1 text-gold-3d-diamond">
                        <span>亗</span> {user.nama} <span>亗</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{user.posisi || 'Member'}</span>
                        <span>•</span>
                        <span className="text-[#ffd700]">{AVATAR_BORDERS.find(b => b.id === editingAvatarBorder)?.name || 'Solid Klasik'}</span>
                      </p>
                    </div>
                  </div>

                  {/* PILIH SAMPUL PROFIL (COVER WALLPAPERS) */}
                  <div>
                    <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon size={13} className="text-[#ffd700]" /> Sampul Profil (Cover)
                      </span>
                      <span className="text-[10px] text-[#ffd700] font-semibold">
                        {PROFILE_COVERS.find(c => c.url === editingCoverUrl)?.name || 'Kustom'}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PROFILE_COVERS.map((cover) => {
                        const isSelected = (editingCoverUrl || user.coverUrl || '/cover-ancient-god.jpg') === cover.url;
                        return (
                          <button
                            key={cover.id}
                            type="button"
                            onClick={() => setEditingCoverUrl(cover.url)}
                            className={`group h-16 rounded-xl relative overflow-hidden border text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-[#ffd700] ring-2 ring-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.3)] scale-[1.02]' 
                                : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                            }`}
                          >
                            <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                              <span className="text-[10px] font-black text-white leading-tight truncate drop-shadow-md">
                                {cover.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ffd700] text-black flex items-center justify-center font-black text-[9px] shadow-sm">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PILIH BORDER PROFIL (AVATAR FRAME) */}
                  {(() => {
                    const ownedAndDefaultBorders = getMergedBorders(settings).filter(
                      b => b.id === 'classic' || (b.price === 0) || (user?.ownedBorders || []).includes(b.id) || user?.avatarBorder === b.id || user?.role === 'admin'
                    );

                    return (
                      <div>
                        <label className="block text-[11px] text-[#aaa] font-bold uppercase mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Award size={13} className="text-[#d4af37]" /> Border Profil (Frame)
                          </span>
                          <span className="text-[10px] text-[#d4af37] font-semibold">
                            {getMergedBorders(settings).find(b => b.id === editingAvatarBorder)?.name || 'Solid Klasik'}
                          </span>
                        </label>

                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                          {ownedAndDefaultBorders.map((borderOpt) => {
                            const isSelected = editingAvatarBorder === borderOpt.id;
                            return (
                              <button
                                key={borderOpt.id}
                                type="button"
                                onClick={() => setEditingAvatarBorder(borderOpt.id)}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
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
                                    <Award size={12} className={isSelected ? 'text-[#d4af37]' : 'text-gray-400'} />
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

                        {user?.role !== 'admin' && (
                          <div className="mt-2 flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">
                              {ownedAndDefaultBorders.length} border dimiliki
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveModal('deco')}
                              className="text-[#ffd700] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                            >
                              <Sparkles size={11} /> Buka Toko Futsar Style &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

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


            {/* FUTSAR STYLE MODAL - KOLEKSI STYLE & CUSTOM BORDERS */}
            {activeModal === 'deco' && (
              <>
                {/* Header Futsar Style */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2 mb-4 border-b border-[#333] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300">
                      <Sparkles size={22} className="text-black" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#ffd700] uppercase block">FUTSAR STYLE</span>
                      <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight">Koleksi Efek & Avatar</h2>
                      <p className="text-[11px] text-[#888]">Pilih style border avatar eksklusif & klaim poin klub.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-[#333]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-gray-300 truncate max-w-[100px]">{user?.nama || 'Member'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#ffd700]/10 px-3 py-1.5 rounded-xl border border-[#ffd700]/30 shadow-inner">
                      <Star size={14} className="text-[#ffd700]" fill="#ffd700" />
                      <span className="text-[#ffd700] font-black text-sm">{user?.role === 'admin' ? '∞' : (user?.points || 0).toLocaleString()} Poin</span>
                    </div>

                    {user?.role !== 'admin' && (
                      <button 
                        onClick={handleClaimDailyPoints}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        title={`Klaim bonus +${(settings.dailyClaimPoints || 1000).toLocaleString()} poin harian`}
                      >
                        🎁 Klaim Harian
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-1.5 bg-[#141414] p-1.5 rounded-2xl border border-[#282828] mb-5 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setDecoTab('deco')}
                    className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      decoTab === 'deco'
                        ? 'bg-[#ffd700] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Sparkles size={13} /> Border Avatar
                  </button>
                  <button
                    onClick={() => setDecoTab('covers')}
                    className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      decoTab === 'covers'
                        ? 'bg-[#ffd700] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ImageIcon size={13} /> Sampul Profil
                  </button>
                  <button
                    onClick={() => setDecoTab('kado')}
                    className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      decoTab === 'kado'
                        ? 'bg-[#ffd700] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Gift size={13} /> Kirim Kado
                  </button>
                  <button
                    onClick={() => setDecoTab('voucher')}
                    className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      decoTab === 'voucher'
                        ? 'bg-[#ffd700] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Ticket size={13} /> Voucher
                  </button>
                  <button
                    onClick={() => setDecoTab('riwayat')}
                    className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      decoTab === 'riwayat'
                        ? 'bg-[#ffd700] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Clock size={13} /> Koleksi
                  </button>
                </div>

                {/* TAB 1: FUTSAR STYLE (Avatar Border Store) */}
                {decoTab === 'deco' && (
                  <div className="flex flex-col gap-6 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#ffd700]">
                    {/* Dewa Kuno & Renegade Series (PRIORITY) */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <span className="text-[#ffd700]">亗</span> Dewa Kuno & Renegade Series <span className="text-[#ffd700]">亗</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {getMergedBorders(settings).filter(b => b.category === 'Renegade Series').map((border) => {
                          const isOwned = user?.ownedBorders?.includes(border.id) || user?.role === 'admin';
                          const isActive = user?.avatarBorder === border.id;
                          const isAvailable = border.isAvailable !== false;
                          return (
                            <div key={border.id} className={`bg-[#181818] p-4 rounded-2xl flex flex-col items-center gap-3 text-center border-2 transition-all relative overflow-hidden ${isActive ? 'border-cyan-400 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.25)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                              {!isAvailable && (
                                <span className="absolute top-2 right-2 bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase z-10">Tutup</span>
                              )}
                              <div className="py-2 flex items-center justify-center">
                                <PlayerAvatar user={user} size="2xl" customBorder={border.id} />
                              </div>
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white font-black text-base flex items-center gap-1">
                                  <span>{border.name}</span>
                                </span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{border.desc}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400">Rp {border.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-500">•</span>
                                  <span className="text-xs font-bold text-[#ffd700] flex items-center gap-1">
                                    <Star size={10} fill="#ffd700" /> {border.price.toLocaleString()} Poin
                                  </span>
                                </div>
                              </div>
                              <div className="mt-auto pt-2 w-full">
                                {isActive ? (
                                  <button disabled className="w-full py-2.5 bg-cyan-500 text-black font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : isOwned ? (
                                  <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                ) : !isAvailable ? (
                                  <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-bold rounded-xl text-xs uppercase cursor-not-allowed">Stok Habis</button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyBorder(border.id, border.price)}
                                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    Beli
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dragon Series */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Dragon Series</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {getMergedBorders(settings).filter(b => b.category === 'Dragon Series').map((border) => {
                          const isOwned = user?.ownedBorders?.includes(border.id) || user?.role === 'admin';
                          const isActive = user?.avatarBorder === border.id;
                          const isAvailable = border.isAvailable !== false;
                          return (
                            <div key={border.id} className={`bg-[#181818] p-4 rounded-2xl flex flex-col items-center gap-3 text-center border-2 transition-all relative overflow-hidden ${isActive ? 'border-amber-400 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                              {!isAvailable && (
                                <span className="absolute top-2 right-2 bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase z-10">Tutup</span>
                              )}
                              <div className="py-2 flex items-center justify-center">
                                <PlayerAvatar user={user} size="2xl" customBorder={border.id} />
                              </div>
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white font-black text-base">{border.name}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{border.desc}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400">Rp {border.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-500">•</span>
                                  <span className="text-xs font-bold text-[#ffd700] flex items-center gap-1">
                                    <Star size={10} fill="#ffd700" /> {border.price.toLocaleString()} Poin
                                  </span>
                                </div>
                              </div>
                              <div className="mt-auto pt-2 w-full">
                                {isActive ? (
                                  <button disabled className="w-full py-2.5 bg-amber-500 text-black font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : isOwned ? (
                                  <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                ) : !isAvailable ? (
                                  <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-bold rounded-xl text-xs uppercase cursor-not-allowed">Stok Habis</button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyBorder(border.id, border.price)}
                                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    Beli
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* One Piece Series */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">One Piece Series</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {getMergedBorders(settings).filter(b => b.category === 'One Piece Series').map((border) => {
                          const isOwned = user?.ownedBorders?.includes(border.id) || user?.role === 'admin';
                          const isActive = user?.avatarBorder === border.id;
                          const isAvailable = border.isAvailable !== false;
                          return (
                            <div key={border.id} className={`bg-[#181818] p-4 rounded-2xl flex flex-col items-center gap-3 text-center border-2 transition-all relative overflow-hidden ${isActive ? 'border-[#ffd700] bg-[#ffd700]/5 shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                              {!isAvailable && (
                                <span className="absolute top-2 right-2 bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase z-10">Tutup</span>
                              )}
                              <div className="py-2 flex items-center justify-center">
                                <PlayerAvatar user={user} size="2xl" customBorder={border.id} />
                              </div>
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white font-black text-base">{border.name}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{border.desc}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400">Rp {border.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-500">•</span>
                                  <span className="text-xs font-bold text-[#ffd700] flex items-center gap-1">
                                    <Star size={10} fill="#ffd700" /> {border.price.toLocaleString()} Poin
                                  </span>
                                </div>
                              </div>
                              <div className="mt-auto pt-2 w-full">
                                {isActive ? (
                                  <button disabled className="w-full py-2.5 bg-[#ffd700] text-black font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : isOwned ? (
                                  <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                ) : !isAvailable ? (
                                  <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-bold rounded-xl text-xs uppercase cursor-not-allowed">Stok Habis</button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyBorder(border.id, border.price)}
                                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    Beli
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Naruto Series */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Naruto Series</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {getMergedBorders(settings).filter(b => b.category === 'Naruto Series').map((border) => {
                          const isOwned = user?.ownedBorders?.includes(border.id) || user?.role === 'admin';
                          const isActive = user?.avatarBorder === border.id;
                          const isAvailable = border.isAvailable !== false;
                          return (
                            <div key={border.id} className={`bg-[#181818] p-4 rounded-2xl flex flex-col items-center gap-3 text-center border-2 transition-all relative overflow-hidden ${isActive ? 'border-purple-400 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                              {!isAvailable && (
                                <span className="absolute top-2 right-2 bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase z-10">Tutup</span>
                              )}
                              <div className="py-2 flex items-center justify-center">
                                <PlayerAvatar user={user} size="2xl" customBorder={border.id} />
                              </div>
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white font-black text-base">{border.name}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{border.desc}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400">Rp {border.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-500">•</span>
                                  <span className="text-xs font-bold text-[#ffd700] flex items-center gap-1">
                                    <Star size={10} fill="#ffd700" /> {border.price.toLocaleString()} Poin
                                  </span>
                                </div>
                              </div>
                              <div className="mt-auto pt-2 w-full">
                                {isActive ? (
                                  <button disabled className="w-full py-2.5 bg-purple-500 text-white font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : isOwned ? (
                                  <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                ) : !isAvailable ? (
                                  <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-bold rounded-xl text-xs uppercase cursor-not-allowed">Stok Habis</button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyBorder(border.id, border.price)}
                                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    Beli
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Classic Series */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Basic Series</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {getMergedBorders(settings).filter(b => b.category === 'Basic').map((border) => {
                          const isActive = user?.avatarBorder === border.id || (!user?.avatarBorder && border.id === 'classic');
                          return (
                            <div key={border.id} className={`bg-[#181818] p-4 rounded-2xl flex flex-col items-center gap-3 text-center border-2 transition-all relative overflow-hidden ${isActive ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                              <div className="py-2 flex items-center justify-center">
                                <PlayerAvatar user={user} size="2xl" customBorder={border.id} />
                              </div>
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white font-black text-base">{border.name}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{border.desc}</span>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400">Gratis (Default)</span>
                                </div>
                              </div>
                              <div className="mt-auto pt-2 w-full">
                                {isActive ? (
                                  <button disabled className="w-full py-2.5 bg-[#d4af37] text-black font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : (
                                  <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SAMPUL PROFIL (COVER WALLPAPERS STORE) */}
                {decoTab === 'covers' && (
                  <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#ffd700]">
                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#333] flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-black text-sm uppercase flex items-center gap-2">
                          <ImageIcon size={16} className="text-[#ffd700]" /> Koleksi Sampul Profil 3D
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Tampilkan latar belakang eksklusif pada kartu profil dan berandamu.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PROFILE_COVERS.map((cover) => {
                        const isOwned = (user?.ownedCovers || ['/cover-ancient-god.jpg']).includes(cover.url) || cover.price === 0 || user?.role === 'admin';
                        const isActive = (user?.coverUrl || '/cover-ancient-god.jpg') === cover.url;
                        return (
                          <div key={cover.id} className={`bg-[#181818] rounded-2xl overflow-hidden border-2 flex flex-col transition-all ${isActive ? 'border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.2)]' : 'border-[#2a2a2a] hover:border-[#444]'}`}>
                            <div className="h-28 w-full relative">
                              <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                              <span className="absolute top-2 right-2 bg-black/70 text-[#ffd700] font-black text-[10px] px-2 py-0.5 rounded-full border border-[#ffd700]/30 uppercase">
                                {cover.category}
                              </span>
                            </div>

                            <div className="p-3.5 flex flex-col flex-1">
                              <h4 className="text-white font-black text-sm">{cover.name}</h4>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{cover.desc}</p>

                              <div className="mt-2.5 flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-400">{cover.price === 0 ? 'Gratis' : `Rp ${cover.price.toLocaleString()}`}</span>
                                <span className="text-[10px] text-gray-500">•</span>
                                <span className="text-xs font-bold text-[#ffd700] flex items-center gap-1">
                                  <Star size={10} fill="#ffd700" /> {cover.price.toLocaleString()} Poin
                                </span>
                              </div>

                              <div className="mt-3 pt-2 border-t border-white/5">
                                {isActive ? (
                                  <button disabled className="w-full py-2 bg-[#ffd700] text-black font-black rounded-xl text-xs uppercase cursor-default shadow-md">Sedang Dipakai</button>
                                ) : isOwned ? (
                                  <button onClick={() => handleEquipCover(cover.url)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">Pakai</button>
                                ) : (
                                  <button 
                                    onClick={() => handleBuyCover(cover.url, cover.price)}
                                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                  >
                                    Beli Sampul
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: KADO (Kirim Poin & Hadiah Border) */}
                {decoTab === 'kado' && (
                  <div className="flex flex-col gap-6 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#ffd700]">
                    <div className="bg-[#181818] p-5 rounded-2xl border border-[#333]">
                      <h3 className="text-[#ffd700] font-black text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Gift size={18} /> Transfer Poin ke Teman
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">Bagi saldo poin kamu ke sesama anggota klub.</p>

                      <form onSubmit={handleTransferPoints} className="flex flex-col gap-3.5">
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">Pilih Anggota Penerima</label>
                          <select
                            value={kadoRecipientWa}
                            onChange={(e) => setKadoRecipientWa(e.target.value)}
                            className="w-full bg-[#111] border border-[#444] rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#ffd700] focus:outline-none"
                            required
                          >
                            <option value="">-- Pilih Rekan Klub --</option>
                            {allUsers.filter(u => u.wa !== user?.wa).map(u => (
                              <option key={u.wa} value={u.wa}>{u.nama} ({u.posisi || 'Member'}) - Poin: {u.points || 0}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">Jumlah Poin</label>
                          <input
                            type="number"
                            placeholder="Contoh: 5000"
                            value={kadoAmount}
                            onChange={(e) => setKadoAmount(e.target.value)}
                            className="w-full bg-[#111] border border-[#444] rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#ffd700] focus:outline-none"
                            min="100"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer mt-1"
                        >
                          Kirim Poin Sekarang
                        </button>
                      </form>
                    </div>

                    <div className="bg-[#181818] p-5 rounded-2xl border border-[#333]">
                      <h3 className="text-purple-400 font-black text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles size={18} /> Hadiahkan Border Custom
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">Beli dan kirimkan border avatar langsung ke akun teman.</p>

                      <div className="flex flex-col gap-3.5">
                        <div>
                          <label className="text-xs font-bold text-gray-300 block mb-1">Pilih Border yang Ingin Dihadiahkan</label>
                          <select
                            value={kadoBorderId}
                            onChange={(e) => setKadoBorderId(e.target.value)}
                            className="w-full bg-[#111] border border-[#444] rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                          >
                            {getMergedBorders(settings).filter(b => b.price > 0 && b.isAvailable !== false).map(b => (
                              <option key={b.id} value={b.id}>{b.name} - {b.category} ({b.price.toLocaleString()} Poin)</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleGiftBorderToFriend}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          Hadiahkan Border
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: VOUCHER (Klaim Kode Promo) */}
                {decoTab === 'voucher' && (
                  <div className="flex flex-col gap-5 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#ffd700]">
                    <div className="bg-[#181818] p-5 rounded-2xl border border-[#333]">
                      <h3 className="text-[#ffd700] font-black text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Ticket size={18} /> Tukarkan Kode Voucher
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">Masukkan kode voucher promo untuk mendapatkan bonus poin instan.</p>

                      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                        <input
                          type="text"
                          placeholder="Masukkan Kode (cth: FUTSARSTYLE)"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value)}
                          className="flex-1 bg-[#111] border border-[#444] rounded-xl px-3 py-2.5 text-sm text-white uppercase font-bold tracking-wider focus:border-[#ffd700] focus:outline-none"
                        />
                        <button
                          onClick={handleRedeemVoucher}
                          className="px-5 py-2.5 bg-[#ffd700] hover:bg-[#e6c200] text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          Tukarkan
                        </button>
                      </div>

                      {voucherFeedback.type && (
                        <div className={`p-3 rounded-xl text-xs font-bold border ${
                          voucherFeedback.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {voucherFeedback.message}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#141414] p-4 rounded-2xl border border-[#282828]">
                      <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" /> Kode Voucher Aktif
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(settings.customVouchers && settings.customVouchers.length > 0 ? settings.customVouchers.filter(v => v.isActive !== false) : [
                          { id: 'v1', code: 'FUTSARSTYLE', rewardPoints: 5000, description: 'Bonus Spesial Futsar Style' },
                          { id: 'v2', code: 'NIKA2026', rewardPoints: 10000, description: 'Series One Piece Promo' },
                          { id: 'v3', code: 'SASUKE2026', rewardPoints: 10000, description: 'Series Naruto Promo' },
                          { id: 'v4', code: 'DRAGON2026', rewardPoints: 10000, description: 'Dragon Series Promo' }
                        ]).map((v) => (
                          <div key={v.id || v.code} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                            <div>
                              <span className="font-mono font-black text-sm text-[#ffd700]">{v.code}</span>
                              <p className="text-[10px] text-gray-400">+{v.rewardPoints.toLocaleString()} Poin • {v.description}</p>
                            </div>
                            <button onClick={() => setVoucherInput(v.code)} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded font-bold uppercase cursor-pointer">Pakai</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: RIWAYAT & KOLEKSI */}
                {decoTab === 'riwayat' && (
                  <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#ffd700]">
                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#333]">
                      <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-[#ffd700]" /> Koleksi Border Avatar
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {getMergedBorders(settings).filter(b => (user?.ownedBorders || ['classic']).includes(b.id) || b.id === 'classic' || user?.role === 'admin').map((border) => {
                          const isActive = user?.avatarBorder === border.id || (!user?.avatarBorder && border.id === 'classic');
                          return (
                            <div key={border.id} className="bg-[#121212] p-3 rounded-xl border border-[#2a2a2a] flex flex-col items-center text-center gap-2">
                              <PlayerAvatar user={user} size="lg" customBorder={border.id} />
                              <span className="text-xs font-bold text-white truncate max-w-full">{border.name}</span>
                              {isActive ? (
                                <span className="text-[10px] font-black text-[#ffd700] uppercase bg-[#ffd700]/10 px-2 py-0.5 rounded-full border border-[#ffd700]/30">Aktif</span>
                              ) : (
                                <button onClick={() => handleEquipBorder(border.id)} className="text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg uppercase w-full cursor-pointer">Gunakan</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#333]">
                      <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#ffd700]" /> Koleksi Sampul Profil
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PROFILE_COVERS.filter(c => (user?.ownedCovers || ['/cover-ancient-god.jpg']).includes(c.url) || c.price === 0 || user?.role === 'admin').map((c) => {
                          const isActive = (user?.coverUrl || '/cover-ancient-god.jpg') === c.url;
                          return (
                            <div key={c.id} className="bg-[#121212] rounded-xl overflow-hidden border border-[#2a2a2a] flex flex-col">
                              <div className="h-16 w-full relative">
                                <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute bottom-1.5 left-2 text-white font-bold text-xs">{c.name}</span>
                              </div>
                              <div className="p-2">
                                {isActive ? (
                                  <span className="block text-center text-[10px] font-black text-[#ffd700] uppercase bg-[#ffd700]/10 py-1 rounded-lg border border-[#ffd700]/30">Sedang Dipakai</span>
                                ) : (
                                  <button onClick={() => handleEquipCover(c.url)} className="text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 py-1 rounded-lg uppercase w-full cursor-pointer">Gunakan Sampul</button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#333]">
                      <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">Info Saldo & Status</h3>
                      <div className="flex justify-between items-center bg-[#111] p-3 rounded-xl border border-[#282828]">
                        <span className="text-xs text-gray-400">Total Poin Klub</span>
                        <span className="text-sm font-black text-[#ffd700] flex items-center gap-1">
                          <Star size={14} fill="#ffd700" /> {user?.role === 'admin' ? 'Unlimited' : (user?.points || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#333]">
                  <button onClick={() => setActiveModal(null)} className="w-full bg-white/5 hover:bg-white/10 text-white border border-[#444] p-3 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 cursor-pointer">
                    Tutup Futsar Style
                  </button>
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
                                  <div className="shrink-0 mb-0.5">
                                    <PlayerAvatar 
                                      user={senderUser} 
                                      size="sm" 
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
                                  <div className="shrink-0 mb-0.5">
                                    <PlayerAvatar 
                                      user={user} 
                                      size="sm" 
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
      {selectedMember && (() => {
        const isOnline = selectedMember.lastActive && currentTime > 0 && (currentTime - selectedMember.lastActive < 90000);
        return (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[550] flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedMember(null)}
          >
            <div 
              className="bg-[#111111] w-full max-w-[370px] rounded-[28px] border border-[#d4af37]/50 overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Banner Cover with High Quality Wallpaper */}
              <div 
                className="h-36 w-full relative bg-cover bg-center flex items-start justify-between p-3.5"
                style={{
                  backgroundImage: `url(${selectedMember.coverUrl || '/cover-ancient-god.jpg'})`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#111111] pointer-events-none" />
                
                {/* Back / Close Buttons */}
                <button 
                  onClick={() => setSelectedMember(null)} 
                  className="relative z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-md backdrop-blur-sm"
                  title="Kembali"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="relative z-10 flex items-center gap-2">
                  {selectedMember.jerseyNumber && (
                    <div 
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1 shadow-md bg-gradient-to-r from-[#ffd700] to-amber-500 text-black border border-white/30"
                    >
                      <Shirt size={12} />
                      <span>#{selectedMember.jerseyNumber}</span>
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedMember(null)} 
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-md backdrop-blur-sm"
                    title="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Avatar & Player Info */}
              <div className="px-5 pb-6 text-center -mt-14 flex flex-col items-center relative z-10">
                <div className="mb-2.5 relative">
                  <PlayerAvatar 
                    user={selectedMember} 
                    size="2xl" 
                    showOnline={true}
                  />
                </div>

                {/* Nickname with 3D Diamond / Gold typography */}
                <h3 className="text-xl font-black tracking-wide text-center text-gold-3d-diamond flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-[#ffd700] text-sm">亗</span>
                  <span>{selectedMember.nama}</span>
                  <span className="text-[#ffd700] text-sm">亗</span>
                </h3>

                {/* Subtitle Status */}
                <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-gray-400 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-gray-500'}`} />
                  <span>{isOnline ? 'Online Sekarang' : 'Aktif baru-baru ini'}</span>
                  <span>•</span>
                  <span className="text-gray-400">Resmi Futsar Club</span>
                </div>

                {/* 3 Highlight Badges (Pills) */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4">
                  <div className="bg-[#181818] border border-white/10 p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">ID Anggota</span>
                    <span className="text-xs font-mono font-black text-white mt-0.5">#{selectedMember.id || 'FTS-001'}</span>
                  </div>
                  <div className="bg-[#181818] border border-[#ffd700]/40 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(255,215,0,0.08)]">
                    <span className="text-[9px] text-[#ffd700] font-bold uppercase tracking-wider">Posisi</span>
                    <span className="text-xs font-black text-[#ffd700] mt-0.5 truncate max-w-full">亗 {selectedMember.posisi || 'Flank'} 亗</span>
                  </div>
                  <div className="bg-[#181818] border border-white/10 p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Poin & Tier</span>
                    <span className="text-xs font-black text-cyan-300 mt-0.5">⭐ {(selectedMember.points || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Bio / Motto Card */}
                <div className="w-full mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 text-center relative overflow-hidden">
                  <Quote size={14} className="text-[#ffd700]/50 mx-auto mb-1" />
                  <p className="text-xs italic text-gray-200 leading-relaxed font-medium">
                    {selectedMember.bio ? `"${selectedMember.bio}"` : '"Main tenang, oper akurat, nikmati futsal bersama Futsar Club!"'}
                  </p>
                  {selectedMember.avatarBorder && selectedMember.avatarBorder !== 'classic' && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                      <Award size={12} className="text-[#ffd700]" />
                      <span>Border: <strong className="text-[#ffd700]">{AVATAR_BORDERS.find(b => b.id === selectedMember.avatarBorder)?.name || selectedMember.avatarBorder}</strong></span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full mt-4 flex flex-col gap-2">
                  {user && user.wa === selectedMember.wa ? (
                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setActiveModal('profile');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Settings size={14} /> Edit Profil & Sampul
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
        );
      })()}

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

  const handleDailyPointsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pts = parseInt(fd.get('dailyClaimPoints') as string, 10) || 1000;
    onUpdateSettings({ ...settings, dailyClaimPoints: pts });
    alert('Pengaturan poin klaim harian berhasil disimpan!');
  };

  const handleUpdateBorderPrice = (borderId: string) => {
    const currentList = getMergedBorders(settings);
    const border = currentList.find(b => b.id === borderId);
    if (!border) return;

    const input = prompt(`Atur harga baru untuk ${border.name} (Rp / Poin):`, String(border.price));
    if (input !== null && !isNaN(Number(input))) {
      const newPrice = Math.max(0, parseInt(input, 10));
      const existingConfigs = settings.styleList || [];
      const index = existingConfigs.findIndex(c => c.id === borderId);

      let updatedList: StyleItemConfig[];
      if (index >= 0) {
        updatedList = existingConfigs.map(c => c.id === borderId ? { ...c, price: newPrice } : c);
      } else {
        updatedList = [...existingConfigs, { id: borderId, price: newPrice, isAvailable: border.isAvailable !== false }];
      }
      onUpdateSettings({ ...settings, styleList: updatedList });
      alert(`Harga ${border.name} berhasil diubah menjadi ${newPrice.toLocaleString()} Poin / Rp!`);
    }
  };

  const handleToggleBorderAvailability = (borderId: string) => {
    const currentList = getMergedBorders(settings);
    const border = currentList.find(b => b.id === borderId);
    if (!border) return;

    const newStatus = !(border.isAvailable !== false);
    const existingConfigs = settings.styleList || [];
    const index = existingConfigs.findIndex(c => c.id === borderId);

    let updatedList: StyleItemConfig[];
    if (index >= 0) {
      updatedList = existingConfigs.map(c => c.id === borderId ? { ...c, isAvailable: newStatus } : c);
    } else {
      updatedList = [...existingConfigs, { id: borderId, price: border.price, isAvailable: newStatus }];
    }
    onUpdateSettings({ ...settings, styleList: updatedList });
    alert(`Status ${border.name} sekarang: ${newStatus ? 'Tersedia di Toko' : 'Ditutup / Habis'}`);
  };

  const handleAddVoucher = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = (fd.get('code') as string || '').toUpperCase().trim();
    const rewardPoints = parseInt(fd.get('rewardPoints') as string, 10) || 1000;
    const description = (fd.get('description') as string || '').trim();

    if (!code) {
      alert('Kode voucher tidak boleh kosong!');
      return;
    }

    const currentVouchers = settings.customVouchers || [];
    if (currentVouchers.some(v => v.code === code)) {
      alert(`Kode voucher "${code}" sudah ada!`);
      return;
    }

    const newVoucher: CustomVoucher = {
      id: Math.random().toString(36).substr(2, 9),
      code,
      rewardPoints,
      description: description || `Bonus +${rewardPoints.toLocaleString()} Poin`,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    onUpdateSettings({ ...settings, customVouchers: [...currentVouchers, newVoucher] });
    (e.target as HTMLFormElement).reset();
    alert(`Kode voucher ${code} (+${rewardPoints.toLocaleString()} Poin) berhasil ditambahkan!`);
  };

  const handleDeleteVoucher = (voucherId: string) => {
    if (confirm('Hapus kode voucher ini?')) {
      const updated = (settings.customVouchers || []).filter(v => v.id !== voucherId);
      onUpdateSettings({ ...settings, customVouchers: updated });
    }
  };

  const handleToggleVoucher = (voucherId: string) => {
    const updated = (settings.customVouchers || []).map(v => v.id === voucherId ? { ...v, isActive: !v.isActive } : v);
    onUpdateSettings({ ...settings, customVouchers: updated });
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

          {/* PENGATURAN FUTSAR STYLE (TOKO STYLE, BORDERS & VOUCHERS) */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#ffd700]/30 p-6 rounded-2xl shadow-[0_4px_20px_rgba(255,215,0,0.05)]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-[#ffd700]" size={20} />
              <h3 className="text-[#ffd700] font-black text-xl uppercase tracking-widest">Pengaturan Futsar Style</h3>
            </div>
            <p className="text-xs text-[#888] mb-5">Atur katalog efek border, harga, ketersediaan stok, kode voucher promo, dan bonus klaim harian.</p>

            {/* 1. Atur Poin Klaim Harian */}
            <form onSubmit={handleDailyPointsSubmit} className="mb-6 pb-6 border-b border-[#333]">
              <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Bonus Poin Klaim Harian Member</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  name="dailyClaimPoints" 
                  defaultValue={settings.dailyClaimPoints || 1000} 
                  min="100"
                  step="100"
                  className="flex-1 p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#ffd700] transition-colors font-bold" 
                  required 
                />
                <button type="submit" className="px-5 bg-[#ffd700] hover:bg-[#e6c200] text-black font-black rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0">
                  Simpan Poin
                </button>
              </div>
            </form>

            {/* 2. Katalog Border Avatar (Harga & Ketersediaan) */}
            <div className="mb-6 pb-6 border-b border-[#333]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Katalog Style Border</span>
                <span className="text-[10px] text-gray-500">{getMergedBorders(settings).length} Model</span>
              </div>
              <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#ffd700]">
                {getMergedBorders(settings).map((border) => {
                  const isAvail = border.isAvailable !== false;
                  return (
                    <div key={border.id} className="bg-[#181818] p-3 rounded-xl border border-[#2a2a2a] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/60 border border-[#444] shrink-0 overflow-hidden text-[10px] font-bold text-amber-400">
                          {border.id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{border.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{border.category} • Rp {border.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {border.price > 0 && (
                          <button 
                            type="button"
                            onClick={() => handleUpdateBorderPrice(border.id)}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                            title="Ubah harga border"
                          >
                            Ubah Harga
                          </button>
                        )}
                        {border.price > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleToggleBorderAvailability(border.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              isAvail 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            {isAvail ? 'Buka' : 'Tutup'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 px-2">Gratis</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Manajemen Kode Voucher Promo */}
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wide block mb-3">Buat Kode Voucher Baru</span>
              <form onSubmit={handleAddVoucher} className="flex flex-col gap-2.5 mb-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="code" 
                    placeholder="Kode (cth: PROMO2026)" 
                    className="flex-1 p-2.5 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#ffd700] text-xs font-bold uppercase" 
                    required 
                  />
                  <input 
                    type="number" 
                    name="rewardPoints" 
                    placeholder="Poin (cth: 10000)" 
                    min="100"
                    step="100"
                    defaultValue={5000}
                    className="w-[120px] p-2.5 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#ffd700] text-xs font-bold" 
                    required 
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="description" 
                    placeholder="Keterangan singkat (cth: Bonus Spesial Lebaran)" 
                    className="flex-1 p-2.5 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#ffd700] text-xs" 
                  />
                  <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0">
                    <Plus size={14} /> Tambah
                  </button>
                </div>
              </form>

              {/* List Vouchers */}
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#ffd700]">
                {(settings.customVouchers || []).map((v) => (
                  <div key={v.id} className="bg-[#181818] p-2.5 rounded-xl border border-[#2a2a2a] flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-[#ffd700]">{v.code}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">+{v.rewardPoints.toLocaleString()} Poin</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${v.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>
                          {v.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{v.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => handleToggleVoucher(v.id)}
                        className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-bold cursor-pointer"
                      >
                        {v.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteVoucher(v.id)}
                        className="text-[#e53e3e] hover:text-white p-1 rounded hover:bg-[#e53e3e]/20 cursor-pointer"
                        title="Hapus Voucher"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!settings.customVouchers || settings.customVouchers.length === 0) && (
                  <p className="text-[11px] text-gray-500 italic text-center py-2">Belum ada custom voucher tambahan.</p>
                )}
              </div>
            </div>
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
                        onClick={() => {
                          const newPoints = prompt('Set poin untuk ' + u.nama + ':', String(u.points || 0));
                          if (newPoints !== null && !isNaN(Number(newPoints))) {
                            
                              
                            updateDoc(doc(db, "users", u.wa), { points: Number(newPoints) });
                            
                          }
                        }}
                        className="px-3 py-2 bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 hover:bg-[#ffd700] hover:text-black rounded-lg text-[10px] font-bold uppercase transition-colors"
                      >
                        Poin
                      </button>
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

          {/* MANAJEMEN POIN & BORDER MEMBER */}
          <div className="bg-[#111]/60 backdrop-blur-md border border-[#ffd700]/30 p-6 rounded-2xl shadow-[0_4px_20px_rgba(255,215,0,0.05)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-[#ffd700] font-black text-xl uppercase tracking-widest flex items-center gap-2">
                  <Star className="text-[#ffd700]" size={20} fill="#ffd700" /> Manajemen Poin & Border
                </h3>
                <p className="text-xs text-[#888] mt-0.5">Kelola saldo poin, tambah reward MVP/kehadiran, atau berikan custom border ke anggota.</p>
              </div>
              {onExportCSV && (
                <button 
                  onClick={() => onExportCSV(activeUsers)}
                  className="px-3 py-1.5 bg-[#ffd700]/20 hover:bg-[#ffd700] text-[#ffd700] hover:text-black border border-[#ffd700]/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Ekspor Data Poin & Anggota ke CSV"
                >
                  <Download size={13} /> Ekspor Data CSV
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ffd700] pr-2">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-[#888] italic">Belum ada anggota yang aktif.</p>
              ) : (
                activeUsers.map((u) => {
                  const currentBorder = AVATAR_BORDERS.find(b => b.id === (u.avatarBorder || 'classic'))?.name || 'Classic';
                  return (
                    <div key={u.wa} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#181818] p-4 rounded-xl border border-[#333] hover:border-[#ffd700]/50 transition-all gap-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar user={u} size="md" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                            {u.nama}
                            {u.jerseyNumber && <span className="text-[10px] text-[#888]">#{u.jerseyNumber}</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-[#ffd700] font-black flex items-center gap-1 bg-[#ffd700]/10 px-2 py-0.5 rounded-full border border-[#ffd700]/20">
                              <Star size={10} fill="#ffd700" /> {(u.points || 0).toLocaleString()} Poin
                            </span>
                            <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              Border: {currentBorder}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => {
                            const newPoints = (u.points || 0) + 1000;
                            updateDoc(doc(db, "users", u.wa), { points: newPoints });
                          }}
                          className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black transition-all"
                          title="Tambah 1.000 Poin"
                        >
                          +1K
                        </button>
                        <button
                          onClick={() => {
                            const newPoints = (u.points || 0) + 5000;
                            updateDoc(doc(db, "users", u.wa), { points: newPoints });
                          }}
                          className="px-2 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-black transition-all"
                          title="Tambah 5.000 Poin (MVP/Bonus)"
                        >
                          +5K
                        </button>
                        <button
                          onClick={() => {
                            const newPoints = (u.points || 0) + 10000;
                            updateDoc(doc(db, "users", u.wa), { points: newPoints });
                          }}
                          className="px-2 py-1.5 bg-[#ffd700]/10 hover:bg-[#ffd700] hover:text-black text-[#ffd700] border border-[#ffd700]/30 rounded-lg text-[10px] font-black transition-all"
                          title="Tambah 10.000 Poin"
                        >
                          +10K
                        </button>
                        <button
                          onClick={() => {
                            const val = prompt(`Set jumlah poin manual untuk ${u.nama}:`, String(u.points || 0));
                            if (val !== null && !isNaN(Number(val))) {
                              updateDoc(doc(db, "users", u.wa), { points: Number(val) });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                        >
                          Set Poin
                        </button>
                        <button
                          onClick={() => {
                            const borderChoice = prompt(`Pilih border untuk ${u.nama}:\n1. nika (One Piece)\n2. sasuke (Naruto)\n3. dragon (Dragon)\n4. wanglin (Renegade)\n5. wanglin2 (Renegade II)\n6. classic (Klasik)`, "nika");
                            if (borderChoice) {
                              const valid = ['nika', 'sasuke', 'dragon', 'wanglin', 'wanglin2', 'classic'];
                              const chosen = borderChoice.toLowerCase().trim();
                              if (valid.includes(chosen)) {
                                const currentOwned = u.ownedBorders || ['classic'];
                                const newOwned = currentOwned.includes(chosen) ? currentOwned : [...currentOwned, chosen];
                                updateDoc(doc(db, "users", u.wa), { 
                                  avatarBorder: chosen,
                                  ownedBorders: newOwned
                                });
                                alert(`Border ${chosen} berhasil diaktifkan untuk ${u.nama}!`);
                              } else {
                                alert('Nama border tidak valid.');
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/40 rounded-lg text-[10px] font-bold uppercase transition-all"
                        >
                          Beri Border
                        </button>
                      </div>
                    </div>
                  );
                })
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
