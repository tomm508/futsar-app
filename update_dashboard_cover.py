import re

with open('/app/applet/app/App.tsx', 'r') as f:
    content = f.read()

target = """              {/* Member Card */}
              <div 
                className="bg-gradient-to-br from-[#151515]/80 to-[#0a0a0a]/80 backdrop-blur-md rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all border"
                style={{
                  borderColor: user.themeColor ? `${user.themeColor}50` : 'rgba(212,175,55,0.3)',
                  boxShadow: `0 10px 40px ${user.themeColor ? user.themeColor + '15' : 'rgba(212,175,55,0.1)'}`
                }}
              >
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5">"""

replacement = """              {/* Member Card */}
              <div 
                className="bg-[#151515]/80 backdrop-blur-md rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all border bg-cover bg-center"
                style={{
                  borderColor: user.themeColor ? `${user.themeColor}50` : 'rgba(212,175,55,0.3)',
                  boxShadow: `0 10px 40px ${user.themeColor ? user.themeColor + '15' : 'rgba(212,175,55,0.1)'}`,
                  backgroundImage: (user.coverUrl && !user.coverUrl.startsWith('css:')) ? `url(${user.coverUrl})` : 'none'
                }}
              >
                {user.coverUrl?.startsWith('css:') && (
                  <AnimatedCssCover url={user.coverUrl} />
                )}
                
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />

                <div className="absolute right-[-20px] bottom-[-20px] opacity-5">"""

content = content.replace(target, replacement)

with open('/app/applet/app/App.tsx', 'w') as f:
    f.write(content)

