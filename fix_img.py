import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

# Spot 1 & 2
def repl1(m):
    return """                            {cover.url?.startsWith('css:') ? (
                              <AnimatedCssCover url={cover.url} className="opacity-80" />
                            ) : cover.url ? ("""

content = content.replace("                            {cover.url ? (", repl1(None))

# Spot 3: <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
content = content.replace(
    """<img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />""",
    """{cover.url.startsWith('css:') ? <AnimatedCssCover url={cover.url} className="opacity-80" /> : <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />}"""
)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)

