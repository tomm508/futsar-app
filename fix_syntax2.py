import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

bad_part = """  const handleSendAiMessage"""
good_part = """"""

content = content.replace(bad_part, good_part)

with open('app/App.tsx', 'w') as f:
    f.write(content)
