const KEY = "isep_preinscriptos_v1";
const ADMIN_KEY = "isep_admin_ok";
const EMAIL_DESTINO = (window.ISEP_CONFIG && window.ISEP_CONFIG.emailInstitucional) || "instituto8232@gmail.com";
const ADMIN_CLAVE = (window.ISEP_CONFIG && window.ISEP_CONFIG.adminClave) || "ISEP8232";

const CARRERAS = {
  inicial: "Profesorado para la Educación Inicial (4 años)",
  primaria: "Profesorado para la Educación Primaria (4 años)",
  terapeutico: "Técnico Superior en Acompañante Terapéutico (3 años)",
  licenciatura: "Licenciatura en Educación Inicial — Ciclo de Complementación Curricular (2 años)",
};

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function saveAll(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}
function uid() {
  return "ISEP-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDate(iso) {
  if (!iso) return "—";
  var p = String(iso).split("-");
  if (p.length !== 3) return iso;
  return p[2] + "/" + p[1] + "/" + p[0];
}
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}
function esc(v) {
  return String(v == null || v === "" ? "—" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mostrarLeyenda(id, texto) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.style.display = "block";
}

function mostrarCartel(titulo, texto) {
  var viejo = document.getElementById("confirmOverlay");
  if (viejo) viejo.remove();
  var overlay = document.createElement("div");
  overlay.id = "confirmOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(43,39,48,.5);display:flex;align-items:center;justify-content:center;padding:20px";
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:22px;max-width:440px;width:100%;padding:28px 24px;text-align:center">' +
    '<div style="width:64px;height:64px;margin:0 auto 12px;border-radius:50%;background:#e8f7f2;color:#14685c;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800">✓</div>' +
    "<h3 style='color:#6b2a56;margin:0 0 8px'>" + titulo + "</h3>" +
    "<p style='color:#6a6570;margin:0 0 16px'>" + texto + "</p>" +
    '<button type="button" id="confirmCerrar" style="background:#e07a3d;color:#fff;border:0;border-radius:999px;padding:12px 22px;font-weight:700;cursor:pointer">Entendido</button>' +
    "</div>";
  document.body.appendChild(overlay);
  overlay.querySelector("#confirmCerrar").onclick = function () {
    overlay.remove();
  };
}

function descargarArchivo(nombre, contenido, tipo) {
  var blob = new Blob([contenido], { type: tipo || "text/html;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function docsTexto(row) {
  var partes = [];
  if (row.docsTitulo) partes.push("Título o constancia");
  if (row.docsSalud) partes.push("Certificado de salud");
  if (row.docsDni) partes.push("DNI ambas caras");
  if (row.docsFotos) partes.push("Dos fotos 4x4");
  if (row.docsFolio) partes.push("Un folio");
  return partes.length ? partes.join(" · ") : "—";
}

function fichaHTML(row) {
  var filas = [
    ["Carrera", row.carreraNombre],
    ["Fecha de la solicitud", formatDate(row.fecha)],
    ["Apellidos", row.apellidos],
    ["Nombres", row.nombres],
    ["Edad", row.edad],
    ["Estado civil", row.estadoCivil],
    ["Sexo", row.sexo],
    ["Documento", (row.tipoDoc || "DNI") + " " + (row.dni || "")],
    ["CUIL", row.cuil],
    ["Nacionalidad", row.nacionalidad],
    ["Lugar de nacimiento", row.lugarNac],
    ["Fecha de nacimiento", formatDate(row.fechaNac)],
    ["¿Trabaja?", row.trabaja]
  ];
  if (row.carrera === "licenciatura") {
    filas.push(
      ["Título de base", row.tituloBase],
      ["Institución que otorgó el título", row.institucionTitulo],
      ["Duración de la carrera previa", row.duracionPrevia ? row.duracionPrevia + " años" : ""],
      ["Horas reloj del plan", row.horasReloj]
    );
  } else {
    filas.push(
      ["Título secundario", row.tituloSec],
      ["Institución que lo expidió", row.institucionSec],
      ["Año de egreso", row.anioEgreso]
    );
  }
  filas.push(
    ["Calle / Avenida", row.calle],
    ["N°", row.numero],
    ["Localidad", row.localidad],
    ["Provincia", row.provincia],
    ["Teléfono", row.telefono],
    ["Celular", row.celular],
    ["Correo electrónico", row.email],
    ["Documentación que acompañará", docsTexto(row)]
  );

  var cuerpo = filas.map(function (f) {
    return "<div class='ficha-row'><span>" + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
  }).join("");

  return (
    "<div class='ficha' id='printable'>" +
    "<div class='ficha-top'>" +
    "<img src='assets/logo_isep.jpg' alt='ISEP' width='72' height='72'>" +
    "<div style='flex:1;text-align:center'>" +
    "<div style='font-size:.75rem;letter-spacing:.12em'>INSTITUTO SUPERIOR DE EDUCACIÓN PROFESIONAL</div>" +
    "<h2>Solicitud de preinscripción</h2>" +
    "<div>ISEP N° 8232 · San Ramón de la Nueva Orán · Salta</div>" +
    "</div>" +
    "<div style='text-align:right;font-size:.85rem'><b>" + esc(row.id) + "</b><div>" + esc(formatDate(row.fecha)) + "</div></div>" +
    "</div>" +
    cuerpo +
    "<p style='margin-top:16px;font-size:.82rem'>Declaro que los datos consignados son verdaderos. Esta solicitud tiene carácter de preinscripción hasta la presentación de la documentación en sede. Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com.</p>" +
    "<div class='ficha-firmas'>" +
    "<div class='firma-linea'>Firma del / de la aspirante<br>Aclaración: " + esc(row.nombres) + " " + esc(row.apellidos) + "<br>DNI: " + esc(row.dni) + "</div>" +
    "<div class='firma-linea'>Aclaración y DNI</div>" +
    "</div>" +
    "<div class='ficha-recibido'>" +
    "<strong>RECIBIDO — uso institucional</strong>" +
    "Fecha de recepción: ____ / ____ / ________ &nbsp;&nbsp; Firma y sello del instituto: ______________________________" +
    "</div>" +
    "</div>"
  );
}

function fichaDescargable(row) {
  return "<!DOCTYPE html><html lang='es-AR'><head><meta charset='UTF-8'><title>Ficha " + esc(row.id) + "</title>" +
    "<style>body{font-family:Arial,sans-serif;color:#222;padding:24px} .ficha{max-width:800px;margin:auto} .ficha-top{display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid #1f3b36;padding-bottom:10px} .ficha-row{display:grid;grid-template-columns:220px 1fr;border-bottom:1px dotted #999;padding:6px 0;font-size:14px} .ficha-firmas{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:40px} .firma-linea{border-top:1px solid #333;padding-top:8px;min-height:86px;font-size:13px} .ficha-recibido{margin-top:28px;border:1px dashed #333;padding:12px;font-size:14px}</style></head><body>" +
    fichaHTML(row).replace("src='assets/logo_isep.jpg'", "src='https://fabiancardozo.github.io/isep8232/assets/logo_isep.jpg'") +
    "<p style='margin-top:18px;font-size:13px'>Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com. También debe imprimirla para presentarla en sede.</p>" +
    "</body></html>";
}

function fillCarreraSelect() {
  var sel = document.getElementById("carrera");
  if (!sel) return;
  var pre = qs("carrera");
  if (pre && CARRERAS[pre]) sel.value = pre;
  toggleLic(sel.value);
  sel.addEventListener("change", function () {
    toggleLic(sel.value);
  });
}

function toggleLic(value) {
  var box = document.getElementById("bloqueLicenciatura");
  var sec = document.getElementById("bloqueSecundario");
  if (!box) return;
  var isLic = value === "licenciatura";
  box.classList.toggle("hidden", !isLic);
  if (sec) sec.classList.toggle("hidden", isLic);
}

function collect(form) {
  var data = Object.fromEntries(new FormData(form).entries());
  data.id = uid();
  data.fechaAlta = new Date().toISOString();
  data.estado = "Preinscripto";
  data.carreraNombre = CARRERAS[data.carrera] || data.carrera;
  data.docsTitulo = !!(form.docsTitulo && form.docsTitulo.checked);
  data.docsSalud = !!(form.docsSalud && form.docsSalud.checked);
  data.docsDni = !!(form.docsDni && form.docsDni.checked);
  data.docsFotos = !!(form.docsFotos && form.docsFotos.checked);
  data.docsFolio = !!(form.docsFolio && form.docsFolio.checked);
  return data;
}

function camposVacios(form) {
  var faltan = [];
  var lista = form.querySelectorAll("[required]");
  for (var i = 0; i < lista.length; i++) {
    var el = lista[i];
    if (el.type === "checkbox" && !el.checked) faltan.push(el.name || "declaración");
    else if (!String(el.value || "").trim()) faltan.push(el.name || "campo");
  }
  return faltan;
}

function bindForm() {
  var form = document.getElementById("fichaForm");
  if (!form) return;
  var fecha = document.getElementById("fecha");
  if (fecha) fecha.value = todayISO();
  fillCarreraSelect();
  var mailHint = document.getElementById("mailDestino");
  if (mailHint) mailHint.textContent = EMAIL_DESTINO;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var faltan = camposVacios(form);
    if (faltan.length) {
      alert("Faltan datos obligatorios. Completá los campos vacíos y volvé a generar la ficha.");
      return;
    }
    var data = collect(form);
    var all = loadAll();
    all.unshift(data);
    saveAll(all);
    descargarArchivo("ficha-preinscripcion-" + data.dni + ".html", fichaDescargable(data), "text/html;charset=utf-8");
    mostrarLeyenda("leyendaPreinscripcion", "Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com. También debe imprimirla para presentarla en sede.");
    mostrarCartel("Ficha generada", "Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com. También debe imprimirla para la inscripción.");
    setTimeout(function () {
      location.href = "ficha.html?id=" + encodeURIComponent(data.id);
    }, 900);
  });
}

function bindContacto() {
  var form = document.getElementById("contactoForm");
  if (!form) return;
  var mailHint = document.getElementById("mailDestino");
  if (mailHint) mailHint.textContent = EMAIL_DESTINO;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (camposVacios(form).length) {
      alert("Faltan datos obligatorios.");
      return;
    }
    var fd = new FormData(form);
    var texto =
      "CONSULTA ISEP N° 8232\n" +
      "Enviar a: " + EMAIL_DESTINO + "\n\n" +
      "Nombre: " + fd.get("nombre") + "\n" +
      "Email: " + fd.get("email") + "\n" +
      "Teléfono: " + (fd.get("telefono") || "-") + "\n" +
      "Motivo: " + (fd.get("motivo") || "-") + "\n\n" +
      fd.get("mensaje") + "\n";
    descargarArchivo("consulta-isep-8232.txt", texto, "text/plain;charset=utf-8");
    mostrarLeyenda("leyendaContacto", "Consulta descargada. Envíala a " + EMAIL_DESTINO + ".");
    mostrarCartel("Consulta lista", "Se descargó un archivo de texto. Adjuntalo o copiá el contenido y envialo a " + EMAIL_DESTINO + ".");
  });
}

function renderFicha() {
  var holder = document.getElementById("fichaView");
  if (!holder) return;
  var id = qs("id");
  var row = loadAll().filter(function (r) { return r.id === id; })[0];
  if (!row) {
    holder.innerHTML = "<p>No se encontró la preinscripción en este navegador. Volvé a generar la ficha.</p>";
    return;
  }
  holder.innerHTML = fichaHTML(row);
  var btn = document.getElementById("btnDescargar");
  if (btn) {
    btn.addEventListener("click", function () {
      descargarArchivo("ficha-preinscripcion-" + row.dni + ".html", fichaDescargable(row), "text/html;charset=utf-8");
    });
  }
}

function renderAdmin() {
  var body = document.getElementById("adminBody");
  if (!body) return;
  var rows = loadAll();
  var count = document.getElementById("count");
  if (count) count.textContent = rows.length;
  if (!rows.length) {
    body.innerHTML = "<tr><td colspan='7'>No hay preinscripciones guardadas en este equipo.</td></tr>";
    return;
  }
  body.innerHTML = rows.map(function (r) {
    return "<tr><td>" + esc(r.id) + "</td><td>" + esc(formatDate(r.fecha)) + "</td><td>" + esc(r.apellidos) + ", " + esc(r.nombres) +
      "</td><td>" + esc(r.dni) + "</td><td>" + esc(r.carreraNombre) + "</td><td>" + esc(r.celular || "") + "<br>" + esc(r.email) +
      "</td><td><a href='ficha.html?id=" + encodeURIComponent(r.id) + "'>Ver ficha</a></td></tr>";
  }).join("");
}

function exportCSV() {
  var rows = loadAll();
  if (!rows.length) return alert("No hay registros para exportar.");
  var cols = ["id", "fecha", "estado", "apellidos", "nombres", "dni", "cuil", "carreraNombre", "email", "celular", "localidad", "provincia"];
  var lines = [cols.join(";")].concat(rows.map(function (r) {
    return cols.map(function (c) { return '"' + String(r[c] || "").replace(/"/g, "'") + '"'; }).join(";");
  }));
  descargarArchivo("preinscriptos-isep-8232.csv", "\uFEFF" + lines.join("\n"), "text/csv;charset=utf-8");
}

function bindAdmin() {
  var loginBox = document.getElementById("adminLogin");
  var panel = document.getElementById("adminPanel");
  if (!loginBox || !panel) return;

  function abrir() {
    loginBox.classList.add("hidden");
    panel.classList.remove("hidden");
    renderAdmin();
  }
  function cerrar() {
    sessionStorage.removeItem(ADMIN_KEY);
    panel.classList.add("hidden");
    loginBox.classList.remove("hidden");
  }

  if (sessionStorage.getItem(ADMIN_KEY) === "1") abrir();

  var btn = document.getElementById("btnAdminLogin");
  if (btn) {
    btn.addEventListener("click", function () {
      var pass = (document.getElementById("adminPass").value || "").trim();
      var err = document.getElementById("adminError");
      if (pass === ADMIN_CLAVE) {
        sessionStorage.setItem(ADMIN_KEY, "1");
        if (err) err.style.display = "none";
        abrir();
      } else if (err) {
        err.style.display = "block";
        err.textContent = "Clave incorrecta.";
      }
    });
  }
  var salir = document.getElementById("btnAdminSalir");
  if (salir) salir.addEventListener("click", cerrar);
  var exp = document.getElementById("btnExport");
  if (exp) exp.addEventListener("click", exportCSV);
}

document.addEventListener("DOMContentLoaded", function () {
  bindForm();
  bindContacto();
  renderFicha();
  bindAdmin();
});
