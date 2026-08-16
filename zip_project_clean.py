import shutil
import os

os.makedirs('/tmp/futsar-app-clean', exist_ok=True)

if os.path.exists('/tmp/futsar-app-clean/applet'):
    shutil.rmtree('/tmp/futsar-app-clean/applet')

shutil.copytree('/app/applet', '/tmp/futsar-app-clean/applet', ignore=shutil.ignore_patterns('node_modules', '.next', '.bun', '*.zip', '*.tar.gz'))

shutil.make_archive('/app/applet/public/futsar-app-final', 'zip', '/tmp/futsar-app-clean/applet')
print("Done creating clean ZIP")
