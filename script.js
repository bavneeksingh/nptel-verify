document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const viewerContainer = document.getElementById('viewerContainer');
    const viewerWrapper = document.getElementById('viewerWrapper');
    const certificateImg = document.getElementById('certificateImg');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const fitWidthBtn = document.getElementById('fitWidth');
    const downloadBtn = document.getElementById('downloadBtn');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const copyBtn = document.getElementById('copyBtn');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    // Zoom state
    let currentZoom = 1;
    const MIN_ZOOM = 0.25;
    const MAX_ZOOM = 4;
    const ZOOM_STEP = 0.15;

    // Pan state
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    // =====================
    // Zoom Functions
    // =====================

    function setZoom(newZoom, smooth = true) {
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        currentZoom = newZoom;

        if (smooth) {
            viewerWrapper.classList.add('zooming');
            setTimeout(() => viewerWrapper.classList.remove('zooming'), 300);
        }

        viewerWrapper.style.transform = `scale(${currentZoom})`;
        zoomLevelDisplay.textContent = Math.round(currentZoom * 100) + '%';
    }

    function zoomIn() {
        setZoom(currentZoom + ZOOM_STEP);
    }

    function zoomOut() {
        setZoom(currentZoom - ZOOM_STEP);
    }

    function resetZoom() {
        setZoom(1);
        // Center the view
        viewerContainer.scrollLeft = (viewerContainer.scrollWidth - viewerContainer.clientWidth) / 2;
        viewerContainer.scrollTop = (viewerContainer.scrollHeight - viewerContainer.clientHeight) / 2;
    }

    function fitWidth() {
        const containerWidth = viewerContainer.clientWidth - 48; // padding
        const imgWidth = certificateImg.naturalWidth || certificateImg.offsetWidth;
        const newZoom = containerWidth / imgWidth;
        setZoom(newZoom);
    }

    // =====================
    // Pan Functions (Mouse)
    // =====================

    viewerContainer.addEventListener('mousedown', function (e) {
        isPanning = true;
        startX = e.pageX - viewerContainer.offsetLeft;
        startY = e.pageY - viewerContainer.offsetTop;
        scrollLeft = viewerContainer.scrollLeft;
        scrollTop = viewerContainer.scrollTop;
        viewerContainer.style.cursor = 'grabbing';
    });

    viewerContainer.addEventListener('mouseleave', function () {
        isPanning = false;
        viewerContainer.style.cursor = 'grab';
    });

    viewerContainer.addEventListener('mouseup', function () {
        isPanning = false;
        viewerContainer.style.cursor = 'grab';
    });

    viewerContainer.addEventListener('mousemove', function (e) {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.pageX - viewerContainer.offsetLeft;
        const y = e.pageY - viewerContainer.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        viewerContainer.scrollLeft = scrollLeft - walkX;
        viewerContainer.scrollTop = scrollTop - walkY;
    });

    // =====================
    // Mouse Wheel Zoom
    // =====================

    viewerContainer.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }, { passive: false });

    // =====================
    // Touch Pinch Zoom
    // =====================

    let initialPinchDistance = 0;
    let initialZoom = 1;

    viewerContainer.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoom = currentZoom;
        } else if (e.touches.length === 1) {
            isPanning = true;
            startX = e.touches[0].pageX - viewerContainer.offsetLeft;
            startY = e.touches[0].pageY - viewerContainer.offsetTop;
            scrollLeft = viewerContainer.scrollLeft;
            scrollTop = viewerContainer.scrollTop;
        }
    });

    viewerContainer.addEventListener('touchmove', function (e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialPinchDistance;
            setZoom(initialZoom * scale, false);
        } else if (e.touches.length === 1 && isPanning) {
            const x = e.touches[0].pageX - viewerContainer.offsetLeft;
            const y = e.touches[0].pageY - viewerContainer.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            viewerContainer.scrollLeft = scrollLeft - walkX;
            viewerContainer.scrollTop = scrollTop - walkY;
        }
    }, { passive: false });

    viewerContainer.addEventListener('touchend', function () {
        isPanning = false;
        initialPinchDistance = 0;
    });

    function getDistance(touch1, touch2) {
        return Math.hypot(
            touch2.pageX - touch1.pageX,
            touch2.pageY - touch1.pageY
        );
    }

    // =====================
    // Keyboard Shortcuts
    // =====================

    document.addEventListener('keydown', function (e) {
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        } else if (e.key === '-') {
            e.preventDefault();
            zoomOut();
        } else if (e.key === '0') {
            e.preventDefault();
            resetZoom();
        }
    });

    // =====================
    // Double Click to Zoom
    // =====================

    viewerContainer.addEventListener('dblclick', function (e) {
        e.preventDefault();
        if (currentZoom >= 2) {
            resetZoom();
        } else {
            setZoom(currentZoom + 0.5);
        }
    });

    // =====================
    // Button Handlers
    // =====================

    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetZoomBtn.addEventListener('click', resetZoom);
    fitWidthBtn.addEventListener('click', fitWidth);

    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.href = 'certificate.jpg';
        link.download = 'NPTEL_Certificate_JOSHIK_R_Machine_Learning.jpg';
        link.click();
    });

    // =====================
    // Copy Link
    // =====================

    copyBtn.addEventListener('click', function () {
        const url = document.getElementById('verifyLink').textContent.trim();
        navigator.clipboard.writeText(url).then(function () {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'Copied!';
            copyBtn.querySelector('i').className = 'fas fa-check';
            setTimeout(function () {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span').textContent = 'Copy';
                copyBtn.querySelector('i').className = 'fas fa-copy';
            }, 2000);
        }).catch(function () {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.querySelector('span').textContent = 'Copied!';
            setTimeout(function () {
                copyBtn.querySelector('span').textContent = 'Copy';
            }, 2000);
        });
    });

    // =====================
    // Mobile Menu
    // =====================

    hamburger.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
    });

    // =====================
    // Initial Setup
    // =====================

    certificateImg.addEventListener('load', function () {
        // Start slightly zoomed out for overview, like NPTEL does
        fitWidth();
    });

    // If image already loaded (cached)
    if (certificateImg.complete) {
        fitWidth();
    }
});
