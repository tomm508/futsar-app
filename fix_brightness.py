import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_classes = 'className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"'
new_classes = 'className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 opacity-70 transition-opacity duration-1000"'

content = content.replace(old_classes, new_classes)

old_gradient = '<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>'
new_gradient = '<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10 pointer-events-none"></div>'

content = content.replace(old_gradient, new_gradient)

with open('app/App.tsx', 'w') as f:
    f.write(content)
