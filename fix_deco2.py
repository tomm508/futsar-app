import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

bad = r"      ownedBorders: \[\.\.\.currentOwned, borderId\]\s+alert\('Border berhasil dibeli!'\);\s*\};\s*const handleEquipBorder = async \(borderId: string\) => \{\s*if \(\!user\) return;\s*await updateDoc\(doc\(db, \"users\", user\.wa\), \{\s*avatarBorder: borderId\s*\}; = async \(e: React\.FormEvent\) => \{"

good = """      ownedBorders: [...currentOwned, borderId]
    });
    alert('Border berhasil dibeli!');
  };

  const handleEquipBorder = async (borderId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.wa), {
      avatarBorder: borderId
    });
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {"""

content = re.sub(bad, good, content)

with open('app/App.tsx', 'w') as f:
    f.write(content)
