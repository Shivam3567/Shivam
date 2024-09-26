// script.js

document.getElementById('convertBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        loadPDF(typedarray);
    };
    reader.readAsArrayBuffer(file);
});

function loadPDF(typedarray, password = null) {
    const loadingTask = pdfjsLib.getDocument({
        data: typedarray,
        password: password
    });

    loadingTask.promise.then(pdf => {
        const existingPasswordContainer = document.getElementById('passwordContainer');
        if (existingPasswordContainer) {
            document.body.removeChild(existingPasswordContainer);
        }

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(page => {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {

                    showDownloadMessage();

                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `page-${pageNum}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        setTimeout(hideDownloadMessage, 3000);
                    }, 'image/jpeg');
                });
            });
        }
    }).catch(error => {
        if (error.name === 'PasswordException') {
            if (error.code === pdfjsLib.PasswordResponses.NEED_PASSWORD || error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
                let passwordContainer = document.getElementById('passwordContainer');


                if (!passwordContainer) {

                    passwordContainer = document.createElement('div');
                    passwordContainer.id = 'passwordContainer';
                    passwordContainer.style.position = 'absolute';
                    passwordContainer.style.bottom = '30px';
                    passwordContainer.style.left = '50%';
                    passwordContainer.style.transform = 'translateX(-50%)';
                    passwordContainer.style.display = 'flex';
                    passwordContainer.style.alignItems = 'center';
                    passwordContainer.style.justifyContent = 'center';
                    passwordContainer.style.flexDirection = 'column';
                    passwordContainer.style.backgroundColor = '#ffffff';
                    passwordContainer.style.padding = '15px';
                    passwordContainer.style.borderRadius = '8px';
                    passwordContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

                    const passwordInput = document.createElement('input');
                    passwordInput.type = 'password';
                    passwordInput.placeholder = 'Enter password';
                    passwordInput.id = 'passwordInput';
                    passwordInput.style.padding = '10px';
                    passwordInput.style.borderRadius = '5px';
                    passwordInput.style.border = '1px solid #ddd';
                    passwordInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    passwordInput.style.marginRight = '10px';
                    passwordInput.style.width = '250px';
                    passwordInput.style.transition = 'all 0.3s ease';

                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.style.padding = '10px 20px';
                    submitButton.style.border = 'none';
                    submitButton.style.borderRadius = '5px';
                    submitButton.style.backgroundColor = '#FF5733';
                    submitButton.style.color = '#fff';
                    submitButton.style.cursor = 'pointer';
                    submitButton.style.transition = 'background-color 0.3s ease';
                    submitButton.style.marginTop = '10px';

                    submitButton.onmouseover = function () {
                        submitButton.style.backgroundColor = '#C70039';
                    };
                    submitButton.onmouseout = function () {
                        submitButton.style.backgroundColor = '#FF5733';
                    };

                    const errorMessage = document.createElement('p');
                    errorMessage.id = 'errorMessage';
                    errorMessage.style.color = 'red';
                    errorMessage.style.marginTop = '10px';
                    errorMessage.style.display = 'none';
                    passwordContainer.appendChild(passwordInput);
                    passwordContainer.appendChild(submitButton);
                    passwordContainer.appendChild(errorMessage);

                    document.body.appendChild(passwordContainer);
                    submitButton.onclick = function () {
                        const password = passwordInput.value;
                        if (password) {
                            loadPDF(typedarray, password); 
                        }
                    };
                }

                if (error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = 'Incorrect password. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        } else {
            alert('An error occurred: ' + error.message);
        }
    });
}

function showDownloadMessage() {
    const message = document.createElement('div');
    message.id = 'downloadMessage';
    message.textContent = 'Download started...';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = '#28a745';
    message.style.color = '#fff';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    message.style.zIndex = '1000';
    document.body.appendChild(message);
}

function hideDownloadMessage() {
    const message = document.getElementById('downloadMessage');
    if (message) {
        document.body.removeChild(message);
    }
}
