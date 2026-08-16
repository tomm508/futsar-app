import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

target = """                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PROFILE_COVERS.map((cover) => {
                        const isOwned = (user?.ownedCovers || ['']).includes(cover.url) || cover.price === 0 || user?.role === 'admin';
                        const currentActiveUrl = editingCoverUrl !== undefined ? editingCoverUrl : (user.coverUrl || '');
                        const isSelected = currentActiveUrl === cover.url;"""

replacement = """                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PROFILE_COVERS.filter(cover => {
                        return (user?.ownedCovers || ['']).includes(cover.url) || cover.price === 0 || user?.role === 'admin';
                      }).map((cover) => {
                        const isOwned = true;
                        const currentActiveUrl = editingCoverUrl !== undefined ? editingCoverUrl : (user.coverUrl || '');
                        const isSelected = currentActiveUrl === cover.url;"""

content = content.replace(target, replacement)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)
