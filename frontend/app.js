
document.getElementById('generateBtn').addEventListener('click', () => {
    const state = document.getElementById('state').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    fetch('http://localhost:8080/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state, firstName, lastName })
    })
    .then(response => response.json())
    .then(data => {
        const licenseNumber = data.licenseNumber;
        document.getElementById('licenseNumber').textContent = licenseNumber;
        document.getElementById('licenseInput').value = licenseNumber;
        generateBarcode(licenseNumber);
        document.getElementById('downloadBtn').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('validateBtn').addEventListener('click', () => {
    const state = document.getElementById('state').value;
    const licenseNumber = document.getElementById('licenseInput').value.trim();
    const validationResult = document.getElementById('validationResult');

    if (!licenseNumber) {
        validationResult.textContent = 'Please enter a license number to validate.';
        validationResult.className = 'message error';
        return;
    }

    fetch('http://localhost:8080/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state, licenseNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            validationResult.textContent = `This license number is valid for ${state}.`;
            validationResult.className = 'message success';
        } else {
            validationResult.textContent = `Invalid license number for ${state}.`;
            validationResult.className = 'message error';
        }
    })
    .catch(error => {
        validationResult.textContent = 'Validation request failed.';
        validationResult.className = 'message error';
        console.error('Error:', error);
    });
});

function generateBarcode(data) {
    const barcodeElement = document.getElementById('barcode');
    barcodeElement.innerHTML = ''; // Clear previous barcode

    // Generate PDF417 barcode
    const encodedData = window.pdf417.encode(data);

    // Create SVG representation
    const svg = window.pdf417.renderSVG(encodedData, {
        width: 300,
        height: 150
    });

    barcodeElement.innerHTML = svg;
}

document.getElementById('downloadBtn').addEventListener('click', () => {
    const barcodeElement = document.getElementById('barcode').innerHTML;
    const svgBlob = new Blob([barcodeElement], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'license-barcode.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker registered'))
            .catch(error => console.error('Service Worker registration failed:', error));
    }
}

registerServiceWorker();
