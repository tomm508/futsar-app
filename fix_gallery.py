import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_button_non_admin = """                  {user?.role !== 'admin' && (
                    <label className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Unggah Foto
                      <input type="file" accept="image/*" onChange={handleUploadGallery} className="hidden" />
                    </label>
                  )}"""

new_button_non_admin = """                  {user?.role !== 'admin' && (
                    <button onClick={handleAddGalleryLink} className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Tambah Link
                    </button>
                  )}"""
content = content.replace(old_button_non_admin, new_button_non_admin)

with open('app/page.tsx', 'w') as f:
    f.write(content)
