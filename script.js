/* ============================================
   Photo Resizer - Script (Complete)
   ============================================ */

// ============ PHOTO / SIGNATURE RESIZER ============
const photoInput = document.getElementById('photoInput');
const docType = document.getElementById('docType');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const resetBtn = document.getElementById('resetBtn');
const adjustControls = document.getElementById('adjustControls');

let uploadedImage = null;
let offsetX = 0, offsetY = 0, zoom = 1;
let isDragging = false, startX = 0, startY = 0;
let targetW = 0, targetH = 0;

function getDocSpecs() {
    const type = docType ? docType.value : 'photo';
    if (type === 'signature') {
        return { w: 140, h: 60, label: 'Signature' };
    }
    return { w: 200, h: 230, label: 'Photo' };
}

if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                offsetX = 0; offsetY = 0; zoom = 1;
                if (zoomSlider) zoomSlider.value = 100;
                if (zoomValue) zoomValue.textContent = '100%';
                showPreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (docType) {
    docType.addEventListener('change', function() {
        offsetX = 0; offsetY = 0; zoom = 1;
        if (zoomSlider) zoomSlider.value = 100;
        if (zoomValue) zoomValue.textContent = '100%';
        if (uploadedImage) showPreview();
    });
}

function showPreview() {
    if (!uploadedImage || !previewCanvas) return;
    const specs = getDocSpecs();
    const ctx = previewCanvas.getContext('2d');

    targetW = specs.w;
    targetH = specs.h;

    previewCanvas.width = targetW;
    previewCanvas.height = targetH;
    previewCanvas.classList.add('show');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const scale = Math.max(targetW / uploadedImage.width, targetH / uploadedImage.height) * zoom;
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const x = (targetW - drawW) / 2 + offsetX;
    const y = (targetH - drawH) / 2 + offsetY;

    ctx.drawImage(uploadedImage, x, y, drawW, drawH);

    if (statusText) {
        statusText.textContent = `${specs.label}: ${targetW}x${targetH} px`;
    }
    if (downloadBtn) downloadBtn.disabled = false;
    if (adjustControls) adjustControls.style.display = 'block';
}

if (previewCanvas) {
    previewCanvas.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        showPreview();
    });
    document.addEventListener('mouseup', function() { isDragging = false; });

    previewCanvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - offsetX;
            startY = e.touches[0].clientY - offsetY;
        }
    }, { passive: true });

    previewCanvas.addEventListener('touchmove', function(e) {
        if (!isDragging || e.touches.length !== 1) return;
        offsetX = e.touches[0].clientX - startX;
        offsetY = e.touches[0].clientY - startY;
        showPreview();
    }, { passive: true });

    previewCanvas.addEventListener('touchend', function() {
        isDragging = false;
    });
}

if (zoomSlider) {
    zoomSlider.addEventListener('input', function() {
        zoom = parseInt(this.value) / 100;
        if (zoomValue) zoomValue.textContent = this.value + '%';
        showPreview();
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        offsetX = 0; offsetY = 0; zoom = 1;
        if (zoomSlider) zoomSlider.value = 100;
        if (zoomValue) zoomValue.textContent = '100%';
        showPreview();
    });
}

function downloadPhoto() {
    if (!previewCanvas || !uploadedImage) return;
    const specs = getDocSpecs();
    const link = document.createElement('a');
    link.download = specs.label.toLowerCase() + '.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}
if (downloadBtn) downloadBtn.addEventListener('click', downloadPhoto);