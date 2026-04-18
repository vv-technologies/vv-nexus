// Localizarea și actualizarea input-ului de media
const mediaInput = document.getElementById('mediaInput');
if (mediaInput) {
    // Eliminăm orice atribut capture pentru a permite accesul la Galerie
    mediaInput.removeAttribute('capture');
    mediaInput.setAttribute('type', 'file');
    mediaInput.setAttribute('accept', 'image/*');
    mediaInput.setAttribute('multiple', ''); 
    
    console.log("[VV NEXUS] Acces galerie deblocat. Atribut 'capture' eliminat.");
}