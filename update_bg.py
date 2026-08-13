import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update <main> tag to have a transparent background or remove the solid bg color.
# Actually, the user wants the video to be the background EVERYWHERE.
# So we move the Background Video from the hero section to the very top inside <main>.

old_hero_video = """      {/* --- NOT LOGGED IN: HERO SECTION --- */}
      {!user && (
        <div className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between p-6 z-10 overflow-hidden">
          {/* Background Video & Overlay */}
          <div className="absolute inset-0 w-full h-full z-0 bg-[#0a0a0a]">
            {/* Primary Moving Video Background */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 transition-opacity duration-1000"
            >
              <source src="/logo-futsar.mp4" type="video/mp4" />
            </video>
            {/* Subtle Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none"></div>
          </div>"""

new_hero_video = """      {/* --- NOT LOGGED IN: HERO SECTION --- */}
      {!user && (
        <div className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between p-6 z-10 overflow-hidden">"""

content = content.replace(old_hero_video, new_hero_video)

# 2. Insert the video at the top of <main>
old_main = """  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden relative flex flex-col">
      {/* Global Gradient Background */}"""

new_main = """  return (
    <main className="min-h-screen w-full bg-black text-white overflow-x-hidden relative flex flex-col">
      {/* Global Video Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
        >
          <source src="/logo-futsar.mp4" type="video/mp4" />
        </video>
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>
      </div>
      
      {/* Global Gradient Background */}"""

content = content.replace(old_main, new_main)

# 3. Modals use fixed inset-0 w-full h-full bg-[#0a0a0a]
# Let's change bg-[#0a0a0a] to bg-black/60 backdrop-blur-lg
old_modal_bg1 = """<div className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-[100] flex flex-col overflow-y-auto">"""
new_modal_bg1 = """<div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xl z-[100] flex flex-col overflow-y-auto">"""
content = content.replace(old_modal_bg1, new_modal_bg1)

old_modal_bg2 = """<div className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-50 flex flex-col p-6 overflow-y-auto">"""
new_modal_bg2 = """<div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xl z-50 flex flex-col p-6 overflow-y-auto">"""
content = content.replace(old_modal_bg2, new_modal_bg2)

with open('app/page.tsx', 'w') as f:
    f.write(content)
