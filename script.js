const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

/* Render Timeline */
function timeline(id, items){
  const ul = $(id);
  items.forEach((it, i) => {
    const li = el("li", i === 0 ? "first" : "");
    li.append(el("span","n",i+1));
    const row = el("div","row");
    const org = el("div","org");
    org.append(el("span","badge-ic",it.ic || "•"), el("span","",it.t));
    row.append(org, el("span","yr",it.y));
    const h = el("h3","",it.s);
    const sm = el("small","",it.sub); sm.append(el("span","tag",it.tag));
    li.append(row,h,sm); ul.append(li);
  });
}
timeline("#edu", DATA.education);
timeline("#exp", DATA.experience);
$("#cP").textContent = DATA.projects.length;
$("#cC").textContent = DATA.certificates.length;
$("#cA").textContent = DATA.awards.length;

/* Reveal only the area around the pointer on the About portrait */
const profilePhoto = $("#profilePhoto");
const profileReveal = profilePhoto && profilePhoto.querySelector(".profile-reveal");
if (profilePhoto && profileReveal){
  profilePhoto.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const rect = profilePhoto.getBoundingClientRect();
    profileReveal.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    profileReveal.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    profilePhoto.classList.add("revealing");
  });
  profilePhoto.addEventListener("pointerleave", () => profilePhoto.classList.remove("revealing"));
}

/* Render Tab & Carousel */
let tab = "projects";
let renderTimer;
let carouselTargetIndex = null;
let carouselResetTimer;
function render(){
  const tr = $("#track");
  clearTimeout(renderTimer);
  clearTimeout(carouselResetTimer);
  carouselTargetIndex = null;
  tr.classList.add("changing");
  $$(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  renderTimer = setTimeout(() => {
    tr.replaceChildren();
    DATA[tab].forEach(it => {
      const c = el("article","card");
      c.style.setProperty("--card-index", tr.children.length);
      const im = el("div","img");
      im.style.background = `linear-gradient(135deg,${it.c},#0b1426)`;
      if (it.img){ const g = el("img"); g.src = it.img; g.alt = it.t; im.append(g); }
      else im.textContent = it.t;

      if (tab !== "projects"){
        const ov = el("a","cert-overlay"); ov.href = it.link || "#";
        ov.append(el("span","cert-pill","👁 View Certificate"));
        im.append(ov);
      }

      const hasProjectUrl = tab === "projects" && /^https?:\/\//i.test(it.link || "");
      const a = el("a","btn",hasProjectUrl ? "Kunjungi Proyek ↗" : "Details →");
      a.href = it.link || "#";
      if (hasProjectUrl){
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      c.append(im, el("h3","",it.t), el("p","",it.d), a);
      tr.append(c);
    });
    tr.scrollTo({left:0, behavior:"instant"});
    requestAnimationFrame(() => requestAnimationFrame(() => tr.classList.remove("changing")));
  }, 160);
}
$$(".tabs button").forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
$$(".folder").forEach(f => f.onclick = () => { tab = f.dataset.tab; render(); smoothJump("#portfolio"); });
function moveCarousel(direction){
  const tr = $("#track"), cards = $$("#track .card");
  if (!cards.length) return;
  const center = tr.getBoundingClientRect().left + tr.clientWidth / 2;
  if (carouselTargetIndex === null){
    carouselTargetIndex = cards.reduce((nearest, card, index) => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const nearestCenter = cards[nearest].getBoundingClientRect().left + cards[nearest].offsetWidth / 2;
      return Math.abs(cardCenter - center) < Math.abs(nearestCenter - center) ? index : nearest;
    }, 0);
  }
  carouselTargetIndex = Math.max(0, Math.min(cards.length - 1, carouselTargetIndex + direction));
  const target = cards[carouselTargetIndex];
  const targetCenter = target.getBoundingClientRect().left + tr.scrollLeft + target.offsetWidth / 2;
  const maxScroll = tr.scrollWidth - tr.clientWidth;
  tr.scrollTo({left:Math.max(0, Math.min(maxScroll, targetCenter - tr.clientWidth / 2)), behavior:"smooth"});
  clearTimeout(carouselResetTimer);
  carouselResetTimer = setTimeout(() => { carouselTargetIndex = null; }, 800);
}
$("#track").addEventListener("scrollend", () => {
  clearTimeout(carouselResetTimer);
  carouselTargetIndex = null;
});
$(".arr.l").onclick = () => moveCarousel(-1);
$(".arr.r").onclick = () => moveCarousel(1);
render();

/* Render Kartu Terowongan Galeri */
const stage = $("#tunnelStage");
DATA.gallery.forEach(g => {
  const card = el("div","t-card");
  const pic = el("div","pic");
  pic.style.background = `linear-gradient(135deg,${g.c},#0f172a)`;
  if (g.img){ const im = el("img"); im.src = g.img; im.alt = g.label; pic.append(im); }
  else pic.textContent = g.label;
  card.append(pic); stage.append(card);
});

/* Pergeseran Halaman Halus Saat Klik Menu Navbar */
function jumpTo(elTarget){
  window.scrollTo({
    top: Math.max(0, elTarget.getBoundingClientRect().top + window.scrollY - 96),
    behavior:"smooth"
  });
}
function smoothJump(targetId){
  const elTarget = $(targetId);
  if (!elTarget) return;
  history.pushState(null, "", targetId);
  moveFace(links.find(link => link.getAttribute("href") === targetId));
  jumpTo(elTarget);
  updateActiveNav();
}
$$(".nav a, .hero .btn[href^='#']").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")){
      e.preventDefault();
      smoothJump(href);
    }
  });
});

/* Navbar Aktif + Karakter Wajah Penunjuk */
const links = $$(".nav a"), face = $(".face");
function moveFace(a){
  if (!a || !face) return;
  const r = a.getBoundingClientRect();
  face.style.left = (r.left + r.width/2) + "px";
  const nb = $(".nav").getBoundingClientRect();
  face.style.top = (nb.top - 18) + "px";
  links.forEach(l => l.classList.toggle("on", l === a));
}
const navSections = ["home","about","portfolio","contact"].map(id => $("#"+id));
function updateActiveNav(){
  const marker = $(".nav").getBoundingClientRect().bottom + 24;
  let active = navSections[0];
  navSections.forEach(section => {
    if (section.getBoundingClientRect().top <= marker) active = section;
  });
  moveFace(links.find(link => link.getAttribute("href") === "#" + active.id));
}
let navUpdateQueued = false;
addEventListener("scroll", () => {
  if (navUpdateQueued) return;
  navUpdateQueued = true;
  requestAnimationFrame(() => {
    navUpdateQueued = false;
    updateActiveNav();
  });
}, {passive:true});
addEventListener("resize", updateActiveNav);
addEventListener("load", updateActiveNav);
addEventListener("popstate", () => {
  const target = $(location.hash || "#home");
  if (target) jumpTo(target);
  updateActiveNav();
});

/* Reveal Elemen Saat Muncul di Layar */
const revObserver = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) e.target.classList.add("in");
}), {threshold:.12});
$$(".reveal").forEach(el => revObserver.observe(el));

/* ====== ANIMASI TRANSISI ANTAR BAGIAN SAAT SCROLL ====== */
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function handleScrollAnimations(){
  const vh = window.innerHeight;

  /* 1. Home: Teks WELCOME TO MY PORTFOLIO membesar & memudar saat masuk ke About */
  const home = $("#home"), wb = $("#welcomeBanner");
  if (home && wb){
    const r = home.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    wb.style.transform = `scale(${1 + p * 0.45}) translateY(${-p * 40}px)`;
    wb.style.opacity = `${1 - p * 1.3}`;
  }

  /* 2. Transisi Zoom-Through "PORTOFOLIO" (Latar Gelap -> Putih Terang) */
  const pw = $("#portalWrap"), pt = $("#portalTitle");
  if (pw && pt){
    const r = pw.getBoundingClientRect();
    const total = r.height - vh;
    if (total > 0){
      const p = clamp(-r.top / total, 0, 1);
      // Teks membesar ekstrem menembus layar (1x -> 14x)
      const scale = 1 + Math.pow(p, 2.2) * 13;
      pt.style.transform = `scale(${scale.toFixed(2)})`;
      pt.style.opacity = p > 0.78 ? `${clamp(1 - (p - 0.78) / 0.22, 0, 1)}` : "1";

      // Interpolasi warna background gelap (#060b17) ke terang (#f4f6fa)
      const cP = clamp((p - 0.35) / 0.45, 0, 1);
      const red = Math.round(6 + (244 - 6) * cP);
      const grn = Math.round(11 + (246 - 11) * cP);
      const blu = Math.round(23 + (250 - 23) * cP);
      pw.style.backgroundColor = `rgb(${red},${grn},${blu})`;
      pt.style.color = cP > 0.5 ? "#101828" : "#f6f7fa";
    }
  }

  /* 3. Transisi Terowongan Galeri Foto (Zoom In Maju ke Layar) */
  const tw = $("#tunnelWrap"), ts = $("#tunnelStage");
  if (tw && ts){
    const r = tw.getBoundingClientRect();
    const total = r.height - vh;
    if (total > 0){
      const p = clamp(-r.top / total, 0, 1);
      const scale = 0.72 + p * 0.65;
      const opacity = p < 0.15 ? p / 0.15 : (p > 0.8 ? (1 - p) / 0.2 : 1);
      ts.style.transform = `scale(${scale.toFixed(3)})`;
      ts.style.opacity = `${clamp(opacity, 0, 1)}`;
    }
  }

}
addEventListener("scroll", handleScrollAnimations, {passive:true});
handleScrollAnimations();

/* Form Pesan */
$("#msgForm").onsubmit = e => {
  e.preventDefault();
  alert("Pesan terkirim (demo). Sambungkan ke Formspree/EmailJS agar masuk ke emailmu.");
  e.target.reset();
};

/* Komentar */
const comments = [
  {n:"Zahra", t:"Izin buat jadi referensi ya kak!", d:new Date(), a:null},
  {n:"Laurelia", t:"Keren banget desain portofolionya!", d:new Date(), a:null}
];
function showComments(){
  const box = $("#cms"); box.replaceChildren(); $("#cc").textContent = comments.length;
  comments.forEach(c => {
    const d = el("div","cm"), top = el("div","top");
    const who = el("strong");
    if (c.a){
      const im = el("img","av"); im.src = c.a; who.append(im);
    } else {
      const av = el("span","av",c.n.charAt(0).toUpperCase()); who.append(av);
    }
    who.append(c.n);
    top.append(who, el("time","",c.d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})));
    d.append(top, el("p","",c.t)); box.append(d);
  });
}
$("#cmForm").onsubmit = e => {
  e.preventDefault();
  const f = $("#p2").files[0];
  if (f && f.size > 5*1024*1024) return alert("Ukuran foto maksimal 5MB.");
  const add = a => { comments.unshift({n:$("#n2").value.trim(), t:$("#c2").value.trim(), d:new Date(), a}); showComments(); e.target.reset(); };
  if (f){ const r = new FileReader(); r.onload = () => add(r.result); r.readAsDataURL(f); } else add(null);
};
showComments();