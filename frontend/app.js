
document.getElementById('generateBtn').addEventListener('click', () => {
    const state = document.getElementById('state').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    fetch('http://localhost:8080/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, firstName, lastName })
    })
    .then(response => response.json())
    .then(data => {
        const licenseNumber = data.licenseNumber;
        const licenseEl = document.getElementById('licenseNumber');
        licenseEl.textContent = licenseNumber;
        generateBarcode(licenseNumber);
        document.getElementById('downloadBtn').style.display = 'inline-block';
        const vBtn = document.getElementById('validateBtn');
        if (vBtn) vBtn.style.display = 'inline-block';

        // show immediate validation result
        validateLicense(state, licenseNumber)
            .then(showValidation)
            .catch(err => console.error('Validation error:', err));
    })
    .catch(error => console.error('Error:', error));
});

function validateLicense(state, licenseNumber) {
    return fetch('http://localhost:8080/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, licenseNumber })
    }).then(res => {
        if (!res.ok) throw new Error('Validation request failed');
        return res.json();
    });
}

function showValidation(result) {
    const licenseEl = document.getElementById('licenseNumber');
    let vEl = document.getElementById('validationResult');
    if (!vEl) {
        vEl = document.createElement('div');
        vEl.id = 'validationResult';
        licenseEl.insertAdjacentElement('afterend', vEl);
    }
    vEl.textContent = result.valid ? 'License is valid' : 'License is invalid';
    vEl.style.color = result.valid ? 'green' : 'red';
}

function generateBarcode(data) {
    const barcodeElement = document.getElementById('barcode');
    barcodeElement.innerHTML = ''; // Clear previous barcode
    const pdf417 = window.pdf417;
    const encodedData = pdf417.encode(data);
    const svg = pdf417.renderSVG(encodedData, { width: 300, height: 150 });
    barcodeElement.innerHTML = svg;
}

document.getElementById('validateBtn').addEventListener('click', () => {
    const state = document.getElementById('state').value;
    const licenseNumber = (document.getElementById('licenseNumber').textContent || '').trim();
    if (!licenseNumber) { alert('No license to validate'); return; }
    validateLicense(state, licenseNumber).then(showValidation).catch(err => {
        console.error('Validation error:', err);
        alert('Validation failed');
    });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const state = document.getElementById('state').value;
    const licenseNumber = (document.getElementById('licenseNumber').textContent || '').trim();
    if (!licenseNumber) { alert('No license generated'); return; }
    validateLicense(state, licenseNumber)
        .then(result => {
            if (result.valid) {
                const barcodeElement = document.getElementById('barcode').innerHTML;
                const svgBlob = new Blob([barcodeElement], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${licenseNumber}-barcode.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showValidation(result);
            } else {
                showValidation(result);
                alert('Cannot download: license is invalid');
            }
        })
        .catch(err => {
            console.error('Validation error:', err);
            alert('Validation failed');
        });
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
