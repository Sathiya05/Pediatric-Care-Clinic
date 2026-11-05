/* ============================================================
   LittleSteps Pediatric Care - footer.js
   THE ONLY place footer markup exists. Every page includes an
   empty <div id="footer"></div> and this module injects the
   complete footer and sets the dynamic copyright year.
   ============================================================ */
'use strict';

(function () {
  const PREFIX = window.location.pathname.replace(/\\/g, '/').includes('/dashboard/') ? '../' : '';
  const p = (path) => PREFIX + path;

  const logoSVG = `
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="14" fill="#287C91"/>
      <path d="M15 30c0-6.6 4.4-11 9-11s9 4.4 9 11" stroke="#DDF3EF" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 12v8M20 16h8" stroke="#F4A261" stroke-width="3" stroke-linecap="round"/>
      <circle cx="24" cy="36" r="2.4" fill="#F4A261"/>
    </svg>`;

  const social = (href, label, svg) => `
    <a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}"
       class="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-[color:var(--accent)] hover:text-[#F4A261] hover:border-[#F4A261] transition-colors">
      ${svg}
    </a>`;

  const footerHTML = `
<footer class="bg-[#12343F] dark:bg-[#0E232C] text-[#CBD5E1] print:hidden" role="contentinfo">
  <div class="container-site py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">

    <!-- Brand -->
    <div class="space-y-4">
      <a href="${p('index.html')}" class="inline-flex items-center gap-2.5 group" aria-label="LittleSteps Pediatric Care - Home">
        ${logoSVG}
        <span class="flex flex-col leading-tight">
          <span class="font-logo font-semibold text-xl tracking-tight text-white group-hover:text-[color:var(--secondary)] transition-colors">LittleSteps</span>
          <span class="text-[10px] font-medium uppercase tracking-[0.22em] text-[#F4A261]">Pediatric Care</span>
        </span>
      </a>
      <p class="text-sm leading-relaxed text-[#CBD5E1]">Compassionate, child-friendly pediatric and wellness care — growing healthy, growing happy, one little step at a time.</p>
      <div class="flex items-center gap-2">
        ${social('https://www.facebook.com/', 'LittleSteps on Facebook (demo link)', '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98A10 10 0 0 0 22 12z"/></svg>')}
        ${social('https://www.instagram.com/', 'LittleSteps on Instagram (demo link)', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" stroke="none"/></svg>')}
        ${social('https://www.youtube.com/', 'LittleSteps on YouTube (demo link)', '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.85-.49-5.7a2.9 2.9 0 0 0-2.17-2.17C18.9 3.66 12 3.66 12 3.66s-6.9 0-8.34.47A2.9 2.9 0 0 0 1.49 6.3C1 8.15 1 12 1 12s0 3.85.49 5.7a2.9 2.9 0 0 0 2.17 2.17c1.44.47 8.34.47 8.34.47s6.9 0 8.34-.47a2.9 2.9 0 0 0 2.17-2.17C23 15.85 23 12 23 12zM10.3 15.4V8.6L15.7 12l-5.4 3.4z"/></svg>')}
        ${social('https://www.linkedin.com/', 'LittleSteps on LinkedIn (demo link)', '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM4.5 9h1v12h-1zM9.5 9h.96v1.64h.04c.13-.25.46-.82 1.52-.82 1.63 0 2.73 1.06 2.73 3.14V21h-1v-6.6c0-1.6-.6-2.66-1.76-2.66-1.36 0-2.25.9-2.25 2.8V21h-1z"/></svg>')}
      </div>
    </div>

    <!-- Quick links -->
    <nav aria-label="Quick links">
      <h2 class="font-heading font-semibold text-white text-base mb-4">Quick Links</h2>
      <ul class="space-y-2 text-sm">
        <li><a class="hover:text-white transition-colors" href="${p('index.html')}">Home</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('about.html')}">About</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('services.html')}">Services</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('doctors.html')}">Doctors</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('vaccinations.html')}">Vaccinations</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('appointments.html')}">Book Appointment</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('contact.html')}">Contact</a></li>
      </ul>
    </nav>

    <!-- Services -->
    <nav aria-label="Our services">
      <h2 class="font-heading font-semibold text-white text-base mb-4">Our Services</h2>
      <ul class="space-y-2 text-sm">
        <li><a class="hover:text-white transition-colors" href="${p('services.html#well-child')}">Well-Child Visits</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('vaccinations.html')}">Vaccination Services</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('services.html#growth')}">Growth Monitoring</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('services.html#development')}">Developmental Screening</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('services.html#nutrition')}">Nutrition Guidance</a></li>
        <li><a class="hover:text-white transition-colors" href="${p('services.html#newborn')}">Newborn Care</a></li>
      </ul>
    </nav>

    <!-- Contact -->
    <div>
      <h2 class="font-heading font-semibold text-white text-base mb-4">Visit the Clinic</h2>
      <ul class="space-y-3 text-sm">
        <li class="flex items-start gap-2.5">
          <svg class="shrink-0 mt-0.5 text-[#F4A261]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>123 Wellness Avenue, Suite 210,<br>Springfield, ST 40021<br><span class="text-xs text-[#94A9B2]">(placeholder address — replace with your clinic)</span></span>
        </li>
        <li class="flex items-center gap-2.5">
          <svg class="shrink-0 text-[#F4A261]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.4a16 16 0 0 0 6 6l2.76-1.27a2 2 0 0 1 2.11.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <a class="hover:text-white transition-colors" href="tel:+15551234567">+1 (555) 123-4567 <span class="text-xs text-[#94A9B2]">(placeholder)</span></a>
        </li>
        <li class="flex items-center gap-2.5">
          <svg class="shrink-0 text-[#F4A261]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></svg>
          <a class="hover:text-white transition-colors break-all" href="mailto:hello@littlesteps-demo.com">hello@littlesteps-demo.com <span class="text-xs text-[#94A9B2]">(placeholder)</span></a>
        </li>
        <li class="flex items-start gap-2.5">
          <svg class="shrink-0 mt-0.5 text-[#F4A261]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 14.5 13.5"/></svg>
          <span>Mon–Sat: 8:30 AM – 6:30 PM<br>Sun: 9:00 AM – 1:00 PM (sick visits)<br><span class="text-xs text-[#94A9B2]">(placeholder hours)</span></span>
        </li>
      </ul>
    </div>
  </div>

  <div class="border-t border-white/10">
    <div class="container-site py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
      <p>© <span id="footerYear">2026</span> LittleSteps Pediatric Care. All rights reserved.</p>
      <nav class="flex flex-wrap items-center gap-4" aria-label="Legal">
        <a class="hover:text-white transition-colors" href="${p('privacy.html')}">Privacy Policy</a>
        <a class="hover:text-white transition-colors" href="${p('terms.html')}">Terms &amp; Conditions</a>
        <span class="text-[#94A9B2]">Not a substitute for professional medical advice. In an emergency, call your local emergency number.</span>
      </nav>
    </div>
  </div>
</footer>`;

  function init() {
    const host = document.getElementById('footer');
    if (!host) return;
    host.innerHTML = footerHTML;
    const yearEl = host.querySelector('#footerYear');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
