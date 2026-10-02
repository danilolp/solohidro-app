// Portal dos sistemas SoloHidro — service worker.
//
// 🔴 A versão anterior era CACHE-FIRST com o nome do cache fixo: quem já tinha
// o atalho na tela inicial continuava vendo a página ANTIGA para sempre, porque
// o cache nunca era invalidado. É o mesmo defeito de "versão velha servida em
// silêncio" que custou uma confusão em 02/10/2026 — e num portal de atalhos ele
// é pior, porque a pessoa não desconfia de uma lista de links.
//
// Agora: REDE PRIMEIRO para a página (com a rede, você sempre vê a lista atual);
// o cache é só a reserva de quando não há sinal — que é o motivo de existir um
// service worker aqui, já que o portal precisa abrir no campo.
var CACHE = 'solohidro-v2';
var ASSETS = ['./', './index.html', './manifest.json',
              './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
    .then(function () { return self.skipWaiting(); }));
});

// Apaga as versões anteriores do cache — sem isto, trocar o nome do cache só
// acumula lixo e a página velha pode continuar sendo servida.
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; })
                            .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (new URL(req.url).origin !== location.origin) return;   // os sistemas carregam direto
  e.respondWith(
    fetch(req).then(function (resp) {
      // guarda a versão nova para quando faltar sinal
      var copia = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copia); });
      return resp;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true })
        .then(function (hit) { return hit || caches.match('./index.html'); });
    })
  );
});
