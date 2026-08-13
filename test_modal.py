import re
with open('app/App.tsx', 'r') as f:
    print(f.read().find('activeModal === \'ai_bot\''))
