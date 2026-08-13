import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'from-[#151515] to-[#0a0a0a]',
    'from-[#151515]/70 to-[#0a0a0a]/70 backdrop-blur-md'
)

# Admin blocks use bg-[#111]
content = content.replace(
    'bg-[#111] border',
    'bg-[#111]/60 backdrop-blur-md border'
)

# Active modal container inside modals
content = content.replace(
    'bg-[#0a0a0a] rounded-2xl',
    'bg-[#0a0a0a]/70 backdrop-blur-md rounded-2xl'
)

# Small cards inside modals
content = content.replace(
    'bg-[#1a1a1a] border',
    'bg-[#1a1a1a]/60 backdrop-blur-sm border'
)

content = content.replace(
    'bg-[#1a1a1a] p-4',
    'bg-[#1a1a1a]/60 backdrop-blur-sm p-4'
)

content = content.replace(
    'bg-[#1a1a1a] rounded',
    'bg-[#1a1a1a]/60 backdrop-blur-sm rounded'
)

with open('app/page.tsx', 'w') as f:
    f.write(content)
