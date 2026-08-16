import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

replacement = """export const AnimatedCssCover = ({ url, className = "" }: { url: string, className?: string }) => {
  const type = url.replace('css:', '');

  const Particles = ({ colors }: { colors: string[] }) => (
    <svg className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none" preserveAspectRatio="none">
      {Array.from({ length: 40 }).map((_, i) => {
        const cx = (i * 29) % 100;
        const r = (i % 3) + 1.5;
        const dur = 4 + (i % 5) + ((i * 3) % 3);
        const delay = -((i * 11) % 7);
        const color = colors[i % colors.length];
        return (
          <g key={i}>
            <circle cx={`${cx}%`} cy="110%" r={r*2.5} fill={color} opacity="0.4" filter="blur(3px)">
              <animate attributeName="cy" from="110%" to="-10%" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={`${cx}%`} cy="110%" r={r} fill={color}>
              <animate attributeName="cy" from="110%" to="-10%" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );

  switch (type) {
    case 'dewa_kuno':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0a0800] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a00] via-transparent to-[#1a1000]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.25),transparent_60%)] animate-pulse" />
           <Particles colors={['#fbbf24', '#fef08a', '#ffffff', '#f59e0b']} />
        </div>
      );
    case 'wanglin':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0f0000] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#3a0000] via-transparent to-[#1a0000]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.25),transparent_60%)] animate-pulse" />
           <Particles colors={['#ef4444', '#f97316', '#fca5a5', '#dc2626']} />
        </div>
      );
    case 'wanglin2':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#000212] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#000a3a] via-transparent to-[#05001a]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.2),transparent_60%)] animate-pulse" />
           <Particles colors={['#38bdf8', '#818cf8', '#e0e7ff', '#c084fc']} />
        </div>
      );
    case 'dragon':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#050505] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a00] via-transparent to-[#0a0a0a]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.15),transparent_60%)] animate-pulse" />
           <Particles colors={['#ffffff', '#fefce8', '#fde047', '#cbd5e1']} />
        </div>
      );
    case 'nika':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a0800] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#4a1500] via-transparent to-[#2a0a00]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.3),transparent_60%)] animate-pulse" />
           <Particles colors={['#fde047', '#f97316', '#ffffff', '#fbbf24']} />
        </div>
      );
    case 'sasuke':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0a0014] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#2a004a] via-transparent to-[#100020]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.3),transparent_60%)] animate-pulse" />
           <Particles colors={['#c084fc', '#9333ea', '#e9d5ff', '#ef4444']} />
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
