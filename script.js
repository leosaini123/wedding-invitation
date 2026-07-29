/* ============================================================
   Arjun & Simran — elegant wedding invitation · interactions
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, p = el.parentElement;
      if (p && p.classList.contains("stagger")) {
        const idx = Array.prototype.indexOf.call(p.children, el);
        el.style.transitionDelay = idx * 90 + "ms";
        el.addEventListener("transitionend", () => { el.style.transitionDelay = "0s"; }, { once: true });
      }
      el.classList.add("visible");
      io.unobserve(el);
    });
  }, { threshold: 0.14 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- nav: shrink + active link (nav is optional) ---------- */
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const links = $$(".nav-links a");
  const byId = {};
  links.forEach((a) => { byId[a.getAttribute("href").slice(1)] = a; });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove("active"));
        const a = byId[e.target.id];
        if (a) a.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["invite", "couple", "schedule", "countdown", "venue", "coordinators", "rsvp"].forEach((id) => {
    const s = document.getElementById(id); if (s) spy.observe(s);
  });

  /* ---------- schedule accordion ---------- */
  const slots = $$(".slot");
  function setBody(slot, open) {
    const body = slot.querySelector(".slot-body");
    slot.classList.toggle("open", open);
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  }
  slots.forEach((slot) => {
    const head = slot.querySelector(".slot-head");
    head.addEventListener("click", () => setBody(slot, !slot.classList.contains("open")));
    if (slot.hasAttribute("data-open")) setBody(slot, true);
  });
  // keep open panels sized correctly after resize
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      slots.forEach((slot) => {
        if (slot.classList.contains("open")) {
          const body = slot.querySelector(".slot-body");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    }, 150);
  });

  /* ---------- countdown → 23 Nov 2026, 9:00 AM ---------- */
  const target = new Date(2026, 10, 23, 9, 0, 0).getTime();
  const cd = { d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-mins"), s: $("#cd-secs") };
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, target - Date.now());
    if (cd.d) cd.d.textContent = pad(Math.floor(diff / 86400000));
    if (cd.h) cd.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (cd.m) cd.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (cd.s) {
      cd.s.textContent = pad(Math.floor((diff % 60000) / 1000));
      cd.s.classList.remove("pulse"); void cd.s.offsetWidth; cd.s.classList.add("pulse");
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- venue map link ---------- */
  const mapBtn = $("#mapBtn");
  if (mapBtn) {
    const q = encodeURIComponent("The Royal Garden Palace, Grand Trunk Road, Amritsar, Punjab");
    mapBtn.href = "https://www.google.com/maps/search/?api=1&query=" + q;
  }

  /* ---------- back to top ---------- */
  const toTop = $("#toTop");
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- lightbox (tap a photo to enlarge) ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbClose = $("#lbClose");
  function openLB(src, cap) {
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    lb.classList.add("show"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLB() {
    lb.classList.remove("show"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => { lbImg.src = ""; }, 300);
  }
  $$(".zoom").forEach((z) => {
    z.addEventListener("click", () => {
      const img = z.querySelector("img");
      if (!img || !img.getAttribute("src")) return;   // placeholder only → ignore
      let cap = "";
      const wrap = z.closest(".event, .person");
      if (wrap) { const n = wrap.querySelector(".event-name, .person-name"); if (n) cap = n.textContent.trim(); }
      openLB(img.currentSrc || img.src, cap || img.alt);
    });
  });
  if (lb) {
    lbClose.addEventListener("click", closeLB);
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("show")) closeLB(); });
  }
})();
