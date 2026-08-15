import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [activeModal, setActiveModal] = useState<'daftar' | 'masuk' | 'jadwal' | 'kas' | 'rekap_kas' | 'taktik' | 'info' | 'chat_admin' | 'profile' | 'gallery' | 'ai_bot' | 'community_chat' | null>(null);",
    "const [activeModal, setActiveModal] = useState<'daftar' | 'masuk' | 'jadwal' | 'kas' | 'rekap_kas' | 'taktik' | 'info' | 'chat_admin' | 'profile' | 'gallery' | 'ai_bot' | 'community_chat' | 'deco' | null>(null);"
)

with open('app/App.tsx', 'w') as f:
    f.write(content)
