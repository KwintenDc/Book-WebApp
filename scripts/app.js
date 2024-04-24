// Registreer de Service Worker.

window.addEventListener("load", function(){
    if('serviceWorker' in this.navigator)
    {
        navigator.serviceWorker.register("service-worker.js")
        .then((registration) => {
            console.log("Registered: ", registration);
        })
        .catch((error) => console.log("Error: ", error));
    }
    else
        alert("No service worker support in this browser.");
});