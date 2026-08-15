with open('app/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const BorderIcon = borderOpt.icon;" in line:
        start1 = i
    if "<BorderIcon size={12}" in line:
        start2 = i

lines[start1] = ""
lines[start2] = "                                <Award size={12} className={isSelected ? 'text-[#d4af37]' : 'text-gray-400'} />\n"

with open('app/App.tsx', 'w') as f:
    f.writelines(lines)
