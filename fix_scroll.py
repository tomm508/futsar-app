import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

bad1 = "chatEndRef.current?.scrollIntoView({ behavior: 'smooth' \n    }"
good1 = "chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });\n    }"

bad2 = "communityChatEndRef.current?.scrollIntoView({ behavior: 'smooth' \n    }"
good2 = "communityChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });\n    }"

content = content.replace(bad1, good1).replace(bad2, good2)

with open('app/App.tsx', 'w') as f:
    f.write(content)
