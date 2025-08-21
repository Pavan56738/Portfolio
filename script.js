/*
  script.js — drop this file at /public/js/script.js (or /js/script.js at your project root)
  What it does:
  1) Makes the CV button download reliably on Vercel
  2) Enables dark mode toggle and mobile menu
  3) Activates social icons + external links safely
  4) Adds “Read more / Read less” for About and Blog cards
  5) Small UX touches: smooth‑scroll, back‑to‑top, active nav highlight
*/

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // -------- 0) Helpers --------
  const isExternal = (url) => /^(https?:)?\/\//i.test(url);
  const truncate = (str, n = 160) => (str.length > n ? str.slice(0, n).trimEnd() + "…" : str);

  // -------- 1) CV download --------
  // EXPECTATION: place your CV at /public/cv/Chinthaginjala_Pavankalyan_CV.pdf
  // In HTML, the button can stay <a href="/cv/Chinthaginjala_Pavankalyan_CV.pdf" class="btn cv-btn">Download CV</a>
  const cvBtn = $('.home .[href$="cv.pdf"], .home .cv-');
  if (cvBtn) {
    // Ensure it’s a same‑origin URL and force download attribute
    try {
      const a = cvBtn;
      const url = new URL(a.getAttribute('href'), window.location.origin);
      // Use a filename if not already set
      const fileName = url.pathname.split('/').pop() || 'cv.pdf';
      a.setAttribute('href', url.pathname); // keep it path‑relative for Vercel
      a.setAttribute('download', fileName);
      a.setAttribute('type', 'application/pdf');
      a.addEventListener('click', (e) => {
        // If file is missing, show a friendly message
        fetch(url.pathname, { method: 'HEAD' })
          .then((r) => {
            if (!r.ok) throw new Error('missing');
          })
          .catch(() => {
            e.preventDefault();
            alert('CV file not found at ' + url.pathname + '\n\nPlace it in your project at /public' + url.pathname + ' and redeploy.');
          });
      });
    } catch (_) {}
  }

  // -------- 2) Dark mode toggle --------
  const darkToggle = $('#darkMode-icon');
  if (darkToggle) {
    const apply = (on) => document.documentElement.classList.toggle('dark', on);
    apply(localStorage.getItem('theme') === 'dark');
    darkToggle.addEventListener('click', () => {
      const nowDark = !document.documentElement.classList.contains('dark');
      apply(nowDark);
      localStorage.setItem('theme', nowDark ? 'dark' : 'light');
      // optional icon swap if you use two icons
      darkToggle.classList.toggle('bx-sun', nowDark);
      darkToggle.classList.toggle('bx-moon', !nowDark);
    });
  }

  // -------- 3) Mobile menu --------
  const menuIcon = $('#menu-icon');
  const navbar = $('.navbar');
  if (menuIcon && navbar) {
    menuIcon.addEventListener('click', () => {
      navbar.classList.toggle('active');
      menuIcon.classList.toggle('bx-x');
      document.body.classList.toggle('overflow-hidden');
    });
    // Close on link click
    $$('.navbar a').forEach((a) =>
      a.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuIcon.classList.remove('bx-x');
        document.body.classList.remove('overflow-hidden');
      })
    );
  }

  // -------- 4) Social + external links safety --------
  // Make external links open in a new tab with rel security flags
  $$('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (isExternal(href)) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // -------- 5) Read More / Read Less --------
  // (A) About section — collapse long text
  const about = $('.about .about-content');
  if (about) {
    const paras = $$('.about .about-content p');
    const longText = paras.map((p) => p.textContent.trim()).join(' ');
    const btn = $('.about .about-content .btn');
    if (btn && longText.length > 220) {
      const full = longText;
      const short = truncate(full, 220);

      // Replace the first paragraph as the container, hide the rest
      if (paras.length) {
        paras.slice(1).forEach((p) => (p.style.display = 'none'));
        paras[0].textContent = short;
        let expanded = false;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          expanded = !expanded;
          paras[0].textContent = expanded ? full : short;
          paras.slice(1).forEach((p) => (p.style.display = expanded ? '' : 'none'));
          btn.textContent = expanded ? 'Read Less' : 'Read More';
        });
      }
    }
  }

  // (B) Blog / Services cards — per‑card toggle
  $$('.services .services-box').forEach((card) => {
    const p = $('p', card);
    const btn = $('.btn', card);
    if (!p || !btn) return;
    const full = p.textContent.trim();
    if (full.length <= 140) return; // leave short ones alone
    const short = truncate(full, 140);
    p.textContent = short;
    let expanded = false;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      expanded = !expanded;
      p.textContent = expanded ? full : short;
      btn.textContent = expanded ? 'Read Less' : 'Read More';
    });
  });

  // -------- 6) Smooth scroll to anchors --------
  $$('.navbar a[href^="#"], .footer-iconTop a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // -------- 7) Active menu on scroll --------
  const sections = $$('section[id]');
  const onScroll = () => {
    const top = window.scrollY + 120; // offset for sticky header
    sections.forEach((sec) => {
      const start = sec.offsetTop;
      const end = start + sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = $(`.navbar a[href="#${id}"]`);
      if (!link) return;
      if (top >= start && top < end) link.classList.add('active');
      else link.classList.remove('active');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------- 8) Back‑to‑top button (if present) --------
  const topBtn = $('.footer-iconTop a');
  if (topBtn) {
    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------- 9) Prevent empty contact form submit (demo only) --------
  const form = $('.contact form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! Form submit is disabled in demo. Hook this up to Formspree, Getform, or your backend.');
    });
  }
})();



