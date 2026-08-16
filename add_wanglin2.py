import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

target = """  { 
    id: 'wanglin', 
    name: 'Wang Lin Slaughter Flame', 
    price: 15000, 
    category: 'Renegade Series', 
    url: 'css:wanglin', 
    fallbackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    desc: 'Api kosmik pembantaian merah menyala dengan aura absolut',
    isAvailable: true
  },"""

replacement = """  { 
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
    id: 'wanglin2', 
    name: 'Wang Lin Cosmic Void', 
    price: 25000, 
    category: 'Renegade Series', 
    url: 'css:wanglin2', 
    fallbackUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    desc: 'Domain kehampaan kosmik tingkat dewa galaksi',
    isAvailable: true
  },"""

content = content.replace(target, replacement)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)
