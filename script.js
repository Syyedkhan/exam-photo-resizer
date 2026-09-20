// ================================
// EXAM PHOTO RESIZER - MAIN LOGIC
// ================================

// Exam presets - har exam ke exact specifications
const EXAM_PRESETS = {
    ibps_photo: { width: 200, height: 230, maxKB: 50, minKB: 20 },
    ibps_sign:  { width: 140, height: 60,  maxKB: 20, minKB: 10 },
    ssc_photo:  { width: 100, height: 120, maxKB: 50, minKB: 20 },
    ssc_sign:   { width: 140, height: 60,  maxKB: 20, minKB: 10 },
    rrb_photo:  { width: 320, height: 240, maxKB: 40, minKB: 15 }
};

// HTML elements
const photoInput = document.getElementById('photoInput');
const examSelect = document.getElementById('examSelect');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');

// Adjust controls
const adjustControls = document.getElementById('adjustControls');
const zoomSlider = document.getElementById('zoomSlider');
const ySlider = document.getElementById('ySlider');
const xSlider = document.getElementById('xSlider');
const zoomValue = document.getElementById('zoomValue');
const yValue = document.getElementById('yValue');
const xValue = document.getElementById('xValue');
const resetBtn = document.getElementById('resetBtn');

// Drag hint
const dragHint = document.getElementById('dragHint');

// State
let currentImage = null;
let zoom = 100;
let offsetX = 0;
let offsetY = 0;

// Drag state
let isDragging = false;
let hasDragged = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;

// ================================
// PHOTO SELECT
// ================================
photoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        statusText.textContent = '❌ Sirf image file select kariye (JPG/PNG)';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            resetAdjustments();
            adjustControls.style.display = 'block';
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// ================================
// EXAM CHANGE
// ================================
examSelect.addEventListener('change', function() {
    if (currentImage) {
        processImage();
    }
});

// ================================
// SLIDERS
// ================================
zoomSlider.addEventListener('input', function() {
    zoom = parseInt(this.value);
    zoomValue.textContent = zoom + '%';
    processImage();
});

ySlider.addEventListener('input', function() {
    offsetY = parseInt(this.value);
    yValue.textContent = offsetY;
    processImage();
});

xSlider.addEventListener('input', function() {
    offsetX = parseInt(this.value);
    xValue.textContent = offsetX;
    processImage();
});

resetBtn.addEventListener('click', function() {
    resetAdjustments();
    processImage();
});

function resetAdjustments() {
    zoom = 100;
    offsetX = 0;
    offsetY = 0;
    zoomSlider.value = 100;
    xSlider.value = 0;
    ySlider.value = 0;
    zoomValue.textContent = '100%';
    xValue.textContent = '0';
    yValue.textContent = '0';

    // Hint wapas dikhao
    hasDragged = false;
    if (dragHint) {
        dragHint.classList.remove('hide');
        dragHint.classList.add('show');
    }
}

// ================================
// MAIN PROCESSING
// ================================
function processImage() {
    if (!currentImage) return;

    const preset = EXAM_PRESETS[examSelect.value];
    const canvas = previewCanvas;
    canvas.width = preset.width;
    canvas.height = preset.height;

    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, preset.width, preset.height);

    // Zoom factor
    const zoomFactor = zoom / 100;

    // Base scale - image ko canvas me fit karo
    const baseScale = Math.max(
        preset.width / currentImage.width,
        preset.height / currentImage.height
    );
    const finalScale = baseScale * zoomFactor;

    // Final dimensions
    const drawWidth = currentImage.width * finalScale;
    const drawHeight = currentImage.height * finalScale;

    // Offset apply karo
    const offsetXPx = (offsetX / 100) * preset.width;
    const offsetYPx = (offsetY / 100) * preset.height;

    // Center + offset
    const drawX = (preset.width - drawWidth) / 2 + offsetXPx;
    const drawY = (preset.height - drawHeight) / 2 + offsetYPx;

    ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);

    canvas.classList.add('show');

    // Drag hint dikhao (agar abhi tak drag nahi kiya)
    if (!hasDragged) {
        dragHint.classList.add('show');
        dragHint.classList.remove('hide');
    }

    compressToTargetSize(canvas, preset);
}

// ================================
// DRAG - MOUSE
// ================================
previewCanvas.addEventListener('mousedown', function(e) {
    if (!currentImage) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffsetX = offsetX;
    dragStartOffsetY = offsetY;

    // Pehli baar drag - hint hide
    if (!hasDragged) {
        hasDragged = true;
        dragHint.classList.remove('show');
        dragHint.classList.add('hide');
    }
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

    const preset = EXAM_PRESETS[examSelect.value];
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    const newOffsetX = dragStartOffsetX + (dx / preset.width) * 100;
    const newOffsetY = dragStartOffsetY + (dy / preset.height) * 100;

    offsetX = Math.max(-100, Math.min(100, Math.round(newOffsetX)));
    offsetY = Math.max(-100, Math.min(100, Math.round(newOffsetY)));

    xSlider.value = offsetX;
    ySlider.value = offsetY;
    xValue.textContent = offsetX;
    yValue.textContent = offsetY;

    processImage();
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

// ================================
// DRAG - TOUCH (MOBILE)
// ================================
previewCanvas.addEventListener('touchstart', function(e) {
    if (!currentImage) return;
    const touch = e.touches[0];
    isDragging = true;
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    dragStartOffsetX = offsetX;
    dragStartOffsetY = offsetY;

    // Pehli baar drag - hint hide
    if (!hasDragged) {
        hasDragged = true;
        dragHint.classList.remove('show');
        dragHint.classList.add('hide');
    }
}, { passive: true });

previewCanvas.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const preset = EXAM_PRESETS[examSelect.value];
    const dx = touch.clientX - dragStartX;
    const dy = touch.clientY - dragStartY;

    const newOffsetX = dragStartOffsetX + (dx / preset.width) * 100;
    const newOffsetY = dragStartOffsetY + (dy / preset.height) * 100;

    offsetX = Math.max(-100, Math.min(100, Math.round(newOffsetX)));
    offsetY = Math.max(-100, Math.min(100, Math.round(newOffsetY)));

    xSlider.value = offsetX;
    ySlider.value = offsetY;
    xValue.textContent = offsetX;
    yValue.textContent = offsetY;

    processImage();
}, { passive: false });

previewCanvas.addEventListener('touchend', function() {
    isDragging = false;
});

// ================================
// COMPRESS TO TARGET SIZE
// ================================
function compressToTargetSize(canvas, preset) {
    let quality = 0.95;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let sizeKB = Math.round((dataUrl.length - 22) * 3 / 4 / 1024);

    let attempts = 0;
    while (sizeKB > preset.maxKB && quality > 0.1 && attempts < 15) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = Math.round((dataUrl.length - 22) * 3 / 4 / 1024);
        attempts++;
    }

    if (sizeKB >= preset.minKB && sizeKB <= preset.maxKB) {
        statusText.innerHTML = `✅ Ready! Size: <strong>${sizeKB} KB</strong> | Dimensions: <strong>${preset.width}×${preset.height}</strong>`;
    } else if (sizeKB < preset.minKB) {
        statusText.innerHTML = `⚠️ Size thoda kam: <strong>${sizeKB} KB</strong> (min ${preset.minKB} KB)`;
    } else {
        statusText.innerHTML = `⚠️ Size zyada: <strong>${sizeKB} KB</strong> (max ${preset.maxKB} KB)`;
    }

    downloadBtn.disabled = false;
    downloadBtn.dataset.dataUrl = dataUrl;
}

// ================================
// DOWNLOAD
// ================================
downloadBtn.addEventListener('click', function() {
    const dataUrl = downloadBtn.dataset.dataUrl;
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `exam-photo-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
});