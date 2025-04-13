// PWA Installation Handling
let deferredPrompt;
const installContainer = document.getElementById('installContainer');
const installButton = document.getElementById('installButton');
const dismissButton = document.getElementById('dismissButton');

// Initially hide install prompt
installContainer.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
    
    // Show prompt after 5 seconds
    setTimeout(showInstallPromotion, 5000);
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallPromotion();
});

function showInstallPromotion() {
    // Only show if not already installed
    if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
        installContainer.style.display = 'block';
    }
}

function hideInstallPromotion() {
    installContainer.style.display = 'none';
}

installButton.addEventListener('click', async () => {
    hideInstallPromotion();
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    }
});

dismissButton.addEventListener('click', () => {
    hideInstallPromotion();
});

// Service Worker Registration with Update Handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

function showUpdateNotification() {
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span>A new version is available.</span>
            <button id="reloadButton" class="btn btn-sm btn-light">Update</button>
        </div>
    `;
    document.body.appendChild(toast);
    
    document.getElementById('reloadButton').addEventListener('click', () => {
        window.location.reload();
    });
    
    setTimeout(() => {
        toast.remove();
    }, 10000);
}