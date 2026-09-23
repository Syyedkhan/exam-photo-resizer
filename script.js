/* ============================================
   Photo Resizer - Script (Drag + Zoom + Specs)
   ============================================ */

const photoInput = document.getElementById('photoInput');
const examSelect = document.getElementById('examSelect');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const resetBtn = document.getElementById('resetBtn');
const adjustControls = document.getElementById('adjustControls');
const dragHint = document.querySelector('.drag-hint');

let uploadedImage = null;
let offsetX = 0;
let offsetY = 0;
let zoom = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let targetW = 0;
let targetH = 0;

// Document specifications
const examSpecs = {
    // India
    'ibps': { photoW: 200, photoH: 230, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'ssc-cgl': { photoW: 100, photoH: 120, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'rrb': { photoW: 320, photoH: 240, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'neet': { photoW: 200, photoH: 230, sigW: 140, sigH: 60, photoSize: '10 KB - 200 KB', sigSize: '10 KB - 20 KB' },
    'upsc': { photoW: 350, photoH: 450, sigW: 140, sigH: 60, photoSize: '20 KB - 300 KB', sigSize: '10 KB - 20 KB' },
    // US
    'us-passport': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
    'us-visa': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
    // UK
    'uk-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: '50 KB - 10 MB', sigSize: '-' },
    // Schengen
    'schengen': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
    // Canada
    'canada-passport': { photoW: 591, photoH: 827, sigW: 0, sigH: 0, photoSize: 'Under 4 MB', sigSize: '-' },
    // Australia
    'australia-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' }
};

// Photo select
if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                offsetX = 0;
                offsetY = 0;
                zoom = 1;
                if (zoomSlider) zoomSlider.value = 100;
                if (zoomValue) zoomValue.textContent = '100%';
                showPreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Exam select
if (examSelect) {
    examSelect.addEventListener('change', function() {
        if (uploadedImage) {
            offsetX = 0;
            offsetY = 0;
            showPreview();
        }
    });
}

// Preview
function showPreview() {
    if (!uploadedImage || !previewCanvas) return;

    const exam = examSelect ? examSelect.value : '';
    const ctx = previewCanvas.getContext('2d');

    targetW = uploadedImage.width;
    targetH = uploadedImage.height;

    if (exam && examSpecs[exam]) {
        targetW = examSpecs[exam].photoW;
        targetH = examSpecs[exam].photoH;
    }

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
        if (exam && examSpecs[exam]) {
            statusText.textContent = `${exam.toUpperCase()} - ${targetW}x${targetH} pixels`;
        } else {
            statusText.textContent = `Original: ${targetW}x${targetH} pixels`;
        }
    }

    if (downloadBtn) downloadBtn.disabled = false;
    if (adjustControls) adjustControls.style.display = 'block';
}

// Drag - Mouse
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

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // Drag - Touch
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

// Zoom
if (zoomSlider) {
    zoomSlider.addEventListener('input', function() {
        zoom = parseInt(this.value) / 100;
        if (zoomValue) zoomValue.textContent = this.value + '%';
        showPreview();
    });
}

// Reset
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        offsetX = 0;
        offsetY = 0;
        zoom = 1;
        if (zoomSlider) zoomSlider.value = 100;
        if (zoomValue) zoomValue.textContent = '100%';
        showPreview();
    });
}

// Download
function downloadPhoto() {
    if (!previewCanvas || !uploadedImage) return;
    const link = document.createElement('a');
    link.download = 'photo.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPhoto);
}


/* ============================================
   PHOTO COMPRESSOR
   ============================================ */

const compressInput = document.getElementById('compressInput');
const targetSize = document.getElementById('targetSize');
const compressPreview = document.getElementById('compressPreview');
const compressStatus = document.getElementById('compressStatus');
const compressBtn = document.getElementById('compressBtn');
const compressDownloadBtn = document.getElementById('compressDownloadBtn');

let compressImage = null;
let compressedBlob = null;

if (compressInput) {
    compressInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                compressImage = img;
                if (compressPreview) {
                    compressPreview.src = event.target.result;
                    compressPreview.style.display = 'block';
                }
                if (compressStatus) {
                    compressStatus.textContent = `Original Size: ${(file.size / 1024).toFixed(1)} KB`;
                }
                if (compressBtn) compressBtn.disabled = false;
                if (compressDownloadBtn) compressDownloadBtn.disabled = true;
                compressedBlob = null;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function compressImageFile(img, targetKB, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let width = img.width;
    let height = img.height;

    if (width > 1200 || height > 1200) {
        if (width > height) {
            height = (height / width) * 1200;
            width = 1200;
        } else {
            width = (width / height) * 1200;
            height = 1200;
        }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.9;

    function tryCompress() {
        canvas.toBlob(function(blob) {
            const sizeKB = blob.size / 1024;
            if (sizeKB <= targetKB || quality <= 0.1) {
                callback(blob);
            } else {
                quality -= 0.1;
                tryCompress();
            }
        }, 'image/jpeg', quality);
    }
    tryCompress();
}

if (compressBtn) {
    compressBtn.addEventListener('click', function() {
        if (!compressImage) return;
        const targetKB = parseInt(targetSize.value);
        if (compressStatus) compressStatus.textContent = 'Compressing...';

        compressImageFile(compressImage, targetKB, function(blob) {
            compressedBlob = blob;
            const sizeKB = (blob.size / 1024).toFixed(1);

            if (compressPreview) {
                compressPreview.src = URL.createObjectURL(blob);
            }
            if (compressStatus) {
                compressStatus.textContent = `✅ Compressed: ${sizeKB} KB (Target: ${targetKB} KB)`;
            }
            if (compressDownloadBtn) compressDownloadBtn.disabled = false;
        });
    });
}

if (compressDownloadBtn) {
    compressDownloadBtn.addEventListener('click', function() {
        if (!compressedBlob) return;
        const link = document.createElement('a');
        link.download = 'compressed-photo.jpg';
        link.href = URL.createObjectURL(compressedBlob);
        link.click();
    });
}