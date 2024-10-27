document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');

    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imageEditor = document.getElementById('imageEditor');
    const imagePreview = document.getElementById('imagePreview');
    const closeButton = document.getElementById('closeButton');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const removeButton = document.getElementById('removeButton');
    const comparisonSlider = document.getElementById('comparisonSlider');
    const originalImage = document.getElementById('originalImage');
    const processedImage = document.getElementById('processedImage');
    const sliderHandle = document.getElementById('sliderHandle');
    const downloadButton = document.getElementById('downloadButton');

    let currentFile = null;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    closeButton.addEventListener('click', resetUpload);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                currentFile = file;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        comparisonSlider.style.height = img.height + 'px';
                        comparisonSlider.classList.add('active');
                        
                        imagePreview.src = e.target.result;
                        originalImage.src = e.target.result;
                        dropZone.style.display = 'none';
                        imageEditor.style.display = 'block';
                        comparisonSlider.style.display = 'none';
                        
                        processedImage.src = '';
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file (PNG, JPG, or JPEG)');
            }
        }
    }
    
    function initializeSlider() {
        let isResizing = false;
    
        const updateSliderHeight = () => {
            const img = document.getElementById('originalImage');
            if (img.complete) {
                comparisonSlider.style.height = img.offsetHeight + 'px';
            } else {
                img.onload = () => {
                    comparisonSlider.style.height = img.offsetHeight + 'px';
                }
            }
        }
    
        updateSliderHeight();
        window.addEventListener('resize', updateSliderHeight);
    
        sliderHandle.addEventListener('mousedown', startResize);
        sliderHandle.addEventListener('touchstart', startResize);
        
        function startResize(e) {
            isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchend', stopResize);
            document.addEventListener('touchcancel', stopResize);
        }
    
        function handleMouseMove(e) {
            if (!isResizing) return;
            updateSliderPosition(e.pageX);
        }
    
        function handleTouchMove(e) {
            if (!isResizing || !e.touches[0]) return;
            updateSliderPosition(e.touches[0].pageX);
        }
    
        function updateSliderPosition(pageX) {
            const sliderRect = comparisonSlider.getBoundingClientRect();
            let position = (pageX - sliderRect.left) / sliderRect.width;
            position = Math.max(0, Math.min(1, position));
            sliderHandle.style.left = `${position * 100}%`;
            processedImage.style.clipPath = `inset(0 ${100 - (position * 100)}% 0 0)`;
        }
    
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchend', stopResize);
            document.removeEventListener('touchcancel', stopResize);
        }
    }

    function resetUpload() {
        fileInput.value = '';
        currentFile = null;
        imageEditor.style.display = 'none';
        comparisonSlider.style.display = 'none';
        dropZone.style.display = 'block';
    }

    removeButton.addEventListener('click', async function() {
        if (!currentFile) {
            alert('Please select an image first');
            return;
        }

        loadingOverlay.classList.add('show');
        
        const formData = new FormData();
        formData.append('file', currentFile);
        
        try {
            const response = await fetch('/rmbg', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const processedImageUrl = URL.createObjectURL(blob);
                processedImage.src = processedImageUrl;
                imageEditor.style.display = 'none';
                comparisonSlider.style.display = 'block';
                downloadButton.style.display = 'block';

                processedImage.style.clipPath = 'inset(0 50% 0 0)';
                sliderHandle.style.left = '50%';
                
                initializeSlider();
            } else {
                const errorText = await response.text();
                alert(errorText || 'Error processing image');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading image');
        } finally {
            loadingOverlay.classList.remove('show');
        }
    });

    downloadButton.addEventListener('click', function() {
        if (processedImage.src) {
            const link = document.createElement('a');
            link.href = processedImage.src;
            link.download = 'processed-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (comparisonSlider.style.display !== 'none') {
                processedImage.style.clipPath = 'inset(0 50% 0 0)';
                sliderHandle.style.left = '50%';
            }
        }, 250);
    });
});
