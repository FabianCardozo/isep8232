(function(){
 'use strict';
 let client;
 window.isepClient=function(){if(!window.supabase)throw new Error('No se pudo cargar la conexión. Revisá Internet y recargá la página.');if(!client)client=window.supabase.createClient(ISEP_CLOUD.url,ISEP_CLOUD.key,{auth:{storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return client;};
 window.isepSend=async function(id,datos){const {error}=await isepClient().from('isep_preinscripciones').insert({id,datos});if(error){if(error.code==='23505')return;throw new Error('No pudimos confirmar el envío. Revisá tu conexión y los datos; luego reintentá. Si persiste, contactá al instituto.');}};
})();