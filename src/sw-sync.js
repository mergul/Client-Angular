/*addEventListener('onbackgroundfetchsuccess', (event) => {
    console.log('[Service Worker]: Background Fetch Success', event.registration);
    if (event.tag.startsWith('video-upload-')) {
        self.registration.showNotification("Photo uploaded!");
        new BroadcastChannel('background-fetch').postMessage({
            tag: event.tag,
            ok: true
        });
    }
});

addEventListener('onbackgroundfetchfail', (event) => {
    console.log('[Service Worker]: Background Fetch Failed', event.registration);
    if (event.tag.startsWith('video-upload-')) {
        self.registration.showNotification("Photo upload failed");
        new BroadcastChannel('background-fetch').postMessage({
            tag: event.tag,
            ok: true
        });

        // store video in IDB for later retry
        // event.waitUntil(
        //     [...event.fetches.keys()][0].formData()
        //         .then(body => storeInIDB(body))
        // );
    }
});

addEventListener('onbackgroundfetchclick', (event) => {
    event.waitUntil(async function () {
        // const galleryId = getGalleryIdSomehow(event.registration.id);
        // clients.openWindow(`/galleries/${galleryId}`);
    }());
});
*/