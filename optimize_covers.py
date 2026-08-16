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

  // OPTIMIZED: Less particles, no mix-blend, no CSS blur filters (huge performance boost)
  const FloatingParticles = ({ colors, count = 15, speed = 1, size = 1 }: { colors: string[], count?: number, speed?: number, size?: number }) => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      {Array.from({ length: count }).map((_, i) => {
        const cx = (i * 37) % 100;
        const r = ((i % 3) + 1) * size;
        const dur = (4 + (i % 5)) / speed;
        const delay = -((i * 11) % 7);
        const color = colors[i % colors.length];
        return (
          <circle key={i} cx={`${cx}%`} cy="110%" r={r} fill={color} opacity="0.6">
            <animate attributeName="cy" from="110%" to="-10%" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0" keyTimes="0;0.5;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );

  // OPTIMIZED: Removed glow layer and blur filters
  const LightningEffect = ({ color, paths }: { color: string, paths: string[] }) => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="0.5" fill="none" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0;0;0" keyTimes="0;0.05;0.1;0.5;1" dur={`${2 + i}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );

  switch (type) {
    case 'dewa_kuno':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#050400] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.2),transparent_70%)]" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-[#1a1400]" />
           <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)', animationDuration: '8s' }} />
           
           <LightningEffect color="#fde047" paths={[
             "M10,0 L25,30 L15,50 L40,100",
             "M80,0 L65,40 L75,60 L50,100"
           ]} />
           <FloatingParticles colors={['#ffffff', '#fde047']} count={12} speed={0.5} size={1} />
        </div>
      );
    case 'wanglin':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#0a0000] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#4a0000] via-[#1a0000] to-black" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_bottom,rgba(255,0,0,0.15),transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }} />
           
           <FloatingParticles colors={['#ff0000', '#ff8c00']} count={18} speed={1.5} size={0.8} />
        </div>
      );
    case 'wanglin2':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#00010a] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.25),transparent_80%)]" />
           <div className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] animate-pulse" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)', animationDuration: '10s' }} />
           
           <FloatingParticles colors={['#ffffff', '#93c5fd']} count={25} speed={0.3} size={0.6} />
        </div>
      );
    case 'dragon':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#080808] ${className}`}>
           <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] via-black to-[#111]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '6s' }} />
           
           <FloatingParticles colors={['#ffffff', '#fefce8']} count={15} speed={0.8} size={1.5} />
        </div>
      );
    case 'nika':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#1a0a00] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(249,115,22,0.25),transparent_80%)]" />
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),transparent_60%)] animate-pulse" />
           
           <LightningEffect color="#fef08a" paths={[
             "M20,0 L40,40 L20,60 L50,100"
           ]} />
           
           <FloatingParticles colors={['#ffffff', '#fef08a']} count={15} speed={1.2} size={1.5} />
        </div>
      );
    case 'sasuke':
      return (
        <div className={`absolute inset-0 overflow-hidden bg-[#05000a] ${className}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.2),transparent_70%)]" />
           <div className="absolute top-1/4 left-1/4 w-[150%] h-[150%] animate-pulse" style={{ background: 'radial-gradient(circle, rgba(126,34,206,0.1) 0%, transparent 60%)', animationDuration: '8s' }} />
           
           <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)] animate-pulse" style={{ animationDuration: '3s' }} />
           
           <LightningEffect color="#d8b4fe" paths={[
             "M10,0 L30,20 L15,50 L40,100",
             "M80,0 L60,30 L75,60 L40,100"
           ]} />
           
           <FloatingParticles colors={['#d8b4fe', '#a855f7']} count={12} speed={1} size={1} />
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

print("Optimized bespoke covers applied.")
