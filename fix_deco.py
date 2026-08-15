import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

bad = """    await updateDoc(doc(db, "users", user.wa), {
      points: (user.points || 0) - price,
      ownedBorders: [...currentOwned, borderId]
        alert('Border berhasil dibeli!');
  };

  const handleEquipBorder = async (borderId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.wa), {
      avatarBorder: borderId
      }; = async (e: React.FormEvent) => {"""

good = """    await updateDoc(doc(db, "users", user.wa), {
      points: (user.points || 0) - price,
      ownedBorders: [...currentOwned, borderId]
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

content = content.replace(bad, good)

with open('app/App.tsx', 'w') as f:
    f.write(content)
