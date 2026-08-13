import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_state = "  const [isMounted, setIsMounted] = useState(false);\n  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);"
new_state = """  const [isMounted, setIsMounted] = useState(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);
  
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Halo! Saya Asisten AI Futsar. Ada yang bisa saya bantu tentang info klub, taktik futsal, atau jadwal?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiTyping) return;
    
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: aiMessages })
      });
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Maaf, terjadi kesalahan teknis.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };"""

content = content.replace(old_state, new_state)
with open('app/App.tsx', 'w') as f:
    f.write(content)

print("Done")
