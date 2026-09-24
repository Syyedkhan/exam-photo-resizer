/* ============================================
   Photo Resizer - Script (Complete)
   ============================================ */

// ============ PHOTO RESIZER ============
const photoInput = document.getElementById('photoInput');
const examSelect = document.getElementById('examSelect');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');

let uploadedImage = null;
let offsetX = 0, offsetY = 0, zoom = 1;
let isDragging = false, startX = 0, startY = 0;
let targetW = 0, targetH = 0;

const examSpecs = {
    'ibps': { photoW: 200, photoH: 230 },
    'ssc-cgl': { photoW: 100, photoH: 120 },
    'rrb': { photoW: 320, photoH: 240 },
    'neet': { photoW: 200, photoH: 230 },
    'upsc': { photoW: 350, photoH: 450 },
        'us-passport': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
    'us-visa': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
        'uk-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: '50 KB - 10 MB', sigSize: '-' },
        'uk-visa': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
        'schengen': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
    'schengen-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
    'canada-passport': { photoW: 591, photoH: 827, sigW: 0, sigH: 0, photoSize: 'Under 4 MB', sigSize: '-' },
    'canada-passport': { photoW: 591, photoH: 827 },
        'canada-visa': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
    'australia-passport': { photoW: 413, photoH: 531 }
        'australia-visa': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
};

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
                showPreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (examSelect) {
    examSelect.addEventListener('change', function() {
        if (uploadedImage) { offsetX = 0; offsetY = 0; showPreview(); }
    });
}

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
        statusText.textContent = exam ? `${exam.toUpperCase()} - ${targetW}x${targetH} px` : `Original: ${targetW}x${targetH} px`;
    }
    if (downloadBtn) downloadBtn.disabled = false;
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
}

function downloadPhoto() {
    if (!previewCanvas || !uploadedImage) return;
    const link = document.createElement('a');
    link.download = 'photo.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}
if (downloadBtn) downloadBtn.addEventListener('click', downloadPhoto);


// ============ PHOTO COMPRESSOR ============
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
                if (compressPreview) { compressPreview.src = event.target.result; compressPreview.style.display = 'block'; }
                if (compressStatus) compressStatus.textContent = `Original: ${(file.size / 1024).toFixed(1)} KB`;
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
    let width = img.width, height = img.height;
    if (width > 1200 || height > 1200) {
        if (width > height) { height = (height / width) * 1200; width = 1200; }
        else { width = (width / height) * 1200; height = 1200; }
    }
    canvas.width = width; canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    let quality = 0.9;
    function tryCompress() {
        canvas.toBlob(function(blob) {
            if (blob.size / 1024 <= targetKB || quality <= 0.1) callback(blob);
            else { quality -= 0.1; tryCompress(); }
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
            if (compressPreview) compressPreview.src = URL.createObjectURL(blob);
            if (compressStatus) compressStatus.textContent = `✅ ${(blob.size / 1024).toFixed(1)} KB (Target: ${targetKB} KB)`;
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


// ============ PHOTO MERGER ============
const mergeFileInput = document.getElementById('mergeInput');
const mergeGrid = document.getElementById('mergeGrid');
const addMoreBtn = document.getElementById('addMoreBtn');
const mergeBtn = document.getElementById('mergeBtn');
const mergeDownloadBtn = document.getElementById('mergeDownloadBtn');
const mergeCanvas = document.getElementById('mergeCanvas');
const mergePreviewText = document.getElementById('mergePreviewText');
const mergeStatusMsg = document.getElementById('mergeStatus');

let mergePhotos = [];
let mergedBlob = null;

if (mergeFileInput) {
    mergeFileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    mergePhotos.push({
                        id: Date.now() + Math.random(),
                        img: img,
                        croppedImg: img,
                        name: file.name
                    });
                    renderMergeGrid();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        mergeFileInput.value = '';
    });
}

function renderMergeGrid() {
    if (!mergeGrid) return;
    mergeGrid.innerHTML = '';
    if (mergePhotos.length === 0) {
        if (mergeStatusMsg) mergeStatusMsg.textContent = 'Select 2 or more photos to merge.';
        if (addMoreBtn) addMoreBtn.style.display = 'none';
        if (mergeBtn) mergeBtn.disabled = true;
        return;
    }
    mergePhotos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'merge-item';
        div.innerHTML = `
            <button class="crop-btn" data-index="${index}">✂️ Crop</button>
            <button class="remove-btn" data-index="${index}">×</button>
            <img src="${photo.croppedImg.src}" alt="Photo">
            <div class="file-name">${photo.name || 'Photo ' + (index + 1)}</div>
        `;
        mergeGrid.appendChild(div);
    });
    mergeGrid.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', function() { openCropModal(parseInt(this.dataset.index)); });
    });
    mergeGrid.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            mergePhotos.splice(parseInt(this.dataset.index), 1);
            renderMergeGrid();
        });
    });
    if (mergeStatusMsg) mergeStatusMsg.textContent = `✅ ${mergePhotos.length} photo(s) loaded.`;
    if (addMoreBtn) addMoreBtn.style.display = 'block';
    if (mergeBtn) mergeBtn.disabled = mergePhotos.length < 2;
    if (mergeDownloadBtn) mergeDownloadBtn.disabled = true;
    mergedBlob = null;
}

if (addMoreBtn) {
    addMoreBtn.addEventListener('click', function() { if (mergeFileInput) mergeFileInput.click(); });
}

// ============ CROP MODAL (With Crop Box) ============
let currentCropIndex = -1;
let cropOffsetX = 0, cropOffsetY = 0, cropZoom = 1;
let cropBox = { x: 75, y: 75, w: 350, h: 350 };
let cropBoxDragging = false;
let cropBoxResizing = false;
let cropResizeHandle = '';
let cropBoxStartX = 0, cropBoxStartY = 0;
let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const CROP_CANVAS_SIZE = 500;

function openCropModal(index) {
    currentCropIndex = index;
    const photo = mergePhotos[index];
    if (!photo) return;

    let modal = document.getElementById('cropModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cropModal';
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-modal-content">
                <h3>✂️ Crop Photo</h3>
                <p style="font-size:13px; color:#718096;">Drag corners to resize. Drag inside to move.</p>
                <div class="crop-canvas-wrapper">
                    <canvas id="cropCanvas"></canvas>
                </div>
                <div class="crop-zoom-row">
                    <label>Zoom:</label>
                    <input type="range" id="cropZoom" min="50" max="300" value="100">
                    <span id="cropZoomValue">100%</span>
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

    cropOffsetX = 0; cropOffsetY = 0; cropZoom = 1;
    cropBox = { x: 75, y: 75, w: 350, h: 350 };
    modal.classList.add('active');

    const zoomSlider = document.getElementById('cropZoom');
    const zoomLabel = document.getElementById('cropZoomValue');
    if (zoomSlider) zoomSlider.value = 100;
    if (zoomLabel) zoomLabel.textContent = '100%';

    drawCropCanvas();
}

function drawCropCanvas() {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas || currentCropIndex === -1) return;
    const photo = mergePhotos[currentCropIndex];
    if (!photo) return;
    const img = photo.croppedImg;
    const ctx = canvas.getContext('2d');
    const size = CROP_CANVAS_SIZE;

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.max(size / img.width, size / img.height) * cropZoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2 + cropOffsetX;
    const y = (size - drawH) / 2 + cropOffsetY;

    ctx.drawImage(img, x, y, drawW, drawH);

    // Dark overlay outside crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, size, cropBox.y);
    ctx.fillRect(0, cropBox.y + cropBox.h, size, size - cropBox.y - cropBox.h);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
    ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, size - cropBox.x - cropBox.w, cropBox.h);

    // Crop box border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cropBox.x + cropBox.w / 3, cropBox.y);
    ctx.lineTo(cropBox.x + cropBox.w / 3, cropBox.y + cropBox.h);
    ctx.moveTo(cropBox.x + 2 * cropBox.w / 3, cropBox.y);
    ctx.lineTo(cropBox.x + 2 * cropBox.w / 3, cropBox.y + cropBox.h);
    ctx.moveTo(cropBox.x, cropBox.y + cropBox.h / 3);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h / 3);
    ctx.moveTo(cropBox.x, cropBox.y + 2 * cropBox.h / 3);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + 2 * cropBox.h / 3);
    ctx.stroke();

    // Corner handles
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
    const zoomSlider = document.getElementById('cropZoom');
    const zoomLabel = document.getElementById('cropZoomValue');
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

        canvas.addEventListener('mousemove', function(e) {
            const pos = getMousePos(e);
            const handle = getHandleAt(pos.x, pos.y);
            if (handle === 'move') canvas.style.cursor = 'move';
            else if (handle === 'tl' || handle === 'br') canvas.style.cursor = 'nwse-resize';
            else if (handle === 'tr' || handle === 'bl') canvas.style.cursor = 'nesw-resize';
            else canvas.style.cursor = 'crosshair';
        });
    }

    if (zoomSlider) {
        zoomSlider.addEventListener('input', function() {
            cropZoom = parseInt(this.value) / 100;
            if (zoomLabel) zoomLabel.textContent = this.value + '%';
            drawCropCanvas();
        });
    }

    if (saveBtn) saveBtn.addEventListener('click', saveCrop);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            currentCropIndex = -1;
        });
    }
}

function saveCrop() {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas || currentCropIndex === -1) return;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = cropBox.w;
    newCanvas.height = cropBox.h;
    const newCtx = newCanvas.getContext('2d');

    newCtx.drawImage(
        canvas,
        cropBox.x, cropBox.y, cropBox.w, cropBox.h,
        0, 0, cropBox.w, cropBox.h
    );

    const croppedImg = new Image();
    croppedImg.onload = function() {
        mergePhotos[currentCropIndex].croppedImg = croppedImg;
        renderMergeGrid();
        document.getElementById('cropModal').classList.remove('active');
        currentCropIndex = -1;
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 0.9);
}

// ============ MERGE ============
if (mergeBtn) {
    mergeBtn.addEventListener('click', function() {
        if (mergePhotos.length < 2 || !mergeCanvas) return;
        const direction = document.querySelector('input[name="direction"]:checked').value;
        const addBorder = document.getElementById('addBorder').checked;
        const borderColor = document.getElementById('borderColor').value;
        const borderWidth = parseInt(document.getElementById('borderWidth').value) || 5;
        const ctx = mergeCanvas.getContext('2d');
        const images = mergePhotos.map(p => p.croppedImg);
        let canvasW, canvasH;

        if (direction === 'horizontal') {
            canvasH = Math.max(...images.map(img => img.height));
            canvasW = images.reduce((sum, img) => sum + (img.width * canvasH / img.height), 0);
        } else if (direction === 'vertical') {
            canvasW = Math.max(...images.map(img => img.width));
            canvasH = images.reduce((sum, img) => sum + (img.height * canvasW / img.width), 0);
        } else {
            const cols = 2;
            const rows = Math.ceil(images.length / cols);
            const cellW = Math.max(...images.map(img => img.width));
            const cellH = Math.max(...images.map(img => img.height));
            canvasW = cellW * cols;
            canvasH = cellH * rows;
        }

        mergeCanvas.width = canvasW;
        mergeCanvas.height = canvasH;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        let x = 0, y = 0;
        if (direction === 'horizontal') {
            images.forEach((img) => {
                const drawW = img.width * canvasH / img.height;
                ctx.drawImage(img, x, 0, drawW, canvasH);
                if (addBorder) {
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = borderWidth;
                    ctx.strokeRect(x, 0, drawW, canvasH);
                }
                x += drawW;
            });
        } else if (direction === 'vertical') {
            images.forEach((img) => {
                const drawH = img.height * canvasW / img.width;
                ctx.drawImage(img, 0, y, canvasW, drawH);
                if (addBorder) {
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = borderWidth;
                    ctx.strokeRect(0, y, canvasW, drawH);
                }
                y += drawH;
            });
        } else {
            const cols = 2;
            const cellW = canvasW / cols;
            const cellH = canvasH / Math.ceil(images.length / cols);
            images.forEach((img, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * cellW;
                const y = row * cellH;
                const scale = Math.min(cellW / img.width, cellH / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const offsetX = (cellW - drawW) / 2;
                const offsetY = (cellH - drawH) / 2;
                ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
                if (addBorder) {
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = borderWidth;
                    ctx.strokeRect(x + offsetX, y + offsetY, drawW, drawH);
                }
            });
        }

        mergeCanvas.style.display = 'block';
        if (mergePreviewText) mergePreviewText.style.display = 'none';
        mergeCanvas.toBlob(function(blob) {
            mergedBlob = blob;
            if (mergeDownloadBtn) mergeDownloadBtn.disabled = false;
        }, 'image/jpeg', 0.9);
    });
}

if (mergeDownloadBtn) {
    mergeDownloadBtn.addEventListener('click', function() {
        if (!mergedBlob) return;
        const link = document.createElement('a');
        link.download = 'merged-photo.jpg';
        link.href = URL.createObjectURL(mergedBlob);
        link.click();
    });
}