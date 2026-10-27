(() => {
  const destinos = [
    ["Lima","Capital gastronómica del Perú"],["Arequipa","La ciudad blanca"],
    ["Cusco","Capital del Imperio Inca"],["Puerto Maldonado","Puerta de entrada a la Amazonía"],
    ["Puno","Capital folclórica del Perú"],["Juliaca","Centro comercial del altiplano"],
    ["Copacabana","Joya del Lago Titicaca"],["La Paz","Capital administrativa de Bolivia"]
  ];
  const agencias = [
    ["Lima","Av. Paseo de la República 857 (Terminal Cavassa)","978 010 113"],
    ["Arequipa","Terminal Terrestre, Counter A-4","959 924 201"],
    ["Cusco","Terminal Terrestre, Counter 112","984 651 025"],
    ["Puno","Terminal Terrestre, Counter C-10","981 855 314"],
    ["Juliaca","Terminal Terrestre, Counter 5","951 677 751"],
    ["Puerto Maldonado","Terminal Terrestre","715 377 79"],
    ["Copacabana","Av. 16 de Julio S/N","999 227 741"],
    ["La Paz","Terminal Terrestre","981 855 314"]
  ];
  const BASE = "https://www.transzela.com.pe/assets/images/";
  const IMG = {
    hero: ["img/bus.png"],
    why: [BASE + "buses/portada1.webp", BASE + "servicios/10.webp", BASE + "servicios/6.webp", BASE + "servicios/14.webp"],
    destinos: {
      "Lima":"", "Arequipa":"", "Cusco":"", "Puerto Maldonado":"",
      "Puno":"", "Juliaca":"", "Copacabana":"", "La Paz":""
    },
    galeria: [
      [BASE + "servicios/10.webp","Asientos 1er nivel · 160°"],
      [BASE + "servicios/14.webp","Asientos 2do nivel · 180°"],
      [BASE + "servicios/6.webp","Interior premium"],
      [BASE + "servicios/20.webp","Entretenimiento a bordo"]
    ]
  };
  const bg = document.getElementById("hero-bg");
  bg.innerHTML = IMG.hero.map(u => `<div style="background-image:url('${u}')"></div>`).join("");
  const slides = [...bg.children]; let k = 0;
  slides[0].classList.add("on");
  if (slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches)
    setInterval(() => { slides[k].classList.remove("on"); k = (k + 1) % slides.length; slides[k].classList.add("on"); }, 5000);
  document.querySelectorAll("#why-grid img").forEach(im => {
    im.src = IMG.why[im.dataset.k]; im.onerror = () => im.remove();
  });

  document.getElementById("gallery").innerHTML = IMG.galeria.map(([src,t]) =>
    `<figure><img src="${src}" alt="${t}" loading="lazy" onerror="this.closest('figure').hidden=true"><figcaption>${t}</figcaption></figure>`).join("");

  const $ = s => document.querySelector(s);
  const origen = $("#origen"), destino = $("#destino"), msg = $("#msg");

  destinos.forEach(([n]) => {
    origen.add(new Option(n, n)); destino.add(new Option(n, n));
  });
  $("#dest-grid").innerHTML = destinos.map(([n,d]) =>
    `<button type="button" class="dest" data-c="${n}"${IMG.destinos[n] ? ` style="--img:url('${IMG.destinos[n]}')"` : ""}><strong>${n}</strong><span>${d}</span></button>`).join("");
  $("#ag-grid").innerHTML = agencias.map(([c,dir,t]) =>
    `<article><h3>${c}</h3><p>${dir}</p><p>Celular: <a href="tel:${t.replace(/\s/g,"")}">${t}</a></p></article>`).join("");

  const wiki = {"Lima":"Lima","Arequipa":"Arequipa","Cusco":"Cusco","Puerto Maldonado":"Puerto_Maldonado",
    "Puno":"Puno,_Peru","Juliaca":"Juliaca","Copacabana":"Copacabana,_Bolivia","La Paz":"La_Paz"};
  destinos.forEach(([n]) => {
    if (IMG.destinos[n]) return;
    fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + wiki[n])
      .then(r => r.json())
      .then(d => {
        const u = d.thumbnail && d.thumbnail.source.replace(/\/\d+px-/, "/500px-");
        if (u) document.querySelector(`.dest[data-c="${n}"]`).style.setProperty("--img", `url("${u}")`);
      })
      .catch(() => {});
  });

  document.addEventListener("click", e => {
    const b = e.target.closest(".dest"); if (!b) return;
    destino.value = b.dataset.c;
    document.querySelectorAll(".dest").forEach(x => x.classList.toggle("sel", x === b));
    $("#reservar").scrollIntoView({behavior:"smooth", block:"center"});
    destino.focus({preventScroll:true});
  });

  const f = $("#fecha"); f.min = new Date().toISOString().split("T")[0];

  $("#reservar").addEventListener("submit", e => {
    e.preventDefault();
    msg.className = "msg";
    if (!origen.value || !destino.value || !f.value) { msg.textContent = "Completa origen, destino y fecha."; msg.classList.add("err"); return; }
    if (origen.value === destino.value) { msg.textContent = "El origen y el destino deben ser distintos."; msg.classList.add("err"); return; }
    const t = encodeURIComponent(`Hola, quiero un pasaje ${origen.value} → ${destino.value} el ${f.value}.`);
    msg.innerHTML = `Ruta ${origen.value} – ${destino.value} lista. <a href="https://wa.me/51987048942?text=${t}" target="_blank" rel="noopener">Consultar por WhatsApp</a> o llama a la central.`;
    msg.classList.add("ok");
  });

  const burger = $(".burger"), menu = $("#menu");
  burger.addEventListener("click", () => {
    const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
  });
  menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });

  const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
  }), {rootMargin:"-45% 0px -50% 0px"});
  ["inicio","destinos","servicios","corporativo"].forEach(id => io.observe(document.getElementById(id)));
})();