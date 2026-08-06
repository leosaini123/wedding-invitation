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
  const target = new Date(2026, 10, 22, 13, 0, 0).getTime();
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

  /* ---------- background music: auto-starts on first interaction, loops,
                and keeps playing until the user stops it with the button ---------- */
  const bgm = $("#bgm"), audioBtn = $("#audioBtn");
  if (bgm && audioBtn) {
    bgm.loop = true;
    bgm.volume = 0.55;
    bgm.muted = false;                       // we want actual sound, never silent playback
    let userStopped = false;                 // becomes true only on a manual stop

    // keep the button icon in sync with what the audio is really doing
    const sync = () => {
      const playing = !bgm.paused && !bgm.muted;
      audioBtn.classList.toggle("muted", !playing);
      audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    };
    bgm.addEventListener("play", sync);
    bgm.addEventListener("pause", sync);

    const start = () => { if (userStopped) return; const p = bgm.play(); if (p && p.catch) p.catch(() => {}); };

    // 1) attempt real autoplay immediately — works for returning visitors / permissive browsers
    start(); sync();
    bgm.addEventListener("canplay", start, { once: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });

    // 2) otherwise begin the instant the visitor does ANYTHING (browsers require one gesture for sound)
    const gestureEvents = ["pointerdown", "mousedown", "click", "keydown", "touchstart", "touchend", "scroll", "wheel", "mousemove"];
    const cleanup = () => gestureEvents.forEach((ev) => document.removeEventListener(ev, kick, true));
    function kick(e) {
      if (e && e.target && e.target.closest && e.target.closest("#audioBtn")) return; // button handles itself
      start();
      if (!bgm.paused && !bgm.muted) cleanup();
    }
    gestureEvents.forEach((ev) => document.addEventListener(ev, kick, true));

    // the button is the ONLY manual control: stop if playing, resume if stopped (single click)
    audioBtn.addEventListener("click", () => {
      if (bgm.paused || bgm.muted) {
        userStopped = false; bgm.muted = false;
        const p = bgm.play(); if (p && p.catch) p.catch(() => {});
      } else {
        userStopped = true; bgm.pause();
      }
      sync();
    });
  }

  /* ============================================================
     CELEBRATION — intro cover · garlands · petals · confetti
     ============================================================ */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const rnd = (a, b) => a + Math.random() * (b - a);
  function useSvg(id, size) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 100 100");
    s.style.width = s.style.height = size + "px";
    const u = document.createElementNS(NS, "use");
    u.setAttribute("href", "#" + id);
    s.appendChild(u);
    return s;
  }

  // hanging marigold garlands
  function buildGarland(el) {
    if (!el) return;
    const n = Math.max(8, Math.floor(window.innerWidth / 64));
    el.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const hang = document.createElement("div"); hang.className = "hang";
      const thread = document.createElement("div"); thread.className = "thread"; thread.style.height = rnd(8, 30) + "px";
      const m = useSvg("marigold", rnd(22, 32)); m.classList.add("mari");
      hang.appendChild(thread); hang.appendChild(m);
      hang.style.animationDuration = rnd(3, 5.5) + "s";
      hang.style.animationDelay = (-rnd(0, 4)) + "s";
      el.appendChild(hang);
    }
  }
  buildGarland($("#heroGarland"));
  buildGarland($("#introGarland"));

  // ambient falling petals (marigold + rose)
  const petalLayer = $("#petals");
  let petalTimer = null;
  function spawnPetal() {
    if (!petalLayer) return;
    const mari = Math.random() > 0.5;
    const el = useSvg(mari ? "marigold" : "rose", mari ? rnd(16, 28) : rnd(12, 20));
    el.classList.add("petal");
    el.style.left = rnd(0, 100) + "vw";
    el.style.setProperty("--dx", rnd(-70, 70) + "px");
    el.style.animationDuration = rnd(7, 13) + "s";
    el.style.opacity = rnd(0.5, 0.95);
    petalLayer.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }
  function startPetals() {
    if (reduce || petalTimer) return;
    for (let i = 0; i < 12; i++) setTimeout(spawnPetal, i * 280);
    petalTimer = setInterval(spawnPetal, 850);
  }

  // confetti + petal burst
  const CONF = ["#f4a52a", "#e5679a", "#e6c25a", "#2f6553", "#c1121f"];
  function burst(x, y, n) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      let el;
      if (i % 3 === 0) {
        el = useSvg(Math.random() > 0.5 ? "marigold" : "rose", rnd(12, 22));
      } else {
        el = document.createElement("span");
        el.style.width = rnd(7, 12) + "px"; el.style.height = rnd(9, 15) + "px";
        el.style.background = CONF[i % CONF.length]; el.style.borderRadius = "2px";
      }
      el.classList.add("burst");
      el.style.position = "fixed"; el.style.left = x + "px"; el.style.top = y + "px";
      const a = rnd(0, Math.PI * 2), d = rnd(70, 230);
      el.style.setProperty("--bx", Math.cos(a) * d + "px");
      el.style.setProperty("--by", (Math.sin(a) * d - 30) + "px");
      el.style.setProperty("--br", rnd(-360, 360) + "deg");
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  /* ---------- languages: English / हिन्दी / ਪੰਜਾਬੀ ---------- */
  const T = {
    en: {
      names: 'Lovepreet <span class="amp">&amp;</span> Arohi',
      introDate: "22 – 25 November 2026 · Amritsar",
      eyebrow: "The Wedding Celebration Of",
      heroDate: "Sunday 22<sup>nd</sup> to Wednesday 25<sup>th</sup> November, 2026",
      place: "The Royal Garden Palace · Amritsar, Punjab",
      viewSchedule: "View the Schedule",
      inviteTitle: "An Invitation",
      lede: "Together with their families, <strong>Lovepreet</strong> and <strong>Arohi</strong> warmly invite you to celebrate their wedding — a joyful union of Punjabi and Hindu traditions. Your presence would make our happiest days complete.",
      signoff: "With love &amp; anticipation,<br />Lovepreet &amp; Arohi",
      celebTitle: "The Celebrations", celebSub: "Days of joyful festivities",
      day1: "Day One", day1date: "Sunday, 22 November", day2: "Day Two", day2date: "Monday, 23 November", day3: "Day Three", day3date: "Wednesday, 25 November",
      haldiTime: "1:00 PM", haldiName: "Haldi", haldiDesc: "A joyful turmeric ceremony to bless the couple with a golden glow — laughter, colour and love to begin it all.", haldiAttire: "Attire — Shades of yellow",
      mehndiTime: "5:00 PM", mehndiName: "Mehndi", mehndiDesc: "Intricate henna, folk songs and easy evening cheer as the bride's hands are adorned with tradition and beauty.", mehndiAttire: "Attire — Greens &amp; vibrant hues",
      carnivalTime: "10:00 AM", carnivalName: "Haldi Carnival", carnivalDesc: "A playful carnival twist on haldi — music, colours, games and food stalls for a morning of pure fun.", carnivalAttire: "Attire — Bright &amp; comfy",
      jaggoTime: "6:00 PM", jaggoName: "Jaggo", jaggoDesc: "A lively Punjabi tradition — decorated gaggars aglow with lamps, boliyan, dhol and dancing into the night.", jaggoAttire: "Attire — Festive Indian",
      sangeetTime: "7:00 PM", sangeetName: "Sangeet", sangeetDesc: "An evening of music, choreographed performances and a dance floor for both families to celebrate as one.", sangeetAttire: "Attire — Indo-Western glam",
      vidaiTime: "Afternoon <em>· time to be confirmed</em>", vidaiName: "Vidai", vidaiDesc: "A heartfelt farewell as Arohi begins her new journey — blessings, happy tears and warm goodbyes.", vidaiAttire: "Attire — Traditional",
      note: "A few timings are still being finalised and will be updated here soon.",
      countTitle: "Counting Down", days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds", countNote: 'Until we say "I do"',
      venueTitle: "The Venue", venueName: "The Royal Garden Palace", venueAddr: "Grand Trunk Road, Amritsar<br />Punjab 143001, India", venueSub: "Valet parking · Wheelchair accessible", viewMap: "View on map →",
      coordTitle: "Event Coordinators", coordSub: "For anything you need during the celebrations, our coordinators are here to help",
      role1: "Haldi &amp; Mehndi", role2: "Haldi Carnival", role3: "Jaggo &amp; Sangeet", role4: "Vidai", role5: "Guest Hospitality", role6: "Stay &amp; Travel", call: "Call",
      rsvpTitle: "Kindly RSVP", rsvpSub: "We would be grateful for your response by <strong>10 November 2026</strong>", rsvpCall: "Call &nbsp;·&nbsp; +91 98765 43210", email: "Email",
      footDate: "22 – 25 November 2026 · Amritsar", footFam: "Daughter of Mr. &amp; Mrs. Sharma · Son of S. &amp; Smt. Gill", footThanks: "We can't wait to celebrate with you.", backTop: "Back to top ↑",
    },
    hi: {
      names: 'लवप्रीत <span class="amp">&amp;</span> आरोही',
      introDate: "22 – 25 नवम्बर 2026 · अमृतसर",
      eyebrow: "विवाह समारोह",
      heroDate: "रविवार 22 से बुधवार 25 नवम्बर, 2026",
      place: "द रॉयल गार्डन पैलेस · अमृतसर, पंजाब",
      viewSchedule: "कार्यक्रम देखें",
      inviteTitle: "निमंत्रण",
      lede: "अपने परिवारों सहित, <strong>लवप्रीत</strong> और <strong>आरोही</strong> आपको अपने विवाह में सादर आमंत्रित करते हैं — पंजाबी और हिन्दू परम्पराओं का आनंदमय संगम। आपकी उपस्थिति हमारे इन ख़ुशी के दिनों को पूर्ण कर देगी।",
      signoff: "प्रेम व प्रतीक्षा सहित,<br />लवप्रीत और आरोही",
      celebTitle: "समारोह", celebSub: "उत्सव के आनंदमय दिन",
      day1: "पहला दिन", day1date: "रविवार, 22 नवम्बर", day2: "दूसरा दिन", day2date: "सोमवार, 23 नवम्बर", day3: "तीसरा दिन", day3date: "बुधवार, 25 नवम्बर",
      haldiTime: "दोपहर 1:00", haldiName: "हल्दी", haldiDesc: "जोड़े को सुनहरी आभा का आशीर्वाद देती एक आनंदमय हल्दी रस्म — हँसी, रंग और प्रेम से आरंभ।", haldiAttire: "परिधान — पीले रंग",
      mehndiTime: "शाम 5:00", mehndiName: "मेहंदी", mehndiDesc: "बारीक मेहंदी, लोकगीत और सुहानी शाम, जब दुल्हन के हाथ परम्परा और सुंदरता से सजते हैं।", mehndiAttire: "परिधान — हरे व चटख रंग",
      carnivalTime: "प्रातः 10:00", carnivalName: "हल्दी कार्निवल", carnivalDesc: "हल्दी का मज़ेदार कार्निवल रूप — संगीत, रंग, खेल और खाने के स्टॉल के साथ आनंदमय सुबह।", carnivalAttire: "परिधान — चटख व आरामदायक",
      jaggoTime: "शाम 6:00", jaggoName: "जागो", jaggoDesc: "एक जीवंत पंजाबी परम्परा — दीपों से सजे घड़े, बोलियाँ, ढोल और देर रात तक नृत्य।", jaggoAttire: "परिधान — उत्सवी भारतीय",
      sangeetTime: "शाम 7:00", sangeetName: "संगीत", sangeetDesc: "संगीत, प्रस्तुतियों और नृत्य की एक शाम, जब दोनों परिवार एक साथ जश्न मनाते हैं।", sangeetAttire: "परिधान — इंडो-वेस्टर्न",
      vidaiTime: "अपराह्न <em>· समय शीघ्र</em>", vidaiName: "विदाई", vidaiDesc: "आरोही की नई यात्रा के आरंभ पर एक भावुक विदाई — आशीर्वाद, ख़ुशी के आँसू और स्नेहभरी विदा।", vidaiAttire: "परिधान — पारम्परिक",
      note: "कुछ समय अभी निर्धारित किए जा रहे हैं और शीघ्र ही यहाँ अपडेट होंगे।",
      countTitle: "प्रतीक्षा", days: "दिन", hours: "घंटे", minutes: "मिनट", seconds: "सेकंड", countNote: "जब तक हम एक न हो जाएँ",
      venueTitle: "स्थान", venueName: "द रॉयल गार्डन पैलेस", venueAddr: "ग्रैंड ट्रंक रोड, अमृतसर<br />पंजाब 143001, भारत", venueSub: "वैले पार्किंग · व्हीलचेयर सुलभ", viewMap: "मानचित्र देखें →",
      coordTitle: "समारोह समन्वयक", coordSub: "समारोह के दौरान किसी भी सहायता हेतु, हमारे समन्वयक आपकी सेवा में हैं",
      role1: "हल्दी व मेहंदी", role2: "हल्दी कार्निवल", role3: "जागो व संगीत", role4: "विदाई", role5: "अतिथि सत्कार", role6: "आवास व यात्रा", call: "कॉल",
      rsvpTitle: "कृपया उत्तर दें", rsvpSub: "कृपया <strong>10 नवम्बर 2026</strong> तक अपनी स्वीकृति दें", rsvpCall: "कॉल &nbsp;·&nbsp; +91 98765 43210", email: "ईमेल",
      footDate: "22 – 25 नवम्बर 2026 · अमृतसर", footFam: "श्री व श्रीमती शर्मा की पुत्री · स. व श्रीमती गिल के पुत्र", footThanks: "हम आपके साथ उत्सव मनाने के लिए उत्सुक हैं।", backTop: "ऊपर जाएँ ↑",
    },
    pa: {
      names: 'ਲਵਪ੍ਰੀਤ <span class="amp">&amp;</span> ਆਰੋਹੀ',
      introDate: "22 – 25 ਨਵੰਬਰ 2026 · ਅੰਮ੍ਰਿਤਸਰ",
      eyebrow: "ਵਿਆਹ ਦਾ ਜਸ਼ਨ",
      heroDate: "ਐਤਵਾਰ 22 ਤੋਂ ਬੁੱਧਵਾਰ 25 ਨਵੰਬਰ, 2026",
      place: "ਦ ਰਾਇਲ ਗਾਰਡਨ ਪੈਲੇਸ · ਅੰਮ੍ਰਿਤਸਰ, ਪੰਜਾਬ",
      viewSchedule: "ਪ੍ਰੋਗਰਾਮ ਵੇਖੋ",
      inviteTitle: "ਸੱਦਾ",
      lede: "ਆਪਣੇ ਪਰਿਵਾਰਾਂ ਸਮੇਤ, <strong>ਲਵਪ੍ਰੀਤ</strong> ਅਤੇ <strong>ਆਰੋਹੀ</strong> ਤੁਹਾਨੂੰ ਆਪਣੇ ਵਿਆਹ ਵਿੱਚ ਸਨੇਹ ਨਾਲ ਸੱਦਾ ਦਿੰਦੇ ਹਨ — ਪੰਜਾਬੀ ਤੇ ਹਿੰਦੂ ਰਵਾਇਤਾਂ ਦਾ ਖ਼ੁਸ਼ੀ ਭਰਿਆ ਮੇਲ। ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਸਾਡੇ ਇਹਨਾਂ ਖ਼ੁਸ਼ੀ ਦੇ ਦਿਨਾਂ ਨੂੰ ਮੁਕੰਮਲ ਕਰੇਗੀ।",
      signoff: "ਪਿਆਰ ਤੇ ਉਡੀਕ ਸਹਿਤ,<br />ਲਵਪ੍ਰੀਤ ਤੇ ਆਰੋਹੀ",
      celebTitle: "ਜਸ਼ਨ", celebSub: "ਜਸ਼ਨ ਦੇ ਖ਼ੁਸ਼ੀ ਭਰੇ ਦਿਨ",
      day1: "ਪਹਿਲਾ ਦਿਨ", day1date: "ਐਤਵਾਰ, 22 ਨਵੰਬਰ", day2: "ਦੂਜਾ ਦਿਨ", day2date: "ਸੋਮਵਾਰ, 23 ਨਵੰਬਰ", day3: "ਤੀਜਾ ਦਿਨ", day3date: "ਬੁੱਧਵਾਰ, 25 ਨਵੰਬਰ",
      haldiTime: "ਦੁਪਹਿਰ 1:00", haldiName: "ਹਲਦੀ", haldiDesc: "ਜੋੜੇ ਨੂੰ ਸੁਨਹਿਰੀ ਭਾਹ ਦੀ ਅਸੀਸ ਦਿੰਦੀ ਇੱਕ ਖ਼ੁਸ਼ੀ ਭਰੀ ਹਲਦੀ ਰਸਮ — ਹਾਸਾ, ਰੰਗ ਤੇ ਪਿਆਰ ਨਾਲ ਸ਼ੁਰੂਆਤ।", haldiAttire: "ਪਹਿਰਾਵਾ — ਪੀਲੇ ਰੰਗ",
      mehndiTime: "ਸ਼ਾਮ 5:00", mehndiName: "ਮਹਿੰਦੀ", mehndiDesc: "ਬਾਰੀਕ ਮਹਿੰਦੀ, ਲੋਕ-ਗੀਤ ਤੇ ਸੁਹਾਵਣੀ ਸ਼ਾਮ, ਜਦੋਂ ਲਾੜੀ ਦੇ ਹੱਥ ਰਵਾਇਤ ਤੇ ਸੁੰਦਰਤਾ ਨਾਲ ਸਜਦੇ ਹਨ।", mehndiAttire: "ਪਹਿਰਾਵਾ — ਹਰੇ ਤੇ ਚਮਕੀਲੇ ਰੰਗ",
      carnivalTime: "ਸਵੇਰੇ 10:00", carnivalName: "ਹਲਦੀ ਕਾਰਨੀਵਲ", carnivalDesc: "ਹਲਦੀ ਦਾ ਮਜ਼ੇਦਾਰ ਕਾਰਨੀਵਲ ਰੂਪ — ਸੰਗੀਤ, ਰੰਗ, ਖੇਡਾਂ ਤੇ ਖਾਣੇ ਦੇ ਸਟਾਲਾਂ ਨਾਲ ਖ਼ੁਸ਼ੀ ਭਰੀ ਸਵੇਰ।", carnivalAttire: "ਪਹਿਰਾਵਾ — ਚਮਕੀਲਾ ਤੇ ਆਰਾਮਦਾਇਕ",
      jaggoTime: "ਸ਼ਾਮ 6:00", jaggoName: "ਜਾਗੋ", jaggoDesc: "ਇੱਕ ਜੀਵੰਤ ਪੰਜਾਬੀ ਰਵਾਇਤ — ਦੀਵਿਆਂ ਨਾਲ ਸਜੇ ਗਾਗਰ, ਬੋਲੀਆਂ, ਢੋਲ ਤੇ ਰਾਤ ਤੱਕ ਨੱਚਣਾ।", jaggoAttire: "ਪਹਿਰਾਵਾ — ਤਿਉਹਾਰੀ ਭਾਰਤੀ",
      sangeetTime: "ਸ਼ਾਮ 7:00", sangeetName: "ਸੰਗੀਤ", sangeetDesc: "ਸੰਗੀਤ, ਪੇਸ਼ਕਾਰੀਆਂ ਤੇ ਨੱਚਣ ਦੀ ਇੱਕ ਸ਼ਾਮ, ਜਦੋਂ ਦੋਵੇਂ ਪਰਿਵਾਰ ਇਕੱਠੇ ਜਸ਼ਨ ਮਨਾਉਂਦੇ ਹਨ।", sangeetAttire: "ਪਹਿਰਾਵਾ — ਇੰਡੋ-ਵੈਸਟਰਨ",
      vidaiTime: "ਦੁਪਹਿਰ ਬਾਅਦ <em>· ਸਮਾਂ ਬਾਅਦ ਵਿੱਚ</em>", vidaiName: "ਵਿਦਾਈ", vidaiDesc: "ਆਰੋਹੀ ਦੇ ਨਵੇਂ ਸਫ਼ਰ ਦੀ ਸ਼ੁਰੂਆਤ 'ਤੇ ਇੱਕ ਭਾਵੁਕ ਵਿਦਾਈ — ਅਸੀਸਾਂ, ਖ਼ੁਸ਼ੀ ਦੇ ਹੰਝੂ ਤੇ ਨਿੱਘੀ ਵਿਦਾ।", vidaiAttire: "ਪਹਿਰਾਵਾ — ਰਵਾਇਤੀ",
      note: "ਕੁਝ ਸਮੇਂ ਹਾਲੇ ਤੈਅ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ ਤੇ ਜਲਦੀ ਇੱਥੇ ਅਪਡੇਟ ਹੋਣਗੇ।",
      countTitle: "ਉਡੀਕ", days: "ਦਿਨ", hours: "ਘੰਟੇ", minutes: "ਮਿੰਟ", seconds: "ਸਕਿੰਟ", countNote: "ਜਦੋਂ ਤੱਕ ਅਸੀਂ ਇੱਕ ਨਾ ਹੋ ਜਾਈਏ",
      venueTitle: "ਸਥਾਨ", venueName: "ਦ ਰਾਇਲ ਗਾਰਡਨ ਪੈਲੇਸ", venueAddr: "ਗ੍ਰੈਂਡ ਟਰੰਕ ਰੋਡ, ਅੰਮ੍ਰਿਤਸਰ<br />ਪੰਜਾਬ 143001, ਭਾਰਤ", venueSub: "ਵੈਲੇ ਪਾਰਕਿੰਗ · ਵ੍ਹੀਲਚੇਅਰ ਪਹੁੰਚਯੋਗ", viewMap: "ਨਕਸ਼ਾ ਵੇਖੋ →",
      coordTitle: "ਸਮਾਗਮ ਪ੍ਰਬੰਧਕ", coordSub: "ਜਸ਼ਨ ਦੌਰਾਨ ਕਿਸੇ ਵੀ ਮਦਦ ਲਈ, ਸਾਡੇ ਪ੍ਰਬੰਧਕ ਤੁਹਾਡੀ ਸੇਵਾ ਵਿੱਚ ਹਨ",
      role1: "ਹਲਦੀ ਤੇ ਮਹਿੰਦੀ", role2: "ਹਲਦੀ ਕਾਰਨੀਵਲ", role3: "ਜਾਗੋ ਤੇ ਸੰਗੀਤ", role4: "ਵਿਦਾਈ", role5: "ਮਹਿਮਾਨ ਸੇਵਾ", role6: "ਰਿਹਾਇਸ਼ ਤੇ ਸਫ਼ਰ", call: "ਕਾਲ",
      rsvpTitle: "ਕਿਰਪਾ ਕਰਕੇ ਜਵਾਬ ਦਿਓ", rsvpSub: "ਕਿਰਪਾ ਕਰਕੇ <strong>10 ਨਵੰਬਰ 2026</strong> ਤੱਕ ਆਪਣਾ ਜਵਾਬ ਦਿਓ", rsvpCall: "ਕਾਲ &nbsp;·&nbsp; +91 98765 43210", email: "ਈਮੇਲ",
      footDate: "22 – 25 ਨਵੰਬਰ 2026 · ਅੰਮ੍ਰਿਤਸਰ", footFam: "ਸ਼੍ਰੀ ਤੇ ਸ਼੍ਰੀਮਤੀ ਸ਼ਰਮਾ ਦੀ ਧੀ · ਸ. ਤੇ ਸ਼੍ਰੀਮਤੀ ਗਿੱਲ ਦੇ ਪੁੱਤਰ", footThanks: "ਅਸੀਂ ਤੁਹਾਡੇ ਨਾਲ ਜਸ਼ਨ ਮਨਾਉਣ ਲਈ ਬੇਤਾਬ ਹਾਂ।", backTop: "ਉੱਪਰ ਜਾਓ ↑",
    },
  };
  function applyLang(lang) {
    if (!T[lang]) lang = "en";
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = T[lang][el.getAttribute("data-i18n")];
      if (v != null) el.innerHTML = v;
    });
    $$("#langSwitch button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }
  applyLang("en");
  $$("#langSwitch button").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  // intro / language cover — choosing a language also starts the music (real gesture)
  const intro = $("#intro");
  const langPicks = $$(".lang-pick");
  if (intro && langPicks.length) {
    document.body.classList.add("locked");
    let opened = false;
    const openIntro = () => {
      if (opened) return; opened = true;
      if (bgm) { bgm.muted = false; const p = bgm.play(); if (p && p.catch) p.catch(() => {}); }
      burst(window.innerWidth / 2, window.innerHeight * 0.42, 40);
      intro.classList.add("open");
      document.body.classList.remove("locked");
      startPetals();
      setTimeout(() => { intro.style.display = "none"; }, 1000);
    };
    langPicks.forEach((b) => b.addEventListener("click", () => { applyLang(b.dataset.lang); openIntro(); }));
  } else {
    startPetals();
  }

  // little burst when tapping a contact / RSVP link
  $$(".rsvp-links a, .coord-links a").forEach((a) => {
    a.addEventListener("click", (e) => burst(e.clientX || window.innerWidth / 2, e.clientY || 40, 16));
  });

  // rebuild garlands on resize
  let gt;
  window.addEventListener("resize", () => {
    clearTimeout(gt);
    gt = setTimeout(() => { buildGarland($("#heroGarland")); buildGarland($("#introGarland")); }, 300);
  });
})();
