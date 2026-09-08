
import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s1 = r'<div class=\x22aspect-video relative overflow-hidden bg-gradient-to-br from-\[\#0B1A1E\].*?REC</div>\s*</div>'
r1 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22FluentScore\x22></div>'
text = re.sub(s1, r1, text, flags=re.DOTALL)

s2 = r'<div class=\x22aspect-video relative overflow-hidden bg-gradient-to-br from-\[\#12142B\].*?syncing thread 4: OK</div>\s*</div>\s*</div>'
r2 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22GP-Sync\x22></div>'
text = re.sub(s2, r2, text, flags=re.DOTALL)

s3 = r'<div class=\x22aspect-video relative overflow-hidden bg-gradient-to-br from-\[\#1A0B0B\].*?<i class=\x22bi bi-server text-2xl text-white/80\x22></i>\s*</div>\s*</div>'
r3 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22ONGC Dashboard\x22></div>'
text = re.sub(s3, r3, text, flags=re.DOTALL)

s4 = r'<div class=\x22aspect-video relative overflow-hidden bg-gradient-to-br from-\[\#1B112C\].*?bi bi-robot text-\[\#38dd76\]\x22></i></div>\s*</div>\s*</div>'
r4 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22YouTube Sagebot\x22></div>'
text = re.sub(s4, r4, text, flags=re.DOTALL)

s5 = r'<canvas class=\x22proj-anim\x22 id=\x22anim-face\x22></canvas>'
r5 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1554200876-56c2f25224fa?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22IntelliFace\x22></div>'
text = re.sub(s5, r5, text, flags=re.DOTALL)

s6 = r'<canvas class=\x22proj-anim\x22 id=\x22anim-data\x22></canvas>'
r6 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22Data Science\x22></div>'
text = re.sub(s6, r6, text, flags=re.DOTALL)

s7 = r'<canvas class=\x22proj-anim\x22 id=\x22anim-spam\x22></canvas>'
r7 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22Spam Detect\x22></div>'
text = re.sub(s7, r7, text, flags=re.DOTALL)

s8 = r'<canvas class=\x22proj-anim\x22 id=\x22anim-digit\x22></canvas>'
r8 = '<div class=\x22aspect-video relative overflow-hidden bg-black border-b border-white/10\x22><img src=\x22https://images.unsplash.com/photo-1555952494-efd681c7e3f5?q=80\x26w=800\x26auto=format\x26fit=crop\x22 class=\x22w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700\x22 alt=\x22Digit Recognition\x22></div>'
text = re.sub(s8, r8, text, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(text)

