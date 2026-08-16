import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

replacement = """export const AnimatedCssCover = ({ url, className = "" }: { url: string, className?: string }) => {
  const type = url.replace('css:', '');
  switch (type) {
    case 'dewa_kuno':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#120a00] ${className}`}>
           {/* Divine golden halo and ancient energy */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.4),transparent_70%)]" />
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,215,0,0.6)_20%,rgba(255,255,255,0.4)_25%,transparent_35%,transparent_50%,rgba(255,215,0,0.6)_70%,rgba(255,255,255,0.4)_75%,transparent_85%)] animate-[spin_15s_linear_infinite]" />
           <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-200/30 to-transparent mix-blend-overlay animate-pulse" />
        </div>
      );
    case 'wanglin':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#240000] ${className}`}>
           {/* Red and gold slaughter flame */}
           <div className="absolute inset-0 bg-gradient-to-tr from-[#660000]/80 via-[#aa0000]/50 to-[#ffaa00]/20" />
           <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_90deg,transparent_0%,rgba(255,0,0,0.8)_30%,rgba(255,165,0,0.6)_40%,transparent_60%)] animate-[spin_8s_linear_infinite] mix-blend-screen" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600 rounded-full mix-blend-screen blur-[60px] animate-pulse" />
        </div>
      );
    case 'wanglin2':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#00051a] ${className}`}>
           {/* Cosmic void, galaxy deep blue and purple stars */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_70%)] animate-pulse" />
           <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-80 animate-[spin_20s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(139,92,246,0.6) 20%, rgba(14,165,233,0.8) 40%, transparent 60%)' }} />
           <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen blur-[50px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-600 rounded-full mix-blend-screen blur-[60px] animate-pulse delay-700" />
        </div>
      );
    case 'dragon':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0f0a00] ${className}`}>
           {/* Golden Imperial Dragon */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2),transparent_80%)]" />
           <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_12s_linear_infinite] opacity-90" style={{ background: 'conic-gradient(from 180deg, transparent 0%, #fefce8 5%, #facc15 15%, transparent 30%, transparent 50%, #fefce8 55%, #facc15 65%, transparent 80%)' }} />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full mix-blend-screen blur-[40px] animate-pulse" />
        </div>
      );
    case 'nika':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#3a1500] ${className}`}>
           {/* Sun god yellow/orange and golden lightning */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] animate-[spin_10s_linear_infinite] opacity-90" style={{ background: 'conic-gradient(from 0deg, #fef08a 0%, #f97316 20%, #fef08a 40%, #f97316 60%, #fef08a 80%, #f97316 100%)', filter: 'blur(20px)' }} />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full mix-blend-screen blur-[40px] animate-pulse" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
        </div>
      );
    case 'sasuke':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#10001a] ${className}`}>
           {/* Susanoo Purple + Sharingan Red */}
           <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_10s_linear_infinite] opacity-90" style={{ background: 'conic-gradient(from 45deg, transparent 0%, #9333ea 20%, #a855f7 30%, transparent 50%)' }} />
           <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600 rounded-full mix-blend-screen blur-[60px] animate-pulse" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-600 rounded-full mix-blend-screen blur-[30px] animate-[spin_3s_linear_infinite]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full mix-blend-overlay blur-[2px]" />
        </div>
      );
    default:
      return null;
  }
};"""

target_pattern = r'export const AnimatedCssCover = \(\{.*?};'
content = re.sub(target_pattern, replacement, content, flags=re.DOTALL)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)
