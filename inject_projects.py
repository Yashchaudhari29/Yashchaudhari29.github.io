with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_projects = '''
        <!-- Project FluentScore -->
        <div class="reveal proj-card glass-panel rounded-2xl overflow-hidden" style="border-radius:18px;transition-delay:80ms">
          <canvas class="proj-anim" id="anim-fluent"></canvas>
          <div class="p-6">
            <h3 class="font-serif italic text-xl text-white mb-2">FluentScore | AI IELTS Platform</h3>
            <p class="text-white/58 text-sm leading-relaxed mb-4">React, AI, Speech Recognition, NLP. Real-time IELTS Speaking practice simulating Parts 1-3 with instant AI feedback.</p>
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/70">React</span>
              <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/70">NLP</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-widest text-[#38dd76]">Live Preview</span>
              <a href="https://fluentscore.vercel.app/" target="_blank" class="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Project GP-Sync -->
        <div class="reveal proj-card glass-panel rounded-2xl overflow-hidden" style="border-radius:18px;transition-delay:160ms">
          <canvas class="proj-anim" id="anim-gpsync"></canvas>
          <div class="p-6">
            <h3 class="font-serif italic text-xl text-white mb-2">GP-Sync | Google Photos Scraper</h3>
            <p class="text-white/58 text-sm leading-relaxed mb-4">Engineered automated Google Photos scraper using Selenium and Kivy. Processed 100,000+ photos efficiently with multi-threading.</p>
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/70">Python</span>
              <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/70">Selenium</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8]">Web Service</span>
              <a href="https://gpsync.online" target="_blank" class="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>
        </div>
'''

content = content.replace('<!-- Project 1 -->', new_projects + '\\n        <!-- Project 1 -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Successfully inserted new projects.')
