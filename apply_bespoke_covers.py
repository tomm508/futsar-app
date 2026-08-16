import sys

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

start_marker = "export const AnimatedCssCover = ({ url, className = \"\" }: { url: string, className?: string }) => {"
end_marker = "export const getMergedCovers = (settings?: AppSettings): CoverItemConfig[] => {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    sys.exit(1)

new_component = """export const AnimatedCssCover = ({ url, className = "" }: { url: string, className?: string }) => {
  const type = url.replace('css:', '');

  // Helper 1: Floating Particles (Dust/Embers/Stars)
  const FloatingParticles = ({ colors, count = 30, speed = 1, size = 1 }: { colors: string[], count?: number, speed?: number, size?: number }) => (
    <svg className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none" preserveAspectRatio="none">
      {Array.from({ length: count }).map((_, i) => {
        const cx = (i * 37) % 100;
        const r = ((i % 3) + 1) * size;
        const dur = (3 + (i % 5)) / speed;
        const delay = -((i * 11) % 7);
        const color = colors[i % colors.length];
        return (
          <g key={i}>
            <circle cx={`${cx}%`} cy="110%" r={r*2.5} fill={color} opacity="0.3" filter="blur(2px)">
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

  // Helper 2: Flashing Lightning/Energy cracks
  const LightningEffect = ({ color, paths }: { color: string, paths: string[] }) => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="0.5" fill="none" opacity="0" filter="blur(0.5px)">
          <animate attributeName="opacity" values="0;1;0;0;0" keyTimes="0;0.05;0.1;0.5;1" dur={`${2 + i}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" />
        </path>
      ))}
      {paths.map((d, i) => (
        <path key={`glow-${i}`} d={d} stroke="#ffffff" strokeWidth="0.2" fill="none" opacity="0">
          <animate attributeName="opacity" values="0;1;0;0;0" keyTimes="0;0.05;0.1;0.5;1" dur={`${2 + i}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );

  // Helper 3: Slow moving smoke/clouds
  const SmokeEffect = ({ color, opacity }: { color: string, opacity: number }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-60">
      <div className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full blur-[80px] animate-pulse" style={{ backgroundColor: color, opacity: opacity, animationDuration: '8s' }} />
      <div className="absolute -top-1/4 left-1/4 w-[150%] h-[150%] rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: color, opacity: opacity, animationDuration: '12s' }} />
    </div>
  );

  switch (type) {
    case 'dewa_kuno':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#050400] ${className}`}>
           {/* Base Radial */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.3),transparent_70%)]" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-[#1a1400]" />
           
           {/* White & Gold Smoke */}
           <SmokeEffect color="#ffffff" opacity={0.15} />
           <SmokeEffect color="#d4af37" opacity={0.1} />

           {/* Gold Lightning */}
           <LightningEffect color="#fde047" paths={[
             "M10,0 L25,30 L15,50 L40,100",
             "M80,0 L65,40 L75,60 L50,100",
             "M40,0 L50,20 L30,60 L60,100"
           ]} />

           {/* Slow floating ancient dust */}
           <FloatingParticles colors={['#ffffff', '#fde047', '#d4af37']} count={25} speed={0.4} size={1.2} />
        </div>
      );
    case 'wanglin':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0a0000] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#4a0000] via-[#1a0000] to-black" />
           <SmokeEffect color="#ff0000" opacity={0.2} />
           
           {/* Fast burning embers */}
           <FloatingParticles colors={['#ff0000', '#ff4500', '#ff8c00']} count={45} speed={2.5} size={0.8} />
        </div>
      );
    case 'wanglin2':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#00010a] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.4),transparent_80%)]" />
           <SmokeEffect color="#4c1d95" opacity={0.2} />
           <SmokeEffect color="#1e40af" opacity={0.15} />
           
           {/* Very slow cosmic dust/stars */}
           <FloatingParticles colors={['#ffffff', '#93c5fd', '#c4b5fd']} count={60} speed={0.2} size={0.7} />
        </div>
      );
    case 'dragon':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#080808] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] via-black to-[#111]" />
           <SmokeEffect color="#ffffff" opacity={0.15} />
           <SmokeEffect color="#fef08a" opacity={0.1} />
           
           {/* Medium white/gold light orbs */}
           <FloatingParticles colors={['#ffffff', '#fefce8', '#e2e8f0']} count={30} speed={0.8} size={2} />
        </div>
      );
    case 'nika':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a0a00] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(249,115,22,0.4),transparent_80%)]" />
           <SmokeEffect color="#fbbf24" opacity={0.2} />
           
           <LightningEffect color="#fef08a" paths={[
             "M20,0 L40,40 L20,60 L50,100",
             "M90,0 L70,30 L80,50 L60,100"
           ]} />
           
           <FloatingParticles colors={['#ffffff', '#fef08a', '#f97316']} count={35} speed={1.2} size={1.5} />
        </div>
      );
    case 'sasuke':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#05000a] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.3),transparent_70%)]" />
           <SmokeEffect color="#7e22ce" opacity={0.25} />
           
           {/* Subtle red sharingan glow in the corner */}
           <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-red-600/15 rounded-full blur-[40px] animate-pulse" />
           
           <LightningEffect color="#d8b4fe" paths={[
             "M10,0 L30,20 L15,50 L40,100",
             "M80,0 L60,30 L75,60 L40,100",
             "M50,0 L60,15 L40,40 L70,100"
           ]} />
           
           <FloatingParticles colors={['#d8b4fe', '#a855f7', '#ef4444']} count={25} speed={1} size={1} />
        </div>
      );
    default:
      return null;
  }
};
"""

new_content = content[:start_idx] + new_component + content[end_idx:]

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(new_content)

print("Applied bespoke covers successfully.")
