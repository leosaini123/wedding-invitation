/* ═══════════════════════════════════════════════════════════
   Lovepreet & Arohi — "The Reel"
   Scroll is the playhead. Everything below is progressive:
   the page is fully readable with this file, or GSAP, absent.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── the only things worth editing in this file ────────── */
  var CONTENT = {
    // Haldi Carnival, 23 Nov 2026, 11:00 AM IST
    countdownTo: '2026-11-23T11:00:00+05:30'
  };

  var root = document.documentElement;
  var hasGSAP = typeof window.gsap !== 'undefined' &&
                typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hasGSAP) root.classList.add('no-motion');

  /* ═══ countdown ══════════════════════════════════════════ */

  (function countdown() {
    var cells = {
      d: document.querySelector('[data-cd="d"]'),
      h: document.querySelector('[data-cd="h"]'),
      m: document.querySelector('[data-cd="m"]'),
      s: document.querySelector('[data-cd="s"]')
    };
    if (!cells.d) return;

    var target = new Date(CONTENT.countdownTo).getTime();
    var pad = function (n) { return String(n).padStart(2, '0'); };

    function tick() {
      var left = Math.max(0, target - Date.now());
      var secs = Math.floor(left / 1000);
      cells.d.textContent = pad(Math.floor(secs / 86400));
      cells.h.textContent = pad(Math.floor(secs / 3600) % 24);
      cells.m.textContent = pad(Math.floor(secs / 60) % 60);
      cells.s.textContent = pad(secs % 60);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ═══ music — silent until the visitor asks for it ═══════ */

  (function music() {
    var btn = document.querySelector('.sound');
    var audio = document.getElementById('track');
    if (!btn || !audio) return;

    audio.volume = 0;

    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') === 'true';
      if (on) {
        audio.pause();
        btn.setAttribute('aria-pressed', 'false');
        return;
      }
      audio.play().then(function () {
        btn.setAttribute('aria-pressed', 'true');
        // ease the volume up rather than slamming it on
        var v = 0;
        var fade = setInterval(function () {
          v = Math.min(0.6, v + 0.03);
          audio.volume = v;
          if (v >= 0.6) clearInterval(fade);
        }, 60);
      }).catch(function () {
        btn.setAttribute('aria-pressed', 'false');
      });
    });
  })();

  /* ═══ chapter rail — the site's only navigation ══════════ */

  (function rail() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.rail__list a'));
    var label = document.querySelector('[data-rail-label]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var ratios = new Map();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { ratios.set(e.target.id, e.intersectionRatio); });

      var bestId = null, best = 0;
      ratios.forEach(function (r, id) { if (r > best) { best = r; bestId = id; } });
      if (!bestId) return;

      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + bestId;
        if (on) {
          a.setAttribute('aria-current', 'true');
          if (label) label.textContent = a.dataset.rail;
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }, { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] });

    links.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec) io.observe(sec);
    });
  })();

  /* ═══ everything past this point is motion only ══════════ */

  if (!hasGSAP || reduced) return;

  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = typeof window.SplitText !== 'undefined';
  if (hasSplit) gsap.registerPlugin(SplitText);

  var mm = gsap.matchMedia();

  /* ── 00 · cold open ─────────────────────────────────────── */

  (function coldOpen() {
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.from('.open__eyebrow .rule', { scaleX: 0, duration: 0.9, ease: 'expo.out' })
      .from('.open__eyebrow', { opacity: 0, duration: 0.5 }, 0.2);

    if (hasSplit) {
      document.querySelectorAll('.open__names .split').forEach(function (el, i) {
        var split = new SplitText(el, { type: 'chars' });
        tl.from(split.chars, {
          opacity: 0, yPercent: 60, rotateX: -40,
          duration: 0.7, stagger: 0.015, ease: 'expo.out'
        }, 0.35 + i * 0.18);
      });
      tl.from('.open__names .amp', { opacity: 0, scale: 0.7, duration: 0.6 }, 0.7);
    } else {
      tl.from('.open__names', { opacity: 0, y: 28, duration: 0.9 }, 0.35);
    }

    tl.from('.open__date', { opacity: 0, y: 14, duration: 0.6 }, 0.95)
      .from('.cue', { opacity: 0, duration: 0.6 }, 1.2);

    gsap.to('.cue__line', {
      scaleY: 0.35, transformOrigin: 'top center',
      duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
  })();

  /* ── letterbox bars close in once the film starts ───────── */

  ScrollTrigger.create({
    trigger: '#open',
    start: 'bottom 80%',
    onEnter: function () { root.style.setProperty('--barh', '3.2vh'); },
    onLeaveBack: function () { root.style.setProperty('--barh', '0px'); }
  });

  /* ── 01 · invitation parallax ───────────────────────────── */

  gsap.to('.invite__media', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.invite', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  gsap.from('.invite__body > *', {
    opacity: 0, y: 24, duration: 0.6, stagger: 0.08, ease: 'power2.out',
    scrollTrigger: { trigger: '.invite__body', start: 'top 80%' }
  });

  /* ── 02 · the two, closing the gap ──────────────────────── */

  mm.add('(min-width: 900px)', function () {
    gsap.from('.who--l', {
      xPercent: -12, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.couple', start: 'top 75%', end: 'center center', scrub: 1 }
    });
    gsap.from('.who--r', {
      xPercent: 12, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.couple', start: 'top 75%', end: 'center center', scrub: 1 }
    });
    gsap.from('.couple__seam', {
      scaleY: 0, transformOrigin: 'center', duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '.couple', start: 'top 60%' }
    });
  });

  mm.add('(max-width: 899px)', function () {
    gsap.utils.toArray('.who').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.55, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  });

  /* ── 03 · three days — the mobile chapter ────────────────
     Scroll drives a slider: one event per screen, photograph
     at full slide height, panned sideways while the section
     is pinned. Desktop never renders this section at all.
     ───────────────────────────────────────────────────── */

  mm.add('(max-width: 899px)', function () {
    var section  = document.querySelector('.days');
    var track    = document.querySelector('.days__track');
    var viewport = document.querySelector('.days__viewport');
    var progress = document.querySelector('.days__progress span');
    var counter  = document.querySelector('[data-ev-idx]');
    var pips     = gsap.utils.toArray('.days__pips li');
    var slides   = gsap.utils.toArray('.ev');
    if (!section || !track || !viewport || !slides.length) return;

    var distance = function () {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    };

    var current = -1;
    function mark(i) {
      if (i === current) return;
      current = i;
      if (counter) counter.textContent = i + 1;
      var day = slides[i].dataset.day;
      pips.forEach(function (p) {
        p.classList.toggle('is-on', p.dataset.pip === day);
      });
    }

    var pan = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        // roughly three quarters of a screen of scroll per slide
        end: function () { return '+=' + (slides.length * window.innerHeight * 0.75); },
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (progress) gsap.set(progress, { scaleX: self.progress });
          mark(Math.min(slides.length - 1, Math.round(self.progress * (slides.length - 1))));
        }
      }
    });
    mark(0);

    // each slide settles as it reaches centre, driven by the pan itself
    slides.forEach(function (slide) {
      gsap.to(slide, {
        opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
        scrollTrigger: {
          trigger: slide,
          containerAnimation: pan,
          start: 'left 92%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    return function () {
      gsap.set(track, { clearProps: 'x' });
      gsap.set(slides, { clearProps: 'opacity,transform' });
    };
  });

  /* ── 04 · ceremonies — the desktop chapter ───────────────
     The scrubbed reel. Mobile never renders this section.
     ───────────────────────────────────────────────────── */

  mm.add('(min-width: 900px)', function () {
    var frames = gsap.utils.toArray('.frame');
    var capName = document.querySelector('[data-cap-name]');
    var capTime = document.querySelector('[data-cap-time]');
    if (!frames.length) return;

    var shown = -1;
    function caption(i) {
      if (i === shown || !frames[i]) return;
      shown = i;
      var f = frames[i];
      gsap.to('.film__caption', {
        opacity: 0, duration: 0.16, ease: 'power2.in',
        onComplete: function () {
          if (capName) capName.textContent = f.dataset.name;
          if (capTime) capTime.textContent = f.dataset.time;
          gsap.to('.film__caption', { opacity: 1, duration: 0.28, ease: 'power2.out' });
        }
      });
    }

    frames.forEach(function (f, i) {
      gsap.set(f, { clipPath: i === 0 ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' });
      gsap.set(f.querySelector('img'), { scale: 1.12 });
    });
    caption(0);

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.film',
        start: 'top top',
        end: '+=' + (frames.length * 62) + '%',
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var i = Math.min(frames.length - 1, Math.floor(self.progress * frames.length));
          caption(i);
        }
      }
    });

    frames.forEach(function (f, i) {
      if (i > 0) {
        tl.to(f, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' }, i - 1);
      }
      // Ken Burns: each frame keeps drifting for the length of its own beat
      tl.to(f.querySelector('img'), { scale: 1, duration: 1.6, ease: 'none' },
            Math.max(0, i - 1.2));
    });

    return function () {
      frames.forEach(function (f) {
        gsap.set(f, { clearProps: 'clipPath' });
        gsap.set(f.querySelector('img'), { clearProps: 'scale' });
      });
    };
  });

  /* ── 05 · venue reveal + drifting motes ─────────────────── */

  gsap.from('.venue__body > *', {
    opacity: 0, y: 20, duration: 0.6, stagger: 0.07, ease: 'power2.out',
    scrollTrigger: { trigger: '.venue', start: 'top 72%' }
  });

  (function motes() {
    var canvas = document.querySelector('.motes');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dots = [];
    var raf = null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      dots = [];
      var n = Math.round(r.width * r.height / 26000);
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (Math.random() * 1.3 + 0.4) * dpr,
          vy: -(Math.random() * 0.18 + 0.04) * dpr,
          vx: (Math.random() - 0.5) * 0.08 * dpr,
          a: Math.random() * 0.35 + 0.08
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y += d.vy; d.x += d.vx;
        if (d.y < -4) { d.y = canvas.height + 4; d.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,169,106,' + d.a + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    size();
    window.addEventListener('resize', function () { size(); }, { passive: true });

    // only burn frames while the venue is actually on screen
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
  })();

  /* ── 06/07 · closing ────────────────────────────────────── */

  gsap.from('.card', {
    opacity: 0, y: 22, duration: 0.5, stagger: 0.06, ease: 'power2.out',
    scrollTrigger: { trigger: '.cards', start: 'top 82%' }
  });

  gsap.to('.end__media', {
    yPercent: -10, ease: 'none',
    scrollTrigger: { trigger: '.end', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  gsap.from('.end__rule', {
    scaleX: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.end', start: 'top 70%' }
  });
  gsap.from('.end__names', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.end', start: 'top 70%' }
  });

  /* ── pinned heights depend on loaded media ──────────────── */

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
