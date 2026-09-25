/* ============================================
   Photo Resizer - PI7 Style Script
   ============================================ */

const photoInput = document.getElementById('photoInput');
const imageArea = document.getElementById('imageArea');
const emptyState = document.getElementById('emptyState');
const fileName = document.getElementById('fileName');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const sizeInput = document.getElementById('sizeInput');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const badgeW = document.getElementById('badgeW');
const badgeH = document.getElementById('badgeH');

let uploadedImage = null;
let resizedCanvas = null;
let currentFileName = '';

// Click on image area to open file picker
imageArea.addEventListener('click', function() {
    photoInput.click();
});

// Drag & Drop
imageArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    imageArea.style.borderColor = '#4c51bf';
});

imageArea.addEventListener('dragleave', function() {
    imageArea.style.borderColor = '#667eea';
});

imageArea.addEventListener('drop', function(e) {
    e.preventDefault();
    imageArea.style.borderColor = '#667eea';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
});

// File select
photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
});

function loadImage(file) {
    currentFileName = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            uploadedImage = img;
            fileName.textContent = file.name;
            resizeBtn.disabled = false;
            downloadBtn.style.display = 'none';

            imageArea.innerHTML = `
                <button class="crop-btn-icon" id="cropBtn">✂️ Crop</button>
                <button class="remove-btn-icon" id="removeBtn">×</button>
                <img src="${event.target.result}" id="previewImg">
            `;

            document.getElementById('cropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal();
            });

            document.getElementById('removeBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removeImage();
            });

            const previewImg = document.getElementById('previewImg');
            previewImg.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    uploadedImage = null;
    resizedCanvas = null;
    photoInput.value = '';
    fileName.textContent = '';
    resizeBtn.disabled = true;
    downloadBtn.style.display = 'none';

    imageArea.innerHTML = `
        <div class="empty-state" id="emptyState">
            <p>📁 Click to select an image</p>
            <p style="font-size:13px;color:#999;">or drag & drop here</p>
        </div>
    `;
}

widthInput.addEventListener('input', function() {
    badgeW.textContent = 'W-' + (this.value || '0');
});

heightInput.addEventListener('input', function() {
    badgeH.textContent = 'H-' + (this.value || '0');
});

// Resize button
resizeBtn.addEventListener('click', function() {
    if (!uploadedImage) return;

    const targetW = parseInt(widthInput.value) || 140;
    const targetH = parseInt(heightInput.value) || 60;
    const targetKB = parseInt(sizeInput.value) || 20;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const scale = Math.max(targetW / uploadedImage.width, targetH / uploadedImage.height);
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const x = (targetW - drawW) / 2;
    const y = (targetH - drawH) / 2;

    ctx.drawImage(uploadedImage, x, y, drawW, drawH);

    // ===== ADD SLIGHT NOISE TO INCREASE FILE SIZE =====
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const pixels = imgData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, pixels[i] + (Math.random() * 6 - 3));
        pixels[i + 1] = Math.min(255, pixels[i + 1] + (Math.random() * 6 - 3));
        pixels[i + 2] = Math.min(255, pixels[i + 2] + (Math.random() * 6 - 3));
    }
    ctx.putImageData(imgData, 0, 0);

    // Compress to target KB
    let quality = 1.0;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let sizeKB = (dataUrl.length * 0.75) / 1024;

    while (sizeKB > targetKB && quality > 0.1) {
        quality -= 0.01;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }

    resizedCanvas = canvas;
    downloadBtn.style.display = 'block';
    downloadBtn.textContent = `⬇ Download (${sizeKB.toFixed(1)} KB)`;

    imageArea.innerHTML = `
        <button class="remove-btn-icon" id="removeBtn">×</button>
        <img src="${dataUrl}" id="previewImg">
    `;

    document.getElementById('removeBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        removeImage();
    });

    document.getElementById('previewImg').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// Download
downloadBtn.addEventListener('click', function() {
    if (!resizedCanvas) return;

    const targetW = parseInt(widthInput.value) || 140;
    const targetH = parseInt(heightInput.value) || 60;
    const targetKB = parseInt(sizeInput.value) || 20;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const scale = Math.max(targetW / uploadedImage.width, targetH / uploadedImage.height);
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const x = (targetW - drawW) / 2;
    const y = (targetH - drawH) / 2;
    ctx.drawImage(uploadedImage, x, y, drawW, drawH);

    // Add noise
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const pixels = imgData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, pixels[i] + (Math.random() * 6 - 3));
        pixels[i + 1] = Math.min(255, pixels[i + 1] + (Math.random() * 6 - 3));
        pixels[i + 2] = Math.min(255, pixels[i + 2] + (Math.random() * 6 - 3));
    }
    ctx.putImageData(imgData, 0, 0);

    let quality = 1.0;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let sizeKB = (dataUrl.length * 0.75) / 1024;

    while (sizeKB > targetKB && quality > 0.1) {
        quality -= 0.01;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }

    const link = document.createElement('a');
    link.download = 'ibps-' + (currentFileName || 'image.jpg');
    link.href = dataUrl;
    link.click();
});

// ============ CROP FUNCTIONALITY ============
let cropBox = { x: 75, y: 75, w: 350, h: 350 };
let cropBoxDragging = false;
let cropBoxResizing = false;
let cropResizeHandle = '';
let cropBoxStartX = 0, cropBoxStartY = 0;
let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const CROP_CANVAS_SIZE = 500;

function openCropModal() {
    let modal = document.getElementById('cropModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cropModal';
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-modal-content">
                <h3>✂️ Crop Image</h3>
                <p style="font-size:13px; color:#718096;">Drag corners to resize. Drag inside to move.</p>
                <div class="crop-canvas-wrapper">
                    <canvas id="cropCanvas"></canvas>
                </div>
                <div class="crop-controls">
                    <button class="btn-cancel" id="cropCancelBtn">Cancel</button>
                    <button class="btn-save" id="cropSaveBtn">Save Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setupCropEvents();
    }

    cropBox = { x: 75, y: 75, w: 350, h: 350 };
    modal.classList.add('active');
    drawCropCanvas();
}

function drawCropCanvas() {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas || !uploadedImage) return;
    const ctx = canvas.getContext('2d');
    const size = CROP_CANVAS_SIZE;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.max(size / uploadedImage.width, size / uploadedImage.height);
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const x = (size - drawW) / 2;
    const y = (size - drawH) / 2;

    ctx.drawImage(uploadedImage, x, y, drawW, drawH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, size, cropBox.y);
    ctx.fillRect(0, cropBox.y + cropBox.h, size, size - cropBox.y - cropBox.h);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
    ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, size - cropBox.x - cropBox.w, cropBox.h);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    ctx.fillStyle = '#667eea';
    const hs = 14;
    ctx.fillRect(cropBox.x - hs/2, cropBox.y - hs/2, hs, hs);
    ctx.fillRect(cropBox.x + cropBox.w - hs/2, cropBox.y - hs/2, hs, hs);
    ctx.fillRect(cropBox.x - hs/2, cropBox.y + cropBox.h - hs/2, hs, hs);
    ctx.fillRect(cropBox.x + cropBox.w - hs/2, cropBox.y + cropBox.h - hs/2, hs, hs);
}

function setupCropEvents() {
    const canvas = document.getElementById('cropCanvas');
    const modal = document.getElementById('cropModal');
    const saveBtn = document.getElementById('cropSaveBtn');
    const cancelBtn = document.getElementById('cropCancelBtn');

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function getHandleAt(mx, my) {
        const hs = 20;
        const { x, y, w, h } = cropBox;
        if (mx >= x - hs && mx <= x + hs && my >= y - hs && my <= y + hs) return 'tl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y - hs && my <= y + hs) return 'tr';
        if (mx >= x - hs && mx <= x + hs && my >= y + h - hs && my <= y + h + hs) return 'bl';
        if (mx >= x + w - hs && mx <= x + w + hs && my >= y + h - hs && my <= y + h + hs) return 'br';
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) return 'move';
        return null;
    }

    function onStart(e) {
        const pos = getMousePos(e);
        const handle = getHandleAt(pos.x, pos.y);
        if (!handle) return;

        if (handle === 'move') {
            cropBoxDragging = true;
        } else {
            cropBoxResizing = true;
            cropResizeHandle = handle;
        }

        cropBoxStartX = pos.x;
        cropBoxStartY = pos.y;
        cropBoxStart = { ...cropBox };

        if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
        if (!cropBoxDragging && !cropBoxResizing) return;

        const pos = getMousePos(e);
        const dx = pos.x - cropBoxStartX;
        const dy = pos.y - cropBoxStartY;
        const size = CROP_CANVAS_SIZE;
        const minSize = 50;

        if (cropBoxDragging) {
            let nx = cropBoxStart.x + dx;
            let ny = cropBoxStart.y + dy;
            nx = Math.max(0, Math.min(size - cropBox.w, nx));
            ny = Math.max(0, Math.min(size - cropBox.h, ny));
            cropBox.x = nx;
            cropBox.y = ny;
        } else {
            let { x, y, w, h } = cropBoxStart;

            if (cropResizeHandle === 'tl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                cropBox.w = x + w - nx;
                cropBox.h = y + h - ny;
                cropBox.x = nx;
                cropBox.y = ny;
            } else if (cropResizeHandle === 'tr') {
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                cropBox.h = y + h - ny;
                cropBox.y = ny;
                cropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
            } else if (cropResizeHandle === 'bl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                cropBox.w = x + w - nx;
                cropBox.x = nx;
                cropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            } else if (cropResizeHandle === 'br') {
                cropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
                cropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            }
        }

        drawCropCanvas();
        if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
        cropBoxDragging = false;
        cropBoxResizing = false;
        cropResizeHandle = '';
    }

    if (canvas) {
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    if (saveBtn) saveBtn.addEventListener('click', saveCrop);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
}

function saveCrop() {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas || !uploadedImage) return;

    const size = CROP_CANVAS_SIZE;
    const scale = Math.max(size / uploadedImage.width, size / uploadedImage.height);
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const imgX = (size - drawW) / 2;
    const imgY = (size - drawH) / 2;

    const srcX = (cropBox.x - imgX) / scale;
    const srcY = (cropBox.y - imgY) / scale;
    const srcW = cropBox.w / scale;
    const srcH = cropBox.h / scale;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = cropBox.w;
    newCanvas.height = cropBox.h;
    const newCtx = newCanvas.getContext('2d', { alpha: false });
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, cropBox.w, cropBox.h);
    newCtx.drawImage(uploadedImage, srcX, srcY, srcW, srcH, 0, 0, cropBox.w, cropBox.h);

    const croppedImg = new Image();
    croppedImg.onload = function() {
        uploadedImage = croppedImg;
        document.getElementById('cropModal').classList.remove('active');
        imageArea.innerHTML = `
            <button class="crop-btn-icon" id="cropBtn">✂️ Crop</button>
            <button class="remove-btn-icon" id="removeBtn">×</button>
            <img src="${newCanvas.toDataURL('image/jpeg', 1.0)}" id="previewImg">
        `;
        document.getElementById('cropBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            openCropModal();
        });
        document.getElementById('removeBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            removeImage();
        });
        document.getElementById('previewImg').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 1.0);
}