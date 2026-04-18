// [DEPLOY:vv-nexus-logic.js]
// Eliminăm orice restricție de tip 'capture' pentru a permite accesul direct la Galerie
function initNexusFileHandler() {
    const nexusInput = document.getElementById('nexus-file-input');
    if (nexusInput) {
        nexusInput.removeAttribute('capture');
        nexusInput.setAttribute('multiple', '');
        console.log("VV NEXUS: Acces galerie deblocat.");
    }
}

// Trigger-ul pentru butonul de atașament din interfața NEXUS
function triggerNexusUpload() {
    const input = document.getElementById('nexus-file-input');
    input.click();
}