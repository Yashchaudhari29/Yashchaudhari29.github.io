with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

hero_html = '''
  <!-- ------- NEW HERO ------- -->
  <section id="hero-landing" class="relative h-[100dvh] w-full overflow-hidden bg-[#090b0d]">
    <!-- BG Image -->
    <img src="https://images.higgs.ai/?default=1&amp;output=webp&amp;url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260729_022513_486985a2-ac8c-4278-91a8-071dcd9fcaff.png&amp;w=1280&amp;q=85" alt="" class="absolute inset-0 h-full w-full object-cover anim-fade-in" style="z-index: 1;">
    
    <!-- Marquee -->
    <div class="absolute inset-x-0 top-[16vh] sm:top-[14vh] overflow-hidden anim-fade-up" style="animation-delay: 500ms; z-index: 10;">
      <div class="marquee-track font-hn text-[16vh] sm:text-[26vh] leading-none text-cream">
        <span class="pr-[6vw]">Yash &mdash; Chaudhari</span>
        <span class="pr-[6vw]">Yash &mdash; Chaudhari</span>
      </div>
    </div>

    <!-- Cream Rule -->
    <div class="absolute inset-x-6 sm:inset-x-10 bottom-[5.5rem] sm:bottom-28 h-0.5 bg-cream anim-line" style="animation-delay: 1200ms; z-index: 10;"></div>

    <!-- Desktop Footer -->
    <div class="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-5 sm:px-10 sm:pb-8 text-xs sm:text-sm leading-relaxed font-hn text-cream anim-fade-up" style="animation-delay: 1400ms; z-index: 10;">
      <div>
        <p>AI Engineer</p>
        <p>Full-Stack Developer</p>
        <p>Obsessed by Technology</p>
      </div>
      <div class="text-right anim-fade-up" style="animation-delay: 1550ms;">
        <p>A homage to</p>
        <p>Marcus Holloway</p>
      </div>
    </div>

    <!-- Front Portrait -->
    <img src="https://stone-expand-60400629.figma.site/_assets/v11/8da570354e86aa0d44ac3e4aa335a72c8e750d68.png" alt="Portrait" class="absolute inset-0 h-full w-full object-cover anim-rise-in pointer-events-none" style="z-index: 20; animation-delay: 300ms;">

    <!-- Header -->
    <header class="absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8 text-cream" style="z-index: 30;">
      <div class="font-hn text-lg tracking-wide anim-fade-up" style="animation-delay: 800ms;">Yash</div>
      <div class="hidden sm:flex items-start gap-16 lg:gap-24 anim-fade-up" style="animation-delay: 900ms;">
        <div class="text-sm">2026</div>
        <nav class="flex flex-col gap-0.5 text-sm">
          <a href="#about" class="hover:opacity-60 transition-opacity duration-300" style="animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 1000ms;">Story</a>
          <a href="#projects" class="hover:opacity-60 transition-opacity duration-300" style="animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 1080ms;">Projects</a>
          <a href="#contact" class="hover:opacity-60 transition-opacity duration-300" style="animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 1160ms;">Message</a>
        </nav>
        <div class="flex flex-col gap-0.5 text-sm">
          <a href="https://github.com/Yashchaudhari29" class="hover:opacity-60 transition-opacity duration-300" style="animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 1150ms;">GitHub</a>
          <a href="https://www.linkedin.com/in/yash-chaudhari-254961242/" class="hover:opacity-60 transition-opacity duration-300" style="animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 1230ms;">LinkedIn</a>
        </div>
      </div>
      <!-- Mobile Hamburger -->
      <button id="ham-landing" class="sm:hidden anim-fade-up z-50 h-10 w-10 relative flex flex-col items-center justify-center gap-1.5" style="animation-delay: 900ms;" onclick="document.getElementById('mobile-drawer').classList.add('open'); document.getElementById('drawer-backdrop').classList.remove('hidden'); document.body.style.overflow='hidden';">
        <div class="h-0.5 w-6 bg-cream"></div>
        <div class="h-0.5 w-6 bg-cream"></div>
        <div class="h-0.5 w-6 bg-cream"></div>
      </button>
    </header>

    <!-- Mobile Drawer -->
    <div id="drawer-backdrop" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm hidden" onclick="document.getElementById('mobile-drawer').classList.remove('open'); document.getElementById('drawer-backdrop').classList.add('hidden'); document.body.style.overflow='';"></div>
    <div id="mobile-drawer" class="fixed top-0 right-0 bottom-0 z-40 w-[80%] max-w-sm bg-[#141414] px-8 py-10 translate-x-full">
      <button onclick="document.getElementById('mobile-drawer').classList.remove('open'); document.getElementById('drawer-backdrop').classList.add('hidden'); document.body.style.overflow='';" class="absolute right-6 top-6 text-cream">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <div class="mt-16">
        <p class="text-cream/50 uppercase tracking-[0.2em] text-xs mb-6">Site Index</p>
        <nav class="flex flex-col gap-4 text-4xl text-cream font-hn">
          <a href="#about" onclick="document.getElementById('drawer-backdrop').click()">Story</a>
          <a href="#projects" onclick="document.getElementById('drawer-backdrop').click()">Projects</a>
          <a href="#contact" onclick="document.getElementById('drawer-backdrop').click()">Message</a>
        </nav>
      </div>
      <div class="mt-16">
        <p class="text-cream/50 uppercase tracking-[0.2em] text-xs mb-6">Find Me</p>
        <nav class="flex gap-6 text-sm text-cream font-hn">
          <a href="https://github.com/Yashchaudhari29">GitHub</a>
          <a href="https://www.linkedin.com/in/yash-chaudhari-254961242/">LinkedIn</a>
        </nav>
      </div>
    </div>
  </section>
'''

body_tag = '<body class="bg-[#090b0d] text-white antialiased" style="overflow-x:clip">'
if body_tag in content:
    content = content.replace(body_tag, body_tag + '\n' + hero_html)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully inserted new hero section.')
else:
    print('Body tag not found.')
