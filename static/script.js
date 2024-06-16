document.getElementById('uploadBtn').addEventListener('click', function() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    if (file) {
        var formData = new FormData();
        formData.append('file', file);
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/rmbg');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (contentType.startsWith('image/png')) {
                    var imageUrl = URL.createObjectURL(xhr.response); // Use API response URL
                    var imageContainer = document.getElementById('uploadedImageContainer');
                    var image = imageContainer.querySelector('img');
                    if (!image) {
                        image = document.createElement('img');
                        imageContainer.appendChild(image);
                    }
                    image.src = imageUrl;
                    imageContainer.classList.remove('error'); // Remove error class
                    imageContainer.classList.add('show'); // Show the container
                    document.getElementById('statusMessage').innerHTML = '';

                    // Remove existing download buttons
                    var existingDownloadButtons = document.querySelectorAll('.downloadBtn');
                    existingDownloadButtons.forEach(function(button) {
                        button.remove();
                    });

                    // Create new download button
                    var downloadBtn = document.createElement('a');
                    downloadBtn.href = imageUrl;
                    downloadBtn.download = 'image.png';
                    downloadBtn.className = 'downloadBtn';
                    downloadBtn.textContent = 'Download';
                    imageContainer.appendChild(downloadBtn);
                } else {
                    document.getElementById('statusMessage').innerHTML = 'Error: Invalid response from server';
                    // Remove existing image and download button
                    var imageContainer = document.getElementById('uploadedImageContainer');
                    imageContainer.innerHTML = '';
                    imageContainer.classList.add('error'); // Add error class
                }
            } else if (xhr.status === 429) {
                document.getElementById('statusMessage').innerHTML = 'You are restricted from uploading';
                // Remove existing image and download button
                var imageContainer = document.getElementById('uploadedImageContainer');
                imageContainer.innerHTML = '';
                imageContainer.classList.add('error'); // Add error class
            } else if (xhr.status === 400) {
                document.getElementById('statusMessage').innerHTML = 'Error: ' + xhr.responseText;
                // Remove existing image and download button
                var imageContainer = document.getElementById('uploadedImageContainer');
                imageContainer.innerHTML = '';
                imageContainer.classList.add('error'); // Add error class
            } else {
                document.getElementById('statusMessage').innerHTML = 'Error: Server returned status code ' + xhr.status;
                // Remove existing image and download button
                var imageContainer = document.getElementById('uploadedImageContainer');
                imageContainer.innerHTML = '';
                imageContainer.classList.add('error'); // Add error class
            }
        };
        xhr.responseType = 'blob'; // Set response type to blob
        xhr.send(formData);
    } else {
        document.getElementById('statusMessage').innerHTML = 'Please select a file';
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const fileNameSpan = document.getElementById("fileName");

    fileInput.addEventListener("change", function() {
        const selectedFile = fileInput.files[0];
        if (selectedFile) {
            fileNameSpan.textContent = selectedFile.name;
        } else {
            fileNameSpan.textContent = "";
        }
    });
});
