import sys

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

component_code = """
export const AnimatedCssCover = ({ url, className = "" }: { url: string, className?: string }) => {
  const type = url.replace('css:', '');
  switch (type) {
    case 'dewa_kuno':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a1200] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 via-[#1a1200] to-black" />
           <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(253,224,71,0.15)_30%,transparent_50%)] animate-cosmic-spin" />
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.2),transparent_50%)] animate-pulse" />
        </div>
      );
    case 'wanglin':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a0505] ${className}`}>
           <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_90deg,transparent_0%,rgba(220,38,38,0.2)_40%,transparent_80%)] animate-flame-flow" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-[#8b0000]/40 to-[#ff0000]/20" />
           <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-600 rounded-full mix-blend-screen blur-[60px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-700 rounded-full mix-blend-screen blur-[80px] animate-cloud-float" />
        </div>
      );
    case 'dragon':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-slate-950 ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_60%)] animate-pulse" />
           <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-dragon-orbit opacity-30" style={{ background: 'conic-gradient(from 180deg, transparent 0%, #fefce8 10%, #fef08a 20%, transparent 40%)' }} />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-[40px] animate-celestial-pulse" />
        </div>
      );
    case 'nika':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-orange-950 ${className}`}>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] animate-nika-spin opacity-40" style={{ background: 'conic-gradient(from 0deg, #fef08a 0%, #f97316 25%, #fef08a 50%, #f97316 75%, #fef08a 100%)', filter: 'blur(30px)' }} />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400 rounded-full mix-blend-screen blur-[50px] animate-pulse" />
        </div>
      );
    case 'sasuke':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a052b] ${className}`}>
           <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] animate-susanoo-pulse opacity-50" style={{ background: 'conic-gradient(from 45deg, transparent 0%, #9333ea 30%, transparent 60%)' }} />
           <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600 rounded-full mix-blend-screen blur-[60px] animate-lightning-flash" />
        </div>
      );
    default:
      return null;
  }
};
"""

target = "export const getMergedCovers = (settings?: AppSettings): CoverItemConfig[] => {"
idx = content.find(target)
new_content = content[:idx] + component_code + content[idx:]

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(new_content)
