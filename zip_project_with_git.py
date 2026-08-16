import shutil
import os

os.makedirs('/tmp/futsar-app-git', exist_ok=True)

if os.path.exists('/tmp/futsar-app-git/applet'):
    shutil.rmtree('/tmp/futsar-app-git/applet')

# Kali ini JANGAN abaikan .git
shutil.copytree('/app/applet', '/tmp/futsar-app-git/applet', ignore=shutil.ignore_patterns('node_modules', '.next', '.bun', 'futsar-app*.zip', 'zip_project*'))

shutil.make_archive('/app/applet/public/futsar-app-with-git', 'zip', '/tmp/futsar-app-git/applet')
print("Done")
