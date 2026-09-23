/* ============================================
   Photo Resizer - Script (Drag + Zoom + Specs + Compressor + Merger)
   ============================================ */

// ============ PHOTO RESIZER ============
const photoInput = document.getElementById('photoInput');
const examSelect = document.getElementById('examSelect');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');

let uploadedImage = null;
let offsetX = 0;
let offsetY = 0;
let zoom = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let targetW = 0;
let targetH = 0;

const examSpecs = {
    'ibps': { photoW: 200, photoH: 230, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'ssc-cgl': { photoW: 100, photoH: 120, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'rrb': { photoW: 320, photoH: 240, sigW: 140, sigH: 60, photoSize: '20 KB - 50 KB', sigSize: '10 KB - 20 KB' },
    'neet': { photoW: 200, photoH: 230, sigW: 140, sigH: 60, photoSize: '10 KB - 200 KB', sigSize: '10 KB - 20 KB' },
    'upsc': { photoW: 350, photoH: 450, sigW: 140, sigH: 60, photoSize: '20 KB - 300 KB', sigSize: '10 KB - 20 KB' },
    'us-passport': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
    'us-visa': { photoW: 600, photoH: 600, sigW: 0, sigH: 0, photoSize: 'Under 240 KB', sigSize: '-' },
    'uk-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: '50 KB - 10 MB', sigSize: '-' },
    'schengen': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' },
    'canada-passport': { photoW: 591, photoH: 827, sigW: 0, sigH: 0, photoSize: 'Under 4 MB', sigSize: '-' },
    'australia-passport': { photoW: 413, photoH: 531, sigW: 0, sigH: 0, photoSize: 'Under 500 KB', sigSize: '-' }
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
let currentCropIndex = -1;
let cropOffsetX = 0, cropOffsetY = 0, cropZoom = 1;
let cropDragging = false, cropStartX = 0, cropStartY = 0;

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
                <div class="crop-canvas-wrapper"><canvas id="cropCanvas"></canvas></div>
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
    const size = 400;
    canvas.width = size; canvas.height = size;
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, size, size);
    const scale = Math.max(size / img.width, size / img.height) * cropZoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2 + cropOffsetX;
    const y = (size - drawH) / 2 + cropOffsetY;
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(50, 50, size - 100, size - 100);
    ctx.setLineDash([]);
}

function setupCropEvents() {
    const canvas = document.getElementById('cropCanvas');
    const modal = document.getElementById('cropModal');
    const zoomSlider = document.getElementById('cropZoom');
    const zoomLabel = document.getElementById('cropZoomValue');
    const saveBtn = document.getElementById('cropSaveBtn');
    const cancelBtn = document.getElementById('cropCancelBtn');

    if (canvas) {
        canvas.addEventListener('mousedown', function(e) {
            cropDragging = true;
            cropStartX = e.clientX - cropOffsetX;
            cropStartY = e.clientY - cropOffsetY;
        });
        document.addEventListener('mousemove', function(e) {
            if (!cropDragging) return;
            cropOffsetX = e.clientX - cropStartX;
            cropOffsetY = e.clientY - cropStartY;
            drawCropCanvas();
        });
        document.addEventListener('mouseup', function() { cropDragging = false; });
        canvas.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                cropDragging = true;
                cropStartX = e.touches[0].clientX - cropOffsetX;
                cropStartY = e.touches[0].clientY - cropOffsetY;
            }
        }, { passive: true });
        canvas.addEventListener('touchmove', function(e) {
            if (!cropDragging || e.touches.length !== 1) return;
            cropOffsetX = e.touches[0].clientX - cropStartX;
            cropOffsetY = e.touches[0].clientY - cropStartY;
            drawCropCanvas();
        }, { passive: true });
        canvas.addEventListener('touchend', function() { cropDragging = false; });
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
    const cropSize = 300;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = cropSize;
    newCanvas.height = cropSize;
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(canvas, 50, 50, 300, 300, 0, 0, cropSize, cropSize);
    const croppedImg = new Image();
    croppedImg.onload = function() {
        mergePhotos[currentCropIndex].croppedImg = croppedImg;
        renderMergeGrid();
        document.getElementById('cropModal').classList.remove('active');
        currentCropIndex = -1;
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 0.9);
}

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