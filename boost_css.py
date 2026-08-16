with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('rgba(253,224,71,0.15)', 'rgba(253,224,71,0.5)')
content = content.replace('rgba(250,204,21,0.2)', 'rgba(250,204,21,0.5)')

content = content.replace('rgba(220,38,38,0.2)', 'rgba(220,38,38,0.6)')
content = content.replace('via-[#8b0000]/40', 'via-[#8b0000]/70')
content = content.replace('to-[#ff0000]/20', 'to-[#ff0000]/50')

content = content.replace('opacity-30" style={{ background: \'conic-gradient(from 180deg', 'opacity-80" style={{ background: \'conic-gradient(from 180deg')

content = content.replace('opacity-40" style={{ background: \'conic-gradient(from 0deg', 'opacity-90" style={{ background: \'conic-gradient(from 0deg')

content = content.replace('opacity-50" style={{ background: \'conic-gradient(from 45deg', 'opacity-90" style={{ background: \'conic-gradient(from 45deg')

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)
