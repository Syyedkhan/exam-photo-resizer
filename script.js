/* ============================================
   Exam Photo Resizer - Script
   ============================================ */

const photoInput = document.getElementById('photoInput');
const examSelect = document.getElementById('examSelect');
const previewCanvas = document.getElementById('previewCanvas');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');

let uploadedImage = null;

// Exam specifications
const examSpecs = {
    'ibps': { photoW: 200, photoH: 230, sigW: 140, sigH: 60 },
    'ssc-cgl': { photoW: 100, photoH: 120, sigW: 140, sigH: 60 },
    'rrb': { photoW: 320, photoH: 240, sigW: 140, sigH: 60 },
    'neet': { photoW: 200, photoH: 230, sigW: 140, sigH: 60 },
    'upsc': { photoW: 350, photoH: 450, sigW: 140, sigH: 60 }
};

// Photo select hone par
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
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Exam select hone par
if (examSelect) {
    examSelect.addEventListener('change', function() {
        if (uploadedImage) {
            showPreview();
        }
    });
}

// Preview dikhao
function showPreview() {
    if (!uploadedImage || !previewCanvas) return;

    const exam = examSelect ? examSelect.value : '';
    const ctx = previewCanvas.getContext('2d');

    let targetW = uploadedImage.width;
    let targetH = uploadedImage.height;

    if (exam && examSpecs[exam]) {
        targetW = examSpecs[exam].photoW;
        targetH = examSpecs[exam].photoH;
    }

    previewCanvas.width = targetW;
    previewCanvas.height = targetH;
    previewCanvas.classList.add('show');

    // Draw image
    ctx.drawImage(uploadedImage, 0, 0, targetW, targetH);

    // Status update
    if (statusText) {
        if (exam) {
            statusText.textContent = `${exam.toUpperCase()} - ${targetW}x${targetH} pixels`;
        } else {
            statusText.textContent = `Original: ${targetW}x${targetH} pixels`;
        }
    }

    if (downloadBtn) {
        downloadBtn.disabled = false;
    }
}

// Download function
function downloadPhoto() {
    if (!previewCanvas || !uploadedImage) return;

    const link = document.createElement('a');
    link.download = 'exam-photo.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

// Download button
if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPhoto);
}