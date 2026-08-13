import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Add isSettingsLoaded state
old_state = """  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);"""

new_state = """  const [loginError, setLoginError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);"""

content = content.replace(old_state, new_state)

# Set isSettingsLoaded in onSnapshot
old_settings = """      } else {
        setDoc(doc(db, "settings", "global"), defaultSettings);
      }
    });"""

new_settings = """      } else {
        setDoc(doc(db, "settings", "global"), defaultSettings);
      }
      setIsSettingsLoaded(true);
    });"""
    
content = content.replace(old_settings, new_settings)

# Update return condition
old_return = """  if (!isLoaded) return null;"""
new_return = """  if (!isLoaded || !isSettingsLoaded) return null;"""

content = content.replace(old_return, new_return)

with open('app/page.tsx', 'w') as f:
    f.write(content)
