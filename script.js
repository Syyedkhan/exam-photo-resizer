/* ============================================
   Photo Resizer - Photo + Signature (2 Boxes)
   + Merger (PI7 Style)
   + FIXED CROP (poori image dikhti hai)
   + BEST QUALITY (exam requirement bhi poori)
   ============================================ */

// ============ PHOTO BOX ============
const photoInput = document.getElementById('photoInput');
const photoImageArea = document.getElementById('photoImageArea');
const photoFileName = document.getElementById('photoFileName');
const photoWidth = document.getElementById('photoWidth');
const photoHeight = document.getElementById('photoHeight');
const photoSize = document.getElementById('photoSize');
const photoResizeBtn = document.getElementById('photoResizeBtn');
const photoDownloadBtn = document.getElementById('photoDownloadBtn');
const photoBadgeW = document.getElementById('photoBadgeW');
const photoBadgeH = document.getElementById('photoBadgeH');

let photoImg = null;
let photoCanvas = null;
let photoName = '';

// ============ SIGNATURE BOX ============
const signInput = document.getElementById('signInput');
const signImageArea = document.getElementById('signImageArea');
const signFileName = document.getElementById('signFileName');
const signWidth = document.getElementById('signWidth');
const signHeight = document.getElementById('signHeight');
const signSize = document.getElementById('signSize');
const signResizeBtn = document.getElementById('signResizeBtn');
const signDownloadBtn = document.getElementById('signDownloadBtn');
const signBadgeW = document.getElementById('signBadgeW');
const signBadgeH = document.getElementById('signBadgeH');

let signImg = null;
let signCanvas = null;
let signName = '';

// ============ PHOTO SETUP ============
if (photoImageArea) {
    photoImageArea.addEventListener('click', function() {
        photoInput.click();
    });
    photoImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    photoImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadPhoto(file);
    });
}

if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) loadPhoto(file);
    });
}

function loadPhoto(file) {
    photoName = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            photoImg = img;
            if (photoFileName) photoFileName.textContent = file.name;
            if (photoResizeBtn) photoResizeBtn.disabled = false;
            if (photoDownloadBtn) photoDownloadBtn.style.display = 'none';

            photoImageArea.innerHTML = `
                <button class="crop-btn-icon" id="photoCropBtn">✂️ Crop</button>
                <button class="remove-btn-icon" id="photoRemoveBtn">×</button>
                <img src="${event.target.result}" id="photoPreviewImg">
            `;
            document.getElementById('photoCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('photo');
            });
            document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removePhoto();
            });
            document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    photoImg = null;
    photoCanvas = null;
    if (photoInput) photoInput.value = '';
    if (photoFileName) photoFileName.textContent = '';
    if (photoResizeBtn) photoResizeBtn.disabled = true;
    if (photoDownloadBtn) photoDownloadBtn.style.display = 'none';
    photoImageArea.innerHTML = `
        <div class="empty-state">
            <p>📁 Click to select a photo</p>
            <p style="font-size:13px;color:#999;">or drag & drop here</p>
        </div>
    `;
}

if (photoWidth) {
    photoWidth.addEventListener('input', function() {
        if (photoBadgeW) photoBadgeW.textContent = 'W-' + (this.value || '0');
    });
}
if (photoHeight) {
    photoHeight.addEventListener('input', function() {
        if (photoBadgeH) photoBadgeH.textContent = 'H-' + (this.value || '0');
    });
}

if (photoResizeBtn) {
    photoResizeBtn.addEventListener('click', function() {
        if (!photoImg) return;
        const tw = parseInt(photoWidth.value) || 200;
        const th = parseInt(photoHeight.value) || 230;
        const tkb = parseInt(photoSize.value) || 50;
        const result = resizeImage(photoImg, tw, th, tkb);
        photoCanvas = result.canvas;
        if (photoDownloadBtn) {
            photoDownloadBtn.style.display = 'block';
            photoDownloadBtn.textContent = `⬇ Download Photo (${result.sizeKB.toFixed(1)} KB)`;
        }
        photoImageArea.innerHTML = `
            <button class="remove-btn-icon" id="photoRemoveBtn">×</button>
            <img src="${result.dataUrl}" id="photoPreviewImg">
        `;
        document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            removePhoto();
        });
        document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

if (photoDownloadBtn) {
    photoDownloadBtn.addEventListener('click', function() {
        if (!photoCanvas) return;
        const tw = parseInt(photoWidth.value) || 200;
        const th = parseInt(photoHeight.value) || 230;
        const tkb = parseInt(photoSize.value) || 50;
        const result = resizeImage(photoImg, tw, th, tkb);
        const link = document.createElement('a');
        link.download = 'ibps-photo.jpg';
        link.href = result.dataUrl;
        link.click();
    });
}

// ============ SIGNATURE SETUP ============
if (signImageArea) {
    signImageArea.addEventListener('click', function() {
        signInput.click();
    });
    signImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    signImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadSign(file);
    });
}

if (signInput) {
    signInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) loadSign(file);
    });
}

function loadSign(file) {
    signName = file.name;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            signImg = img;
            if (signFileName) signFileName.textContent = file.name;
            if (signResizeBtn) signResizeBtn.disabled = false;
            if (signDownloadBtn) signDownloadBtn.style.display = 'none';

            signImageArea.innerHTML = `
                <button class="crop-btn-icon" id="signCropBtn">✂️ Crop</button>
                <button class="remove-btn-icon" id="signRemoveBtn">×</button>
                <img src="${event.target.result}" id="signPreviewImg">
            `;
            document.getElementById('signCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('signature');
            });
            document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removeSign();
            });
            document.getElementById('signPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removeSign() {
    signImg = null;
    signCanvas = null;
    if (signInput) signInput.value = '';
    if (signFileName) signFileName.textContent = '';
    if (signResizeBtn) signResizeBtn.disabled = true;
    if (signDownloadBtn) signDownloadBtn.style.display = 'none';
    signImageArea.innerHTML = `
        <div class="empty-state">
            <p>📁 Click to select a signature</p>
            <p style="font-size:13px;color:#999;">or drag & drop here</p>
        </div>
    `;
}

if (signWidth) {
    signWidth.addEventListener('input', function() {
        if (signBadgeW) signBadgeW.textContent = 'W-' + (this.value || '0');
    });
}
if (signHeight) {
    signHeight.addEventListener('input', function() {
        if (signBadgeH) signBadgeH.textContent = 'H-' + (this.value || '0');
    });
}

if (signResizeBtn) {
    signResizeBtn.addEventListener('click', function() {
        if (!signImg) return;
        const tw = parseInt(signWidth.value) || 140;
        const th = parseInt(signHeight.value) || 60;
        const tkb = parseInt(signSize.value) || 20;
        const result = resizeImage(signImg, tw, th, tkb);
        signCanvas = result.canvas;
        if (signDownloadBtn) {
            signDownloadBtn.style.display = 'block';
            signDownloadBtn.textContent = `⬇ Download Signature (${result.sizeKB.toFixed(1)} KB)`;
        }
        signImageArea.innerHTML = `
            <button class="remove-btn-icon" id="signRemoveBtn">×</button>
            <img src="${result.dataUrl}" id="signPreviewImg">
        `;
        document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            removeSign();
        });
        document.getElementById('signPreviewImg').addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

if (signDownloadBtn) {
    signDownloadBtn.addEventListener('click', function() {
        if (!signCanvas) return;
        const tw = parseInt(signWidth.value) || 140;
        const th = parseInt(signHeight.value) || 60;
        const tkb = parseInt(signSize.value) || 20;
        const result = resizeImage(signImg, tw, th, tkb);
        const link = document.createElement('a');
        link.download = 'ibps-signature.jpg';
        link.href = result.dataUrl;
        link.click();
    });
}

// ============ COMMON RESIZE FUNCTION (BEST QUALITY) ============
function resizeImage(sourceImg, targetW, targetH, targetKB) {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // ✅ High quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White background (JPEG ke liye zaroori)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Cover mode — poori jagah fill kare, aspect ratio maintain
    const scale = Math.max(targetW / sourceImg.width, targetH / sourceImg.height);
    const drawW = sourceImg.width * scale;
    const drawH = sourceImg.height * scale;
    const x = (targetW - drawW) / 2;
    const y = (targetH - drawH) / 2;

    ctx.drawImage(sourceImg, x, y, drawW, drawH);

    // ✅ Smart quality — 1.0 se start karo
    let quality = 1.0;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let sizeKB = (dataUrl.length * 0.75) / 1024;

    // Step 1: Quality kam karo (1.0 → 0.7) — sirf 30% tak
    while (sizeKB > targetKB && quality > 0.7) {
        quality -= 0.02;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = (dataUrl.length * 0.75) / 1024;
    }

    // Step 2: Agar 0.7 par bhi size bada — dimensions kam karo
    if (sizeKB > targetKB) {
        let currentW = targetW;
        let currentH = targetH;
        let workCanvas = canvas;

        while (sizeKB > targetKB && currentW > 80) {
            currentW = Math.round(currentW * 0.9);
            currentH = Math.round(currentH * 0.9);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentW;
            tempCanvas.height = currentH;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, currentW, currentH);
            tempCtx.drawImage(workCanvas, 0, 0, currentW, currentH);

            dataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);
            sizeKB = (dataUrl.length * 0.75) / 1024;
            workCanvas = tempCanvas;
        }
    }

    return { canvas, dataUrl, sizeKB };
}

// ============ CROP FUNCTIONALITY (FIXED) ============
let cropTarget = 'photo';
let cropBox = { x: 75, y: 75, w: 350, h: 350 };
let cropBoxDragging = false;
let cropBoxResizing = false;
let cropResizeHandle = '';
let cropBoxStartX = 0, cropBoxStartY = 0;
let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const CROP_CANVAS_SIZE = 500;

function openCropModal(target) {
    cropTarget = target;
    const img = target === 'photo' ? photoImg : signImg;
    if (!img) return;

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

    const size = CROP_CANVAS_SIZE;
    const imgAspect = img.width / img.height;

    let boxW, boxH;
    if (imgAspect > 1) {
        boxW = size * 0.8;
        boxH = size * 0.6;
    } else if (imgAspect < 1) {
        boxW = size * 0.6;
        boxH = size * 0.8;
    } else {
        boxW = size * 0.7;
        boxH = size * 0.7;
    }

    cropBox = {
        x: (size - boxW) / 2,
        y: (size - boxH) / 2,
        w: boxW,
        h: boxH
    };

    modal.classList.add('active');
    drawCropCanvas();
}

function drawCropCanvas() {
    const canvas = document.getElementById('cropCanvas');
    const img = cropTarget === 'photo' ? photoImg : signImg;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = CROP_CANVAS_SIZE;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2;
    const y = (size - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
    const img = cropTarget === 'photo' ? photoImg : signImg;
    if (!canvas || !img) return;

    const size = CROP_CANVAS_SIZE;
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
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
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, cropBox.w, cropBox.h);
    newCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, cropBox.w, cropBox.h);

    const croppedImg = new Image();
    croppedImg.onload = function() {
        const dataUrl = newCanvas.toDataURL('image/jpeg', 1.0);

        if (cropTarget === 'photo') {
            photoImg = croppedImg;
            photoImageArea.innerHTML = `
                <button class="crop-btn-icon" id="photoCropBtn">✂️ Crop</button>
                <button class="remove-btn-icon" id="photoRemoveBtn">×</button>
                <img src="${dataUrl}" id="photoPreviewImg">
            `;
            document.getElementById('photoCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('photo');
            });
            document.getElementById('photoRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removePhoto();
            });
            document.getElementById('photoPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        } else {
            signImg = croppedImg;
            signImageArea.innerHTML = `
                <button class="crop-btn-icon" id="signCropBtn">✂️ Crop</button>
                <button class="remove-btn-icon" id="signRemoveBtn">×</button>
                <img src="${dataUrl}" id="signPreviewImg">
            `;
            document.getElementById('signCropBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                openCropModal('signature');
            });
            document.getElementById('signRemoveBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                removeSign();
            });
            document.getElementById('signPreviewImg').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        document.getElementById('cropModal').classList.remove('active');
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 1.0);
}

// ============ PHOTO MERGER ============
const mergeInput = document.getElementById('mergeInput');
const mergeGrid = document.getElementById('mergeGrid');
const mergeStatus = document.getElementById('mergeStatus');
const mergeBtn = document.getElementById('mergeBtn');
const mergeDownloadBtn = document.getElementById('mergeDownloadBtn');
const mergeCanvas = document.getElementById('mergeCanvas');
const mergePreviewBox = document.getElementById('mergePreviewBox');

let mergePhotos = [];
let mergedBlob = null;

if (mergeInput) {
    mergeInput.addEventListener('change', function(e) {
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
        mergeInput.value = '';
    });
}

function renderMergeGrid() {
    if (!mergeGrid) return;
    mergeGrid.innerHTML = '';
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
    const addBox = document.createElement('div');
    addBox.className = 'merge-item';
    addBox.innerHTML = `
        <div class="add-photo-inner" id="addMoreBtn">
            <span style="font-size:32px;">+</span>
            <p style="font-size:13px;color:#718096;margin-top:6px;">Add Photo</p>
        </div>
    `;
    mergeGrid.appendChild(addBox);
    mergeGrid.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openMergeCropModal(parseInt(this.dataset.index));
        });
    });
    mergeGrid.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            mergePhotos.splice(parseInt(this.dataset.index), 1);
            renderMergeGrid();
        });
    });
    const addMoreBtn = document.getElementById('addMoreBtn');
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function() {
            mergeInput.click();
        });
    }
    if (mergeStatus) {
        if (mergePhotos.length === 0) {
            mergeStatus.textContent = 'Select 2 or more images to merge.';
        } else if (mergePhotos.length === 1) {
            mergeStatus.textContent = '1 image selected. Add 1 more.';
        } else {
            mergeStatus.textContent = `✅ ${mergePhotos.length} images selected.`;
        }
    }
    if (mergeBtn) mergeBtn.disabled = mergePhotos.length < 2;
    if (mergeDownloadBtn) mergeDownloadBtn.style.display = 'none';
    if (mergePreviewBox) mergePreviewBox.style.display = 'none';
    mergedBlob = null;
}

// ============ MERGE CROP MODAL (FIXED) ============
let mergeCropIndex = -1;
let mergeCropBox = { x: 75, y: 75, w: 350, h: 350 };
let mergeCropDragging = false;
let mergeCropResizing = false;
let mergeCropResizeHandle = '';
let mergeCropStartX = 0, mergeCropStartY = 0;
let mergeCropBoxStart = { x: 0, y: 0, w: 0, h: 0 };
const MERGE_CROP_SIZE = 500;

function openMergeCropModal(index) {
    mergeCropIndex = index;
    const photo = mergePhotos[index];
    if (!photo) return;

    let modal = document.getElementById('mergeCropModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mergeCropModal';
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-modal-content">
                <h3>✂️ Crop Image</h3>
                <p style="font-size:13px; color:#718096;">Drag corners to resize. Drag inside to move.</p>
                <div class="crop-canvas-wrapper">
                    <canvas id="mergeCropCanvas"></canvas>
                </div>
                <div class="crop-controls">
                    <button class="btn-cancel" id="mergeCropCancelBtn">Cancel</button>
                    <button class="btn-save" id="mergeCropSaveBtn">Save Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setupMergeCropEvents();
    }

    const img = photo.croppedImg;
    const size = MERGE_CROP_SIZE;
    const imgAspect = img.width / img.height;

    let boxW, boxH;
    if (imgAspect > 1) {
        boxW = size * 0.8;
        boxH = size * 0.6;
    } else if (imgAspect < 1) {
        boxW = size * 0.6;
        boxH = size * 0.8;
    } else {
        boxW = size * 0.7;
        boxH = size * 0.7;
    }

    mergeCropBox = {
        x: (size - boxW) / 2,
        y: (size - boxH) / 2,
        w: boxW,
        h: boxH
    };

    modal.classList.add('active');
    drawMergeCropCanvas();
}

function drawMergeCropCanvas() {
    const canvas = document.getElementById('mergeCropCanvas');
    if (!canvas || mergeCropIndex === -1) return;
    const photo = mergePhotos[mergeCropIndex];
    if (!photo) return;

    const img = photo.croppedImg;
    const ctx = canvas.getContext('2d');
    const size = MERGE_CROP_SIZE;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (size - drawW) / 2;
    const y = (size - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, size, mergeCropBox.y);
    ctx.fillRect(0, mergeCropBox.y + mergeCropBox.h, size, size - mergeCropBox.y - mergeCropBox.h);
    ctx.fillRect(0, mergeCropBox.y, mergeCropBox.x, mergeCropBox.h);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w, mergeCropBox.y, size - mergeCropBox.x - mergeCropBox.w, mergeCropBox.h);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(mergeCropBox.x, mergeCropBox.y, mergeCropBox.w, mergeCropBox.h);

    ctx.fillStyle = '#667eea';
    const hs = 14;
    ctx.fillRect(mergeCropBox.x - hs/2, mergeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w - hs/2, mergeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x - hs/2, mergeCropBox.y + mergeCropBox.h - hs/2, hs, hs);
    ctx.fillRect(mergeCropBox.x + mergeCropBox.w - hs/2, mergeCropBox.y + mergeCropBox.h - hs/2, hs, hs);
}

function setupMergeCropEvents() {
    const canvas = document.getElementById('mergeCropCanvas');
    const modal = document.getElementById('mergeCropModal');
    const saveBtn = document.getElementById('mergeCropSaveBtn');
    const cancelBtn = document.getElementById('mergeCropCancelBtn');

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
        const { x, y, w, h } = mergeCropBox;
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
            mergeCropDragging = true;
        } else {
            mergeCropResizing = true;
            mergeCropResizeHandle = handle;
        }
        mergeCropStartX = pos.x;
        mergeCropStartY = pos.y;
        mergeCropBoxStart = { ...mergeCropBox };
        if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
        if (!mergeCropDragging && !mergeCropResizing) return;
        const pos = getMousePos(e);
        const dx = pos.x - mergeCropStartX;
        const dy = pos.y - mergeCropStartY;
        const size = MERGE_CROP_SIZE;
        const minSize = 50;

        if (mergeCropDragging) {
            let nx = mergeCropBoxStart.x + dx;
            let ny = mergeCropBoxStart.y + dy;
            nx = Math.max(0, Math.min(size - mergeCropBox.w, nx));
            ny = Math.max(0, Math.min(size - mergeCropBox.h, ny));
            mergeCropBox.x = nx;
            mergeCropBox.y = ny;
        } else {
            let { x, y, w, h } = mergeCropBoxStart;
            if (mergeCropResizeHandle === 'tl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                mergeCropBox.w = x + w - nx;
                mergeCropBox.h = y + h - ny;
                mergeCropBox.x = nx;
                mergeCropBox.y = ny;
            } else if (mergeCropResizeHandle === 'tr') {
                let ny = Math.max(0, Math.min(y + h - minSize, y + dy));
                mergeCropBox.h = y + h - ny;
                mergeCropBox.y = ny;
                mergeCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
            } else if (mergeCropResizeHandle === 'bl') {
                let nx = Math.max(0, Math.min(x + w - minSize, x + dx));
                mergeCropBox.w = x + w - nx;
                mergeCropBox.x = nx;
                mergeCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            } else if (mergeCropResizeHandle === 'br') {
                mergeCropBox.w = Math.max(minSize, Math.min(size - x, w + dx));
                mergeCropBox.h = Math.max(minSize, Math.min(size - y, h + dy));
            }
        }
        drawMergeCropCanvas();
        if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
        mergeCropDragging = false;
        mergeCropResizing = false;
        mergeCropResizeHandle = '';
    }

    if (canvas) {
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    if (saveBtn) saveBtn.addEventListener('click', saveMergeCrop);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
}

function saveMergeCrop() {
    const canvas = document.getElementById('mergeCropCanvas');
    if (!canvas || mergeCropIndex === -1) return;
    const photo = mergePhotos[mergeCropIndex];
    if (!photo) return;

    const img = photo.croppedImg;
    const size = MERGE_CROP_SIZE;
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const imgX = (size - drawW) / 2;
    const imgY = (size - drawH) / 2;

    const srcX = (mergeCropBox.x - imgX) / scale;
    const srcY = (mergeCropBox.y - imgY) / scale;
    const srcW = mergeCropBox.w / scale;
    const srcH = mergeCropBox.h / scale;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = mergeCropBox.w;
    newCanvas.height = mergeCropBox.h;
    const newCtx = newCanvas.getContext('2d', { alpha: false });
    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.fillStyle = '#ffffff';
    newCtx.fillRect(0, 0, mergeCropBox.w, mergeCropBox.h);
    newCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, mergeCropBox.w, mergeCropBox.h);

    const croppedImg = new Image();
    croppedImg.onload = function() {
        mergePhotos[mergeCropIndex].croppedImg = croppedImg;
        renderMergeGrid();
        document.getElementById('mergeCropModal').classList.remove('active');
        mergeCropIndex = -1;
    };
    croppedImg.src = newCanvas.toDataURL('image/jpeg', 0.95);
}

// ============ MERGE FUNCTION ============
if (mergeBtn) {
    mergeBtn.addEventListener('click', function() {
        if (mergePhotos.length < 2 || !mergeCanvas) return;

        const direction = document.querySelector('input[name="direction"]:checked').value;
        const addBorder = document.getElementById('addBorder').checked;

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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        let x = 0, y = 0;
        if (direction === 'horizontal') {
            images.forEach((img) => {
                const drawW = img.width * canvasH / img.height;
                ctx.drawImage(img, x, 0, drawW, canvasH);
                if (addBorder) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, 0, drawW, canvasH);
                }
                x += drawW;
            });
        } else if (direction === 'vertical') {
            images.forEach((img) => {
                const drawH = img.height * canvasW / img.width;
                ctx.drawImage(img, 0, y, canvasW, drawH);
                if (addBorder) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
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
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x + offsetX, y + offsetY, drawW, drawH);
                }
            });
        }

        if (mergePreviewBox) mergePreviewBox.style.display = 'block';
        mergeCanvas.toBlob(function(blob) {
            mergedBlob = blob;
            if (mergeDownloadBtn) mergeDownloadBtn.style.display = 'block';
        }, 'image/jpeg', 0.95);
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 1.0;
    function tryCompress() {
        canvas.toBlob(function(blob) {
            const sizeKB = blob.size / 1024;
            if (sizeKB <= targetKB || quality <= 0.4) {
                callback(blob);
            } else {
                quality -= 0.05;
                tryCompress();
            }
        }, 'image/jpeg', quality);
    }
    tryCompress();
}

if (compressBtn) {
    compressBtn.addEventListener('click', function() {
        if (!compressImage) return;
        const targetKB = parseInt(targetSize.value) || 100;
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