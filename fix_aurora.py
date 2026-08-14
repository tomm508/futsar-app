import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

aurora_screen_component = """
function GeminiScreenAurora({ intensity = 'subtle' }: { intensity?: 'subtle' | 'normal' | 'vibrant' }) {
  const opacityClass = intensity === 'subtle' ? 'opacity-30' : intensity === 'vibrant' ? 'opacity-60' : 'opacity-40';
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${opacityClass}`}>
      {/* Top Left */}
      <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#4285f4] via-[#2b71f0] to-[#00f2fe] blur-[80px] animate-gemini-float-1" />
      
      {/* Top Right */}
      <div className="absolute -top-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-[#9b51e0] via-[#d946ef] to-[#7928ca] blur-[90px] animate-gemini-float-2" />
      
      {/* Bottom Left */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#06b6d4] to-[#10b981] blur-[80px] animate-gemini-float-2" />
      
      {/* Bottom Right */}
      <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-[#ffd700] via-[#f59e0b] to-[#9b51e0] blur-[80px] animate-gemini-float-1" />
    </div>
  );
}
"""

if "function GeminiScreenAurora" not in content:
    content = content.replace("function GeminiCenterNebula", aurora_screen_component + "\nfunction GeminiCenterNebula")

# Add it to the USER Dashboard
user_dashboard_start = """      {/* --- LOGGED IN: DASHBOARD (ACTIVE) --- */}
      {user && user.role !== 'admin' && (!user.status || user.status === 'active') && (
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500">"""
        
user_dashboard_replace = """      {/* --- LOGGED IN: DASHBOARD (ACTIVE) --- */}
      {user && user.role !== 'admin' && (!user.status || user.status === 'active') && (
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500 relative">
          <GeminiScreenAurora intensity="subtle" />"""

content = content.replace(user_dashboard_start, user_dashboard_replace)

# Add it to the ADMIN Dashboard
admin_dashboard_start = """      {/* --- ADMIN DASHBOARD --- */}
      {user && user.role === 'admin' && (
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500">"""
        
admin_dashboard_replace = """      {/* --- ADMIN DASHBOARD --- */}
      {user && user.role === 'admin' && (
        <div className="w-full min-h-screen flex flex-col z-10 animate-in fade-in duration-500 relative">
          <GeminiScreenAurora intensity="subtle" />"""

content = content.replace(admin_dashboard_start, admin_dashboard_replace)

with open('app/App.tsx', 'w') as f:
    f.write(content)
