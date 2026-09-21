(function () {
  const path = location.pathname.split("/").pop() || "index.html";
  const header = `
    <header class="topbar">
      <div class="wrap nav">
        <a class="brand" href="index.html">
          <img src="assets/logo_isep.jpg" alt="Logo ISEP N° 8232">
          <div class="brand-text">
            <strong>ISEP N° 8232</strong>
            <span>Instituto Superior de<br>Educación Profesional</span>
          </div>
        </a>
        <button class="hamburger" id="menuBtn" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">☰</button>
        <nav class="menu" id="menu">
          <a href="index.html" data-page="index.html">Inicio</a>
          <a href="carreras.html" data-page="carreras.html">Carreras</a>
          <a href="inscripciones.html" data-page="inscripciones.html">Inscripciones</a>
          <a href="institucion.html" data-page="institucion.html">Institución</a>
          <a href="contacto.html" data-page="contacto.html">Contacto</a>
        </nav>
        <a class="btn btn-orange" href="inscripciones.html">Quiero inscribirme</a>
      </div>
    </header>`;

  const footer = `
    <footer class="footer">
      <div class="wrap footer-grid">
        <div class="footer-brand">
          <img src="assets/logo_isep.jpg" alt="ISEP">
          <div>
            <strong>ISEP N° 8232</strong>
            <span>Instituto Superior de Educación Profesional</span>
          </div>
        </div>
        <div>📍 Hipólito Yrigoyen 686 (Escuela Técnica N° 3134)<br>San Ramón de la Nueva Orán · Salta</div>
        <div>🕐 Lunes a viernes de 19:15 a 23:30 hs<br>✉️ instituto8232@gmail.com</div>
        <div>📘 <a href="https://www.facebook.com/Instituto8232" target="_blank" rel="noopener">facebook.com/Instituto8232</a></div>
      </div>
      <p class="foot-note">Más educación para más oportunidades</p>
      <p class="mini">Instituto de gestión privada · ISEP N° 8232 · <a href="institucion.html">Institución</a> · Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com.</p>
    </footer>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  document.querySelectorAll(".menu a").forEach((a) => {
    const page = a.getAttribute("data-page");
    if (
      path === page ||
      (page === "carreras.html" && path.startsWith("carrera-")) ||
      (page === "inscripciones.html" && path === "ficha.html")
    ) {
      a.classList.add("active");
    }
  });

  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  btn.addEventListener('click',()=>{btn.setAttribute('aria-expanded',String(menu.classList.toggle('open')));});
document.querySelectorAll('.field').forEach((field,i)=>{const label=field.querySelector('label'),inputs=field.querySelectorAll('input,select,textarea');inputs.forEach((input,j)=>{if(!input.id)input.id='campo-'+i+'-'+j;if(label&&inputs.length===1)label.htmlFor=input.id;else if(label)input.setAttribute('aria-label',label.textContent+' '+(input.placeholder||input.id));});});
})();