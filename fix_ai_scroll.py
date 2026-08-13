import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

state_target = "  const [isAiTyping, setIsAiTyping] = useState(false);"
state_replacement = """  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal === 'ai_bot') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiTyping, activeModal]);"""

if state_target in content:
    content = content.replace(state_target, state_replacement)
    print("Added chatEndRef and useEffect")

modal_target = """                    )}
                  </div>
                  
                  <form onSubmit={handleSendAiMessage}"""

modal_replacement = """                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendAiMessage}"""

if modal_target in content:
    content = content.replace(modal_target, modal_replacement)
    print("Added div ref for scrolling")

with open('app/App.tsx', 'w') as f:
    f.write(content)
print("Done modifying App.tsx")
