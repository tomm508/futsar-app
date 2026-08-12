import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_member_kas = """                <div className="flex flex-col gap-2 mb-5 text-left">
                  <label className="text-[11px] text-[#888] font-bold uppercase tracking-[1px]">Siklus Pembayaran:</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdatePaymentCycle('mingguan')}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase transition-colors ${(!user.paymentCycle || user.paymentCycle === 'mingguan') ? 'bg-[#d4af37] text-black' : 'bg-[#1a1a1a] text-[#888] border border-[#333]'}`}
                    >
                      / Minggu
                    </button>
                    <button 
                      onClick={() => handleUpdatePaymentCycle('bulanan')}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase transition-colors ${(user.paymentCycle === 'bulanan') ? 'bg-[#d4af37] text-black' : 'bg-[#1a1a1a] text-[#888] border border-[#333]'}`}
                    >
                      / Bulan
                    </button>
                  </div>
                </div>"""

new_member_kas = """                <div className="flex flex-col gap-2 mb-5 text-left">
                  <label className="text-[11px] text-[#888] font-bold uppercase tracking-[1px]">Siklus Pembayaran Aktif:</label>
                  <div className="bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/30 py-2.5 rounded-lg text-[13px] font-black uppercase text-center tracking-widest shadow-inner">
                    {(!settings.activePaymentCycle || settings.activePaymentCycle === 'mingguan') ? '/ Minggu' : '/ Bulan'}
                  </div>
                </div>"""

content = content.replace(old_member_kas, new_member_kas)

# Remove handleUpdatePaymentCycle function
old_handle_cycle = """  const handleUpdatePaymentCycle = (cycle: 'mingguan' | 'bulanan') => {
    if (!user) return;
    updateDoc(doc(db, "users", user.wa), { paymentCycle: cycle }).catch(console.error);
  };"""

content = content.replace(old_handle_cycle, "")

# Also need to fix the `user.paymentCycle` rendering in member UI
# Example: new Intl.NumberFormat('id-ID', ...).format(user.paymentCycle === 'bulanan' ? settings.kasBulanan : settings.kasMingguan)
old_format = """new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(user.paymentCycle === 'bulanan' ? settings.kasBulanan : settings.kasMingguan)"""
new_format = """new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(settings.activePaymentCycle === 'bulanan' ? settings.kasBulanan : settings.kasMingguan)"""
content = content.replace(old_format, new_format)

with open('app/page.tsx', 'w') as f:
    f.write(content)
