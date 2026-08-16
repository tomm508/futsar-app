import sys
import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

# 1. Update Preview Cover (editingCoverUrl || user.coverUrl)
preview_cover_target = """className="h-28 w-full relative bg-cover bg-center flex items-end justify-center p-2 bg-[#1c1c1c]"
                      style={{
                        backgroundImage: (editingCoverUrl || user.coverUrl) ? `url(${editingCoverUrl || user.coverUrl})` : 'none'
                      }}
                    >"""
preview_cover_replacement = """className="h-28 w-full relative bg-cover bg-center flex items-end justify-center p-2 bg-[#1c1c1c]"
                      style={{
                        backgroundImage: ((editingCoverUrl || user.coverUrl) && !(editingCoverUrl || user.coverUrl)?.startsWith('css:')) ? `url(${editingCoverUrl || user.coverUrl})` : 'none'
                      }}
                    >
                      {((editingCoverUrl || user.coverUrl)?.startsWith('css:')) && (
                        <AnimatedCssCover url={editingCoverUrl || user.coverUrl || ''} />
                      )}"""
content = content.replace(preview_cover_target, preview_cover_replacement)

# 2. Update selectedMember.coverUrl
member_cover_target = """className="h-36 w-full relative bg-cover bg-center flex items-start justify-between p-3.5 bg-[#1a1a1a]"
                style={{
                  backgroundImage: selectedMember.coverUrl ? `url(${selectedMember.coverUrl})` : 'none'
                }}
              >"""
member_cover_replacement = """className="h-36 w-full relative bg-cover bg-center flex items-start justify-between p-3.5 bg-[#1a1a1a]"
                style={{
                  backgroundImage: (selectedMember.coverUrl && !selectedMember.coverUrl.startsWith('css:')) ? `url(${selectedMember.coverUrl})` : 'none'
                }}
              >
                {selectedMember.coverUrl?.startsWith('css:') && (
                  <AnimatedCssCover url={selectedMember.coverUrl} />
                )}"""
content = content.replace(member_cover_target, member_cover_replacement)

# 3. Update img src={c.url} 
# There are likely 2 or 3 places. Let's find `<img src={c.url}`
# Let's replace the whole block manually by matching:
import re
def replace_img_tags(match):
    before = match.group(1)
    return before + """
                                {c.url?.startsWith('css:') ? (
                                  <AnimatedCssCover url={c.url} className="opacity-80" />
                                ) : (
                                <img 
                                  src={c.url} 
                                  alt={c.name} 
                                  onError={(e) => {
                                    if (c.fallbackUrl && e.currentTarget.src !== c.fallbackUrl) {
                                      e.currentTarget.src = c.fallbackUrl;
                                    }
                                  }}
                                  className="w-full h-full object-cover" 
                                />
                                )}
    """

content = re.sub(
    r'(<div className="h-16 w-full relative bg-\[#151515\]">)\s*<img\s*src=\{c\.url\}\s*alt=\{c\.name\}\s*onError=\{\(e\) => \{\s*if \(c\.fallbackUrl && e\.currentTarget\.src !== c\.fallbackUrl\) \{\s*e\.currentTarget\.src = c\.fallbackUrl;\s*\}\s*\}\}\s*className="w-full h-full object-cover"\s*/>',
    replace_img_tags,
    content
)

content = re.sub(
    r'(<div className="h-32 w-full relative bg-\[#151515\]">)\s*<img\s*src=\{cover\.url\}\s*alt=\{cover\.name\}\s*onError=\{\(e\) => \{\s*if \(cover\.fallbackUrl && e\.currentTarget\.src !== cover\.fallbackUrl\) \{\s*e\.currentTarget\.src = cover\.fallbackUrl;\s*\}\s*\}\}\s*className="w-full h-full object-cover"\s*/>',
    lambda m: m.group(1) + """
                                {cover.url?.startsWith('css:') ? (
                                  <AnimatedCssCover url={cover.url} className="opacity-80" />
                                ) : (
                                <img 
                                  src={cover.url} 
                                  alt={cover.name} 
                                  onError={(e) => {
                                    if (cover.fallbackUrl && e.currentTarget.src !== cover.fallbackUrl) {
                                      e.currentTarget.src = cover.fallbackUrl;
                                    }
                                  }}
                                  className="w-full h-full object-cover" 
                                />
                                )}""",
    content
)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)
