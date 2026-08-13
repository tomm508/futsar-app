import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Add mounted state
old_state = """  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);"""

new_state = """  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);"""

content = content.replace(old_state, new_state)

# Update return condition
old_return = """  if (!isLoaded || !isSettingsLoaded) return null;"""
new_return = """  if (!isMounted || !isLoaded || !isSettingsLoaded) return null;"""

content = content.replace(old_return, new_return)

with open('app/page.tsx', 'w') as f:
    f.write(content)
