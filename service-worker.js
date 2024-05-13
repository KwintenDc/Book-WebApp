const STATIC_CACHE_NAME = "static-version-1";
const DYNAMIC_CACHE_NAME = "dynamic-version-1";

// Array met alle static files die gecached moeten worden.
const staticFiles = [
    'index.html',
    'styles/styles.css',
    'scripts/script.js',
    'scripts/app.js',
    'images/QR_Icon.png',
    'images/Search_Icon.png',
    'images/Storage_Icon.png',
    'images/Image_not_available.png',
    'images/favicon.ico',
    'pages/home.html',
    'pages/store_books.html',
    'pages/view_books.html',
    'pages/404.html',
    'assets/css/bootstrap.min.css',
    'assets/js/jquery-3.6.0.min.js',
    'assets/js/bootstrap.min.js',
    'assets/js/quagga.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2',
    'manifest.webmanifest'
];

self.addEventListener("install", (event) => {
    console.log("Service worker installed: ", event);

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log("Caching static files.");
            return cache.addAll(staticFiles);
        }).catch(error => {
            console.error("Failed to cache static files:", error);
        })
    );
});

// Vang het 'activate' event op.
self.addEventListener("activate", (event) => {
    console.log("Service worker activated: ", event);

    event.waitUntil(
        caches.keys().then(keys => {
            console.log("Cache keys: ", keys);

            // Wacht tot alle promises 'resolved' zijn.
            return Promise.all(
                // Gebruik de filter functie, om een nieuw array aan te maken dat enkel de cache names
                // bevat die niet tot de huidige versie behoren.
                keys.filter(key => ((key !== STATIC_CACHE_NAME) && (key !== DYNAMIC_CACHE_NAME)))
                // Gebruik het gefilterd array, om de oude caches te wissen.
                .map(key => caches.delete(key))


                // Zie: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
                // Zie: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
            )
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log("Fetch event: ", event);

    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            if (event.request.url.includes('barcode.html')) {
                return caches.match('pages/404.html');
            }

            return cacheResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                })
            });
        })
    );
});

