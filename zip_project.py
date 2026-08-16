import shutil
import os

# Create a zip file from /app/applet
# We need to ignore node_modules, .next, .git
def ignore_patterns(dir, contents):
    ignored = []
    for c in contents:
        if c in ['node_modules', '.next', '.git', '.bun']:
            ignored.append(c)
    return ignored

# create a temporary directory
os.makedirs('/tmp/futsar-app', exist_ok=True)

# we can't easily ignore with make_archive directly, so let's copy tree first
if os.path.exists('/tmp/futsar-app/applet'):
    shutil.rmtree('/tmp/futsar-app/applet')
shutil.copytree('/app/applet', '/tmp/futsar-app/applet', ignore=shutil.ignore_patterns('node_modules', '.next', '.git', '.bun', 'futsar-app.zip'))

shutil.make_archive('/app/applet/public/futsar-app', 'zip', '/tmp/futsar-app/applet')
print("Done")
