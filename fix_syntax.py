import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

bad_part = """  const getFrameStyles = () => {
    if (borderStyle === 'classic' || !AVATAR_BORDERS.find(b => b.id === borderStyle)) {
      return {
        borderColor: theme,
        boxShadow: `0 2px 8px ${theme}33`
      };
    }
    return undefined;
  };
    }
    if (borderStyle === 'classic') {
      return {
        borderColor: theme,
        boxShadow: `0 2px 8px ${theme}33`
      };
    }
    return undefined;
  };"""

good_part = """  const getFrameStyles = () => {
    if (borderStyle === 'classic' || !AVATAR_BORDERS.find(b => b.id === borderStyle)) {
      return {
        borderColor: theme,
        boxShadow: `0 2px 8px ${theme}33`
      };
    }
    return undefined;
  };"""

content = content.replace(bad_part, good_part)

with open('app/App.tsx', 'w') as f:
    f.write(content)
