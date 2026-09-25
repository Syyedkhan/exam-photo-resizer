/* ============================================
   Photo Resizer - Simple Script
   ============================================ */

// ============ ELEMENTS ============
const photoInput = document.getElementById('photoInput');
const docType = document.getElementById('docType');
const previewCanvas = document.getElementById('previewCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const cropBtn = document.getElementById('cropBtn');
const previewCard = document.getElementById('previewCard');

let uploadedImage = null;
let targetW = 200;
let targetH = 230;

// ============ DOCUMENT TYPE CHANGE ============
if (docType) {
    docType.addEventListener('change', function() {
        if (this.value === 'signature') {
            targetW = 140;
            targetH = 60;
        } else {
            targetW = 200;
            targetH = 230;
        }
        if (uploadedImage) showPreview();
    });
}

// ============ FILE SELECT ============
if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                showPreview();
                if (previewCard) previewCard.style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============ SHOW PREVIEW ============
function showPreview() {
    if (!uploadedImage || !previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');

    previewCanvas.width = targetW;
    previewCanvas.height = targetH;

    previewCanvas.style.width = targetW + 'px';
    previewCanvas.style.height = targetH + 'px';
    previewCanvas.style.maxWidth = '100%';
    previewCanvas.style.display = 'block';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Fit image to canvas
    const scale = Math.max(targetW / uploadedImage.width, targetH / uploadedImage.height);
    const drawW = uploadedImage.width * scale;
    const drawH = uploadedImage.height * scale;
    const x = (targetW - drawW) / 2;
    const y = (targetH - drawH) / 2;

    ctx.drawImage(uploadedImage, x, y, drawW, drawH);

    if (downloadBtn) downloadBtn.disabled = false;
}

// ============ DOWNLOAD ============
function downloadPhoto() {
    if (!previewCanvas || !uploadedImage) return;
    const prefix = (docType && docType.value === 'signature') ? 'ibps-signature' : 'ibps-photo';
    const link = document.createElement('a');
    link.download = prefix + '.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
}
if (downloadBtn) downloadBtn.addEventListener('click', downloadPhoto);

// ============ CROP FUNCTIONALITY ============
let cropBox = { x: 75, y: 75, w: 350, h: 350 };
let cropBoxDragging = false;
let cropBoxResizing = false;
let cropResizeHandle = '';
let cropBoxStartX = 0, cropBoxStartY = 0;
let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const CROP_CANVAS_SIZE = 500;

if (cropBtn) {
    cropBtn.addEventListener('click', function() {
        if (!uploadedImage) return;
        openCropModal();
    });
}

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
        showPreview();
        document.getElementById('cropModal').classList.remove('active');
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 1.0);
}