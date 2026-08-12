import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_kas_submit = """  const handleKasSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const m = parseInt(fd.get('kasMingguan') as string, 10);
    const b = parseInt(fd.get('kasBulanan') as string, 10);
    onUpdateSettings({ ...settings, kasMingguan: m, kasBulanan: b });
    alert('Pengaturan nominal kas berhasil disimpan!');
  };"""

new_kas_submit = """  const handleKasSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const m = parseInt(fd.get('kasMingguan') as string, 10);
    const b = parseInt(fd.get('kasBulanan') as string, 10);
    const cycle = fd.get('activePaymentCycle') as 'mingguan' | 'bulanan';
    onUpdateSettings({ ...settings, kasMingguan: m, kasBulanan: b, activePaymentCycle: cycle });
    alert('Pengaturan nominal kas dan siklus berhasil disimpan!');
  };"""

content = content.replace(old_kas_submit, new_kas_submit)

old_kas_form = """              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Mingguan (Rp)</label>
                <input type="number" name="kasMingguan" defaultValue={settings.kasMingguan} className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Bulanan (Rp)</label>
                <input type="number" name="kasBulanan" defaultValue={settings.kasBulanan} className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>"""

new_kas_form = """              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Siklus Pembayaran Aktif</label>
                <select name="activePaymentCycle" defaultValue={settings.activePaymentCycle || 'mingguan'} className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors">
                  <option value="mingguan">Mingguan (/ Minggu)</option>
                  <option value="bulanan">Bulanan (/ Bulan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Mingguan (Rp)</label>
                <input type="number" name="kasMingguan" defaultValue={settings.kasMingguan} className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Nominal Bulanan (Rp)</label>
                <input type="number" name="kasBulanan" defaultValue={settings.kasBulanan} className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>"""

content = content.replace(old_kas_form, new_kas_form)

with open('app/page.tsx', 'w') as f:
    f.write(content)
