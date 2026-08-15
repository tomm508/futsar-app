import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

funcs = """
  const handleBuyBorder = async (borderId: string, price: number) => {
    if (!user) return;
    if ((user.points || 0) < price) {
      alert('Poin tidak cukup!');
      return;
    }
    const currentOwned = user.ownedBorders || ['classic'];
    if (currentOwned.includes(borderId)) {
      alert('Border sudah dimiliki!');
      return;
    }
    
    await updateDoc(doc(db, "users", user.wa), {
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

  const handleSendAiMessage"""

content = content.replace("  const handleSendAiMessage", funcs)

with open('app/App.tsx', 'w') as f:
    f.write(content)
