import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Replace all occurrences of `u.paymentCycle === 'bulanan'` with `settings.activePaymentCycle === 'bulanan'`
content = content.replace("u.paymentCycle === 'bulanan'", "settings.activePaymentCycle === 'bulanan'")

# Replace `userData.paymentCycle === 'bulanan'` with `settings.activePaymentCycle === 'bulanan'`
content = content.replace("userData.paymentCycle === 'bulanan'", "settings.activePaymentCycle === 'bulanan'")

with open('app/page.tsx', 'w') as f:
    f.write(content)
