import sys

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

new_covers = """export const DEFAULT_PROFILE_COVERS: CoverItemConfig[] = [
  { 
    id: 'none', 
    name: 'Polos (Tanpa Sampul)', 
    price: 0, 
    category: 'Basic', 
    url: '', 
    fallbackUrl: '',
    desc: 'Tampilan bersih dan minimalis polos tanpa gambar sampul',
    isAvailable: true
  },
  { 
    id: 'ancient_god', 
    name: 'Dewa Kuno Surgawi', 
    price: 30000, 
    category: 'Renegade Series', 
    url: 'css:dewa_kuno', 
    fallbackUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    desc: 'Aura dewa kuno emas berawan mistis & cahaya kosmik abadi',
    isAvailable: true
  },
  { 
    id: 'wanglin', 
    name: 'Wang Lin Slaughter Flame', 
    price: 15000, 
    category: 'Renegade Series', 
    url: 'css:wanglin', 
    fallbackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    desc: 'Api kosmik pembantaian merah menyala dengan aura absolut',
    isAvailable: true
  },
  { 
    id: 'dragon', 
    name: 'White Imperial Dragon', 
    price: 20000, 
    category: 'Dragon Series', 
    url: 'css:dragon', 
    fallbackUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
    desc: 'Cahaya naga putih emas suci yang terus mengalir',
    isAvailable: true
  },
  { 
    id: 'nika', 
    name: 'Sun God Nika', 
    price: 25000, 
    category: 'One Piece Series', 
    url: 'css:nika', 
    fallbackUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    desc: 'Getaran dewa matahari Nika yang memancarkan aura kebebasan',
    isAvailable: true
  },
  { 
    id: 'sasuke', 
    name: 'Sasuke Susanoo', 
    price: 15000, 
    category: 'Naruto Series', 
    url: 'css:sasuke', 
    fallbackUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80',
    desc: 'Kilatan petir ungu kegelapan dan cakra absolut Susanoo',
    isAvailable: true
  },
];"""

start_idx = content.find("export const DEFAULT_PROFILE_COVERS: CoverItemConfig[] = [")
end_idx = content.find("];", start_idx) + 2

new_content = content[:start_idx] + new_covers + content[end_idx:]

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(new_content)
