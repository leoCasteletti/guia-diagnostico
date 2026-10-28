const CACHE = 'guia-v1';
const ARQUIVOS = [
    './',
    'index.html',
    'css/style.css',
    'js/app.js',
    'dados/diagnosticos.json',
    'vendor/bootstrap/bootstrap.min.css',
    'icone.svg',
    'manifest.json',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((resposta) => {
                const copia = resposta.clone();
                caches.open(CACHE).then((c) => c.put(e.request, copia));
                return resposta;
            })
            .catch(() => caches.match(e.request))
    );
});
