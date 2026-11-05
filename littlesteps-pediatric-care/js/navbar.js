/* ============================================================
   LittleSteps Pediatric Care - navbar.js
   THE ONLY place navbar markup exists. Every page includes an
   empty <div id="navbar"></div> and this module injects the
   complete navbar, then wires dropdowns, mobile menu, theme
   and RTL controls, and active-page highlighting.
   ============================================================ */
'use strict';

(function () {
  // Base path prefix so links work from both root pages and /dashboard/*
  const PREFIX = window.location.pathname.replace(/\\/g, '/').includes('/dashboard/') ? '../' : '';
  const p = (path) => PREFIX + path;

  const logoSVG = `
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="14" fill="#287C91"/>
      <path d="M15 30c0-6.6 4.4-11 9-11s9 4.4 9 11" stroke="#DDF3EF" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 12v8M20 16h8" stroke="#F4A261" stroke-width="3" stroke-linecap="round"/>
      <circle cx="24" cy="36" r="2.4" fill="#F4A261"/>
    </svg>`;

  const sunIcon = '<svg data-icon="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const moonIcon = '<svg data-icon="moon" class="hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const rtlIcon = '<svg class="rtl-flip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>';
  const chevron = '<svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

  const themeToggle = `
    <button type="button" class="btn-icon" data-action="toggle-theme" aria-label="Toggle dark mode" aria-pressed="false" title="Toggle dark mode">
      ${sunIcon}${moonIcon}
    </button>`;

  const rtlToggle = `
    <button type="button" class="btn-icon rtl-flip" data-action="toggle-rtl" aria-label="Toggle right-to-left layout" aria-pressed="false" title="Toggle right-to-left layout">
      ${rtlIcon}
    </button>`;

  const dropdownItem = (href, label) => `
    <a class="nav-dropdown-item" href="${p(href)}" data-nav="${href.split('/').pop()}">
      <span class="w-2 h-2 rounded-full bg-[color:var(--secondary)] shrink-0" aria-hidden="true"></span>
      <span>${label}</span>
    </a>`;

  const navbarHTML = `
<a class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[70] btn btn-primary btn-sm" href="#main-content">Skip to main content</a>
<header class="navbar-sticky bg-[color:var(--card)] border-b border-[color:var(--border)] shadow-sm" role="banner">
  <div class="container-site">
    <div class="flex items-center justify-between gap-2 sm:gap-4 h-[72px]">

      <!-- Brand -->
      <a href="${p('index.html')}" class="flex items-center gap-2.5 shrink-0 group" aria-label="LittleSteps Pediatric Care - Home">
        ${logoSVG}
        <span class="flex flex-col leading-tight">
          <span class="font-logo font-semibold text-xl sm:text-2xl tracking-tight text-[color:var(--primary)] group-hover:text-[color:var(--primary-dark)] transition-colors">LittleSteps</span>
          <span class="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">Pediatric Care</span>
        </span>
      </a>

      <!-- Desktop navigation -->
      <nav class="hidden wide:flex items-center gap-1" aria-label="Primary navigation">
        <div class="nav-dropdown relative" data-dropdown>
          <button type="button" class="nav-link" aria-expanded="false" aria-haspopup="true" aria-controls="dd-home" data-nav-match="index.html home2.html">Home ${chevron}</button>
          <div class="nav-dropdown-panel start-0" id="dd-home" role="menu" aria-label="Home pages">
            ${dropdownItem('index.html', 'Home 1')}
            ${dropdownItem('home2.html', 'Home 2')}
          </div>
        </div>
        <a class="nav-link" href="${p('about.html')}" data-nav="about.html">About</a>
        <a class="nav-link" href="${p('services.html')}" data-nav="services.html">Services</a>
        <a class="nav-link" href="${p('doctors.html')}" data-nav="doctors.html">Doctors</a>
        <a class="nav-link" href="${p('vaccinations.html')}" data-nav="vaccinations.html">Vaccinations</a>
        <a class="nav-link" href="${p('contact.html')}" data-nav="contact.html">Contact</a>
        <div class="nav-dropdown relative" data-dropdown>
          <button type="button" class="nav-link" aria-expanded="false" aria-haspopup="true" aria-controls="dd-dash" data-nav-match="parent-dashboard.html admin-dashboard.html">Dashboard ${chevron}</button>
          <div class="nav-dropdown-panel start-0" id="dd-dash" role="menu" aria-label="Dashboards">
            ${dropdownItem('dashboard/parent-dashboard.html', 'Parent Dashboard')}
            ${dropdownItem('dashboard/admin-dashboard.html', 'Admin Dashboard')}
          </div>
        </div>
      </nav>

      <!-- Right controls: desktop only (>= 1377px) -->
      <div class="hidden wide:flex items-center gap-2 shrink-0">
        ${themeToggle}
        ${rtlToggle}
        <a href="${p('login.html')}" class="btn-outline btn-sm">Login</a>
        <a href="${p('appointments.html')}" class="btn-primary btn-sm">Book Appointment</a>
      </div>

      <!-- Mobile / tablet: hamburger only (below 1377px) -->
      <div class="flex wide:hidden items-center gap-1.5 shrink-0">
        <span class="hidden sm:inline-flex md:hidden items-center gap-1.5">${themeToggle}${rtlToggle}</span>
        <button type="button" id="hamburger" class="btn-icon wide:hidden" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileMenu">
          <svg id="iconOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
          <svg id="iconClose" class="hidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div id="mobileMenu" class="hidden wide:hidden border-t border-[color:var(--border)] py-4" role="region" aria-label="Mobile navigation">
      <nav class="grid gap-1" aria-label="Mobile navigation links">
        <p class="px-3 pt-1 text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Pages</p>
        <a class="nav-link" href="${p('index.html')}" data-nav="index.html">Home 1</a>
        <a class="nav-link" href="${p('home2.html')}" data-nav="home2.html">Home 2</a>
        <a class="nav-link" href="${p('about.html')}" data-nav="about.html">About</a>
        <a class="nav-link" href="${p('services.html')}" data-nav="services.html">Services</a>
        <a class="nav-link" href="${p('doctors.html')}" data-nav="doctors.html">Doctors</a>
        <a class="nav-link" href="${p('vaccinations.html')}" data-nav="vaccinations.html">Vaccinations</a>
        <a class="nav-link" href="${p('appointments.html')}" data-nav="appointments.html">Book Appointment</a>
        <a class="nav-link" href="${p('contact.html')}" data-nav="contact.html">Contact</a>
        <p class="px-3 pt-3 text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Dashboards</p>
        <a class="nav-link" href="${p('dashboard/parent-dashboard.html')}" data-nav="parent-dashboard.html">Parent Dashboard</a>
        <a class="nav-link" href="${p('dashboard/admin-dashboard.html')}" data-nav="admin-dashboard.html">Admin Dashboard</a>
        <div class="flex items-center gap-2 px-3 pt-3">
          ${themeToggle}
          ${rtlToggle}
          <a href="${p('login.html')}" class="btn-outline btn-sm flex-1">Login</a>
          <a href="${p('appointments.html')}" class="btn-primary btn-sm flex-1">Book Appointment</a>
        </div>
      </nav>
    </div>
  </div>
</header>`;

  function init() {
    const host = document.getElementById('navbar');
    if (!host) return;
    host.innerHTML = navbarHTML;

    // Active page highlighting (file-name based)
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    host.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.getAttribute('data-nav').toLowerCase() === current) {
        link.setAttribute('aria-current', 'page');
      }
    });
    // Dropdown triggers light up when one of their pages is the current one
    host.querySelectorAll('[data-nav-match]').forEach((trigger) => {
      const pages = trigger.getAttribute('data-nav-match').toLowerCase().split(/\s+/);
      if (pages.includes(current)) trigger.setAttribute('aria-current', 'page');
    });

    /* ---------- Dropdowns (mouse + keyboard + touch) ---------- */
    const dropdowns = host.querySelectorAll('[data-dropdown]');

    const closeAll = (except) => {
      dropdowns.forEach((dd) => {
        if (dd !== except) {
          dd.classList.remove('open');
          dd.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        }
      });
    };

    dropdowns.forEach((dd) => {
      const trigger = dd.querySelector('.nav-link');
      const panel = dd.querySelector('.nav-dropdown-panel');
      if (!trigger || !panel) return;

      const setOpen = (open) => {
        dd.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', String(open));
      };
      const toggle = () => {
        const willOpen = !dd.classList.contains('open');
        closeAll(dd);
        setOpen(willOpen);
      };

      trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

      // Open on hover for pointer devices
      dd.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) { closeAll(dd); setOpen(true); } });
      dd.addEventListener('mouseleave', () => { if (window.matchMedia('(hover: hover)').matches) setOpen(false); });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeAll(dd);
          setOpen(true);
          panel.querySelector('a')?.focus();
        } else if (e.key === 'Escape') {
          setOpen(false);
          trigger.focus();
        }
      });

      panel.addEventListener('keydown', (e) => {
        const items = Array.from(panel.querySelectorAll('a'));
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.focus(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Tab' && !e.shiftKey && idx === items.length - 1) { setOpen(false); }
      });
    });

    document.addEventListener('click', () => closeAll(null));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(null); });

    /* ---------- Mobile menu ---------- */
    const hamburger = host.querySelector('#hamburger');
    const mobileMenu = host.querySelector('#mobileMenu');
    const iconOpen = host.querySelector('#iconOpen');
    const iconClose = host.querySelector('#iconClose');

    if (hamburger && mobileMenu) {
      const setMenu = (open) => {
        mobileMenu.classList.toggle('hidden', !open);
        hamburger.setAttribute('aria-expanded', String(open));
        iconOpen.classList.toggle('hidden', open);
        iconClose.classList.toggle('hidden', !open);
        document.body.style.overflow = open ? 'hidden' : '';
      };
      hamburger.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));
      // Close after selecting any link
      mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
      // Close when resizing up to desktop (>= 1377px)
      window.addEventListener('resize', () => { if (window.innerWidth >= 1377) setMenu(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }

    // Re-apply theme/RTL pressed states now that buttons exist
    if (window.LittleSteps) {
      window.LittleSteps.applyTheme(window.LittleSteps.getPreferredTheme());
      window.LittleSteps.applyDir(document.documentElement.getAttribute('dir') || 'ltr');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
