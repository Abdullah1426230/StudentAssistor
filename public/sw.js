const CACHE_NAME =
    "student-assistor-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/app.js",
    "/style.css"
];

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches.open(
                CACHE_NAME
            ).then(cache =>
                cache.addAll(
                    urlsToCache
                )
            )
        );

    }
);

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(
            caches.match(
                event.request
            )
            .then(response => {

                return (
                    response ||
                    fetch(
                        event.request
                    )
                );

            })
        );

    }
);
