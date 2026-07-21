var CACHE='solohidro-v1';
var ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(new URL(req.url).origin!==location.origin) return;        // ERP (Google) carrega normal
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
    return hit||fetch(req).catch(function(){return caches.match('./index.html');});
  }));
});
