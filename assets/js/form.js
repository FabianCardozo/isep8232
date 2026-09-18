const KEY = "isep_preinscriptos_v1";
const EMAIL_DESTINO = "instituto8232@gmail.com";

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
  var p = iso.split("-");
  if (p.length !== 3) return iso;
  return p[2] + "/" + p[1] + "/" + p[0];
}
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function mostrarLeyenda(id, texto) {
  var el = document.getElementById(id);
  if (!el) {
    el = document.createElement("p");
    el.id = id;
    document.body.appendChild(el);
  }
  el.textContent = texto;
  el.style.display = "block";
  el.style.marginTop = "14px";
  el.style.padding = "14px 16px";
  el.style.borderRadius = "12px";
  el.style.background = "#e8f7f2";
  el.style.border = "1px solid #b7e4d6";
  el.style.color = "#14685c";
  el.style.fontWeight = "700";
  el.style.fontSize = "1rem";
}

function mostrarCartel(titulo, texto) {
  var viejo = document.getElementById("confirmOverlay");
  if (viejo) viejo.remove();
  var overlay = document.createElement("div");
  overlay.id = "confirmOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(43,39,48,.5);display:flex;align-items:center;justify-content:center;padding:20px";
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:22px;max-width:420px;width:100%;padding:28px 24px;text-align:center">' +
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

function enviarMailto(asunto, cuerpo) {
  var url = "mailto:" + EMAIL_DESTINO +
    "?subject=" + encodeURIComponent(asunto) +
    "&body=" + encodeURIComponent(cuerpo);
  var a = document.createElement("a");
  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function textoPreinscripcion(data) {
  return [
    "PREINSCRIPCIÓN ISEP N° 8232",
    "Código: " + data.id,
    "Carrera: " + data.carreraNombre,
    "Fecha: " + data.fecha,
    "Apellido y nombre: " + data.apellidos + ", " + data.nombres,
    "DNI: " + (data.tipoDoc || "DNI") + " " + data.dni,
    "CUIL: " + (data.cuil || "-"),
    "Nacimiento: " + (data.lugarNac || "") + " " + (data.fechaNac || ""),
    "Domicilio: " + [data.calle, data.numero, data.localidad, data.provincia].join(" "),
    "Celular: " + (data.celular || "-"),
    "Email: " + data.email,
    "Título secundario: " + (data.tituloSec || "-"),
    "Título de base: " + (data.tituloBase || "-")
  ].join("\n");
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
  return data;
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
    if (!form.checkValidity()) {
      form.reportValidity();
      alert("Faltan datos obligatorios. Completá los campos marcados y volvé a enviar.");
      return;
    }
    var data = collect(form);
    var all = loadAll();
    all.unshift(data);
    saveAll(all);

    mostrarLeyenda("leyendaPreinscripcion", "Formulario enviado. Se abrió un correo para instituto8232@gmail.com. Tocá Enviar en tu programa de correo.");
    mostrarCartel("Formulario enviado", "Se abrió un mensaje hacia instituto8232@gmail.com. Confirmá el envío en tu correo. La ficha también quedó guardada.");
    enviarMailto("Preinscripción ISEP 8232 — " + data.carreraNombre, textoPreinscripcion(data));

    setTimeout(function () {
      location.href = "ficha.html?id=" + encodeURIComponent(data.id) + "&mail=ok";
    }, 2500);
  });
}

function bindContacto() {
  var form = document.getElementById("contactoForm");
  if (!form) return;
  var mailHint = document.getElementById("mailDestino");
  if (mailHint) mailHint.textContent = EMAIL_DESTINO;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      alert("Faltan datos obligatorios.");
      return;
    }
    var fd = new FormData(form);
    var cuerpo = [
      "CONSULTA WEB ISEP N° 8232",
      "Nombre: " + fd.get("nombre"),
      "Email: " + fd.get("email"),
      "Teléfono: " + (fd.get("telefono") || "-"),
      "Motivo: " + (fd.get("motivo") || "-"),
      "",
      fd.get("mensaje")
    ].join("\n");

    mostrarLeyenda("leyendaContacto", "Formulario enviado. Se abrió un correo para instituto8232@gmail.com. Tocá Enviar en tu programa de correo.");
    mostrarCartel("Formulario enviado", "Se abrió un mensaje hacia instituto8232@gmail.com. Confirmá el envío en tu correo.");
    enviarMailto("Consulta ISEP 8232 — " + fd.get("nombre"), cuerpo);
  });
}

function renderFicha() {
  var holder = document.getElementById("fichaView");
  if (!holder) return;
  var id = qs("id");
  var row = loadAll().filter(function (r) { return r.id === id; })[0];
  if (!row) {
    holder.innerHTML = "<p>No se encontró la preinscripción.</p>";
    return;
  }
  var extra = row.carrera === "licenciatura"
    ? "<div class='ficha-row'><span>Título de base</span><b>" + (row.tituloBase || "—") + "</b></div>"
    : "<div class='ficha-row'><span>Título secundario</span><b>" + (row.tituloSec || "—") + "</b></div>";
  holder.innerHTML =
    "<div class='ficha'><div class='ficha-top'>" +
    "<img src='assets/logo_isep.jpg' alt='ISEP' width='72' height='72'>" +
    "<div style='flex:1;text-align:center'><div style='font-size:.75rem;letter-spacing:.12em'>INSTITUTO SUPERIOR DE EDUCACIÓN PROFESIONAL</div>" +
    "<h2>Solicitud de preinscripción</h2><div>ISEP N° 8232 · San Ramón de la Nueva Orán</div></div>" +
    "<div style='text-align:right;font-size:.85rem'><b>" + row.id + "</b><div>" + formatDate(row.fecha) + "</div></div></div>" +
    "<div class='ficha-row'><span>Carrera</span><b>" + row.carreraNombre + "</b></div>" +
    "<div class='ficha-row'><span>Apellidos</span><b>" + row.apellidos + "</b></div>" +
    "<div class='ficha-row'><span>Nombres</span><b>" + row.nombres + "</b></div>" +
    "<div class='ficha-row'><span>Documento</span><b>" + (row.tipoDoc || "DNI") + " " + row.dni + "</b></div>" +
    extra +
    "<div class='ficha-row'><span>Domicilio</span><b>" + [row.calle, row.numero, row.localidad, row.provincia].join(" ") + "</b></div>" +
    "<div class='ficha-row'><span>Celular</span><b>" + (row.celular || "—") + "</b></div>" +
    "<div class='ficha-row'><span>Correo</span><b>" + row.email + "</b></div>" +
    "<p style='margin-top:18px;font-size:.82rem'>Preinscripción. La inscripción definitiva se concreta al presentar la documentación en sede.</p>" +
    "<p style='margin-top:28px;text-align:right;font-size:.85rem'>" + row.nombres + " " + row.apellidos + " · " + row.dni + "</p></div>";
}

function renderAdmin() {
  var body = document.getElementById("adminBody");
  if (!body) return;
  var rows = loadAll();
  var count = document.getElementById("count");
  if (count) count.textContent = rows.length;
  if (!rows.length) {
    body.innerHTML = "<tr><td colspan='7'>Todavía no hay preinscriptos en este navegador.</td></tr>";
    return;
  }
  body.innerHTML = rows.map(function (r) {
    return "<tr><td>" + r.id + "</td><td>" + formatDate(r.fecha) + "</td><td>" + r.apellidos + ", " + r.nombres +
      "</td><td>" + r.dni + "</td><td>" + r.carreraNombre + "</td><td>" + (r.celular || "") + "<br>" + r.email +
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
  var blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "preinscriptos-isep-8232.csv";
  a.click();
}

document.addEventListener("DOMContentLoaded", function () {
  bindForm();
  bindContacto();
  renderFicha();
  renderAdmin();
  var exp = document.getElementById("btnExport");
  if (exp) exp.addEventListener("click", exportCSV);
  var mailStatus = document.getElementById("mailStatus");
  if (mailStatus && qs("mail")) {
    mailStatus.className = "ok no-print";
    mailStatus.style.display = "block";
    mailStatus.textContent = "Formulario enviado. La preinscripción quedó registrada.";
    mostrarCartel("Formulario enviado", "Tu preinscripción fue enviada. Guardá o imprimí la ficha para presentarla en sede.");
  }
});
