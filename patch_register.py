import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

register_repl = """    const newUser: User = {
      nama,
      posisi,
      wa,
      id: `FTS${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-2K26`,
      password,
      status: 'pending',
      points: 25000,
      ownedBorders: ['classic'],
      avatarBorder: 'classic'
    };"""
content = re.sub(r'    const newUser: User = \{.*?status: \'pending\'\s*\};', register_repl, content, flags=re.DOTALL)

with open('app/App.tsx', 'w') as f:
    f.write(content)
