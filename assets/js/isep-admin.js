(function(){'use strict';
    function esc(v) {
      return String(v == null || v === "" ? "—" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;");
    }
    function docsTexto(d) {
      var p = [];
      if (d.docsTitulo) p.push("Título o constancia");
      if (d.docsSalud) p.push("Certificado de salud");
      if (d.docsDni) p.push("DNI ambas caras");
      if (d.docsFotos) p.push("Dos fotos 4x4");
      if (d.docsFolio) p.push("Un folio");
      return p.length ? p.join(" · ") : "—";
    }
    function fichaHTML(d) {
      var filas = [
        ["Carrera", d.carreraNombre],
        ["Fecha de la solicitud", d.fecha],
        ["Apellidos", d.apellidos],
        ["Nombres", d.nombres],
        ["Edad", d.edad],
        ["Estado civil", d.estadoCivil],
        ["Sexo", d.sexo],
        ["Documento", (d.tipoDoc || "DNI") + " " + (d.dni || "")],
        ["CUIL", d.cuil],
        ["Nacionalidad", d.nacionalidad],
        ["Lugar de nacimiento", d.lugarNac],
        ["Fecha de nacimiento", d.fechaNac],
        ["¿Trabaja?", d.trabaja]
      ];
      if (d.carrera === "licenciatura") {
        filas.push(["Título de base", d.tituloBase], ["Institución que otorgó el título", d.institucionTitulo], ["Duración previa", d.duracionPrevia], ["Horas reloj", d.horasReloj]);
      } else {
        filas.push(["Título secundario", d.tituloSec], ["Institución que lo expidió", d.institucionSec], ["Año de egreso", d.anioEgreso]);
      }
      filas.push(["Calle / Avenida", d.calle], ["N°", d.numero], ["Localidad", d.localidad], ["Provincia", d.provincia], ["Teléfono", d.telefono], ["Celular", d.celular], ["Correo electrónico", d.email], ["Documentación que acompañará", docsTexto(d)]);
      var cuerpo = filas.map(function (f) {
        return "<div class='ficha-row'><span>" + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
      }).join("");
      var foto = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d.foto||'') ? "<img class='foto-4x4' src='" + d.foto + "' alt='Foto 4x4'>" : "<div class='foto-4x4'></div>";
      return "<div class='ficha' id='printable'>" +
        "<div class='ficha-top'>" +
        "<img src='assets/logo_isep.jpg' alt='ISEP' width='72' height='72'>" +
        "<div style='flex:1;text-align:center'><div style='font-size:.75rem;letter-spacing:.12em'>INSTITUTO SUPERIOR DE EDUCACIÓN PROFESIONAL</div>" +
        "<h2>Solicitud de preinscripción</h2><div>ISEP N° 8232 · Hipólito Yrigoyen 686 (Escuela Técnica N° 3134)<br>San Ramón de la Nueva Orán · Lunes a viernes 19:15 a 23:30 hs<br>instituto8232@gmail.com</div></div>" +
        "<div class='ficha-izq'><b>" + esc(d.id) + "</b><div>" + esc(d.fecha) + "</div>" + foto + "</div></div>" +
        cuerpo +
        "<p style='margin-top:16px;font-size:.82rem'>Declaro que los datos consignados son verdaderos. Esta solicitud tiene carácter de preinscripción hasta la presentación de la documentación en sede. Luego de confirmar y descargar su ficha de preinscripción es necesario que la envié desde su correo personal al correo institucional: instituto8232@gmail.com.</p>" +
        "<div class='ficha-firmas'><div class='firma-linea'>Firma del / de la aspirante<br>Aclaración: " + esc(d.nombres) + " " + esc(d.apellidos) + "<br>DNI: " + esc(d.dni) + "</div><div class='firma-linea'>Aclaración y DNI</div></div>" +
        "<div class='ficha-recibido'><strong>RECIBIDO — uso institucional</strong>Fecha de recepción (DD/MM/AAAA): ____ / ____ / ________ &nbsp;&nbsp; Firma y sello del instituto: ______________________________</div>" +
        "</div>";
    }
const $=id=>document.getElementById(id);let rows=[],client;const status=$('cloudStatus');
const message=t=>status.textContent=t;
function hide(){rows=[];$('listadoCarreras').replaceChildren();$('adminPanel').classList.add('hidden');$('adminLogin').classList.remove('hidden');$('cajaEditar').classList.add('hidden');}
async function refresh(){message('Cargando preinscripciones…');const {data:user,error:ue}=await client.auth.getUser();if(ue||user?.user?.app_metadata?.isep_admin!==true){hide();throw Error('Ingresá con una cuenta institucional autorizada.');}let result=[];for(let offset=0;;offset+=100){const {data,error}=await client.from('isep_preinscripciones').select('id,created_at,datos').order('created_at',{ascending:false}).order('id').range(offset,offset+99);if(error)throw Error('No se pudo cargar el listado. Volvé a ingresar o reintentá.');result.push(...data);if(data.length<100)break;}rows=result;render();message('Listado actualizado desde la base del instituto.');}
function render(){$('count').textContent=rows.length;$('listadoCarreras').innerHTML='<div style="overflow:auto"><table class="data"><thead><tr><th>Seleccionar</th><th>Código</th><th>Aspirante</th><th>Carrera</th><th>Contacto</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><input type="checkbox" class="chk-ficha" aria-label="Seleccionar ficha" value="'+esc(r.id)+'"></td><td>'+esc(r.datos.id)+'</td><td>'+esc(r.datos.apellidos)+', '+esc(r.datos.nombres)+'</td><td>'+esc(r.datos.carreraNombre)+'</td><td>'+esc(r.datos.email)+'<br>'+esc(r.datos.celular)+'</td></tr>').join('')+'</tbody></table></div>'+(rows.length?'':'<p>No hay preinscripciones recibidas.</p>');}
function selected(){const ids=Array.from(document.querySelectorAll('.chk-ficha:checked'),el=>el.value);return rows.filter(r=>ids.includes(r.id));}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function action(id,fn){$(id).onclick=async()=>{const btn=$(id);btn.disabled=true;try{await fn();}catch(e){message(e.message);}finally{btn.disabled=false;}};}
try{client=isepClient();}catch(e){message(e.message);return;}
action('btnAdminLogin',async()=>{const email=$('adminEmail').value.trim(),password=$('adminPass').value;const {data,error}=await client.auth.signInWithPassword({email,password});$('adminPass').value='';if(error)throw Error('No se pudo ingresar. Verificá el correo y la contraseña de tu usuario de la aplicación.');if(data.user.app_metadata?.isep_admin!==true){await client.auth.signOut();throw Error('Esta cuenta no tiene acceso institucional.');}await refresh();$('adminLogin').classList.add('hidden');$('adminPanel').classList.remove('hidden');});
action('btnAdminSalir',async()=>{const {error}=await client.auth.signOut();hide();message(error?'No se pudo cerrar la sesión remota. Cerrá esta pestaña.':'Sesión cerrada.');});
action('btnRefresh',refresh);
action('btnExport',()=>{if(!rows.length)throw Error('No hay fichas para exportar.');const cols=['id','fecha','carreraNombre','apellidos','nombres','dni','email','celular','localidad'];const cell=v=>'"'+String(v??'').replace(/^[\s]*[=+@-]/,"'$&").replace(/"/g,'""')+'"';download('preinscriptos-isep.csv','\uFEFF'+[cols.join(';'),...rows.map(r=>cols.map(c=>cell(r.datos[c])).join(';'))].join('\r\n'),'text/csv;charset=utf-8');});
action('btnDescargarSel',async()=>{const list=selected();if(!list.length)throw Error('Seleccioná al menos una ficha.');const css=await fetch('assets/css/style.css').then(r=>{if(!r.ok)throw Error('No se pudo cargar el formato.');return r.text();});const body=list.map(r=>fichaHTML(r.datos)).join('<div style="break-after:page"></div>');download('fichas-isep.html','<!doctype html><html lang="es"><meta charset="utf-8"><title>Fichas ISEP</title><style>'+css+'</style><body>'+body.replaceAll("src='assets/logo_isep.jpg'","src='https://fabiancardozo.github.io/isep8232/assets/logo_isep.jpg'")+'</body></html>','text/html;charset=utf-8');});
action('btnEliminarSel',async()=>{const list=selected();if(!list.length)throw Error('Seleccioná una ficha.');if(!confirm('¿Eliminar definitivamente las '+list.length+' fichas seleccionadas de la base del instituto?'))return;const {error}=await client.from('isep_preinscripciones').delete().in('id',list.map(r=>r.id));if(error)throw Error('No se pudieron eliminar las fichas.');await refresh();});
const fields={Apellidos:'apellidos',Nombres:'nombres',Dni:'dni',Celular:'celular',Email:'email',Localidad:'localidad',Fecha:'fecha',FechaNac:'fechaNac'};
action('btnEditarSel',()=>{const list=selected();if(list.length!==1)throw Error('Seleccioná una sola ficha para editar.');$('editId').value=list[0].id;Object.entries(fields).forEach(([id,key])=>$('edit'+id).value=list[0].datos[key]||'');$('cajaEditar').classList.remove('hidden');});
action('btnCancelarEdit',()=>$('cajaEditar').classList.add('hidden'));
action('btnGuardarEdit',async()=>{const row=rows.find(r=>r.id===$('editId').value);if(!row)throw Error('Actualizá el listado antes de editar.');const datos={...row.datos};Object.entries(fields).forEach(([id,key])=>datos[key]=$('edit'+id).value.trim());if(!datos.nombres||!datos.apellidos||!datos.dni||!/^\S+@\S+\.\S+$/.test(datos.email))throw Error('Revisá nombre, apellido, documento y correo.');const {data,error}=await client.from('isep_preinscripciones').update({datos}).eq('id',row.id).select('id');if(error||!data?.length)throw Error('No se pudo guardar la ficha.');$('cajaEditar').classList.add('hidden');await refresh();});
client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')hide();});
(async()=>{const {data}=await client.auth.getSession();if(data.session){try{await refresh();$('adminLogin').classList.add('hidden');$('adminPanel').classList.remove('hidden');}catch(e){message(e.message);}}})();
})();