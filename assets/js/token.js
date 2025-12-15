const CLIENT_KEY = 'sbawj3b2xfsaclfx9m';
const REDIRECT_URI = 'https://plnderer.github.io/MisfitShorts-App/callback.html';

// DOM Elements
const secretInput = document.getElementById('clientSecret');
const authCodeInput = document.getElementById('authCode');
const exchangeBtn = document.getElementById('exchangeBtn');
const toggleSecretBtn = document.getElementById('toggleSecret');

// Load saved secret
const savedSecret = localStorage.getItem('tiktok_client_secret');
if (savedSecret) {
    secretInput.value = savedSecret;
}

// Auto-fill code from URL params if manually pasted into URL (edge case)
const urlParams = new URLSearchParams(window.location.search);
const codeFromUrl = urlParams.get('code');
if (codeFromUrl) authCodeInput.value = codeFromUrl;

// Events
if (toggleSecretBtn) {
    toggleSecretBtn.addEventListener('click', () => {
        const type = secretInput.type === 'password' ? 'text' : 'password';
        secretInput.type = type;
        toggleSecretBtn.textContent = type === 'password' ? '👁️' : '🔒';
    });
}

secretInput.addEventListener('input', (e) => {
    localStorage.setItem('tiktok_client_secret', e.target.value.trim());
});

function authorize() {
    // Generate a random state for security
    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=user.info.basic,video.upload,video.publish&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    window.open(authUrl, '_blank');
}

async function exchangeToken() {
    const code = authCodeInput.value.trim();
    const clientSecret = secretInput.value.trim();

    if (!code) { alert('Please paste your authorization code!'); return; }
    if (!clientSecret) { alert('Please enter your Client Secret!'); return; }

    exchangeBtn.disabled = true;
    exchangeBtn.innerHTML = '⏳ Processing...';

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            })
        });

        const data = await response.json();

        if (data.error || (data.data && data.data.error_code)) {
            showResult(data, true);
        } else {
            showResult(data, false);
        }

    } catch (error) {
        console.error(error);
        showResult({
            error: 'CORS_OR_NETWORK_ERROR',
            message: 'Browser blocked the request or network failed. Use the cURL command instead.'
        }, true);
    }

    exchangeBtn.disabled = false;
    exchangeBtn.innerHTML = '🔄 Exchange Code';
}

function showCurl() {
    const code = authCodeInput.value.trim();
    const clientSecret = secretInput.value.trim() || 'YOUR_CLIENT_SECRET';

    const curl = `curl -X POST 'https://open.tiktokapis.com/v2/oauth/token/' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'client_key=${CLIENT_KEY}' \\
  -d 'client_secret=${clientSecret}' \\
  -d 'code=${code}' \\
  -d 'grant_type=authorization_code' \\
  -d 'redirect_uri=${REDIRECT_URI}'`;

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    resultDiv.innerHTML = `
        <h3>📋 Terminal Command (cURL)</h3>
        <p class="info">If the browser button fails due to CORS, run this in your terminal:</p>
        <div class="code-block" id="curlBlock">${curl}</div>
        <div class="btn-group">
            <button class="btn btn-secondary" onclick="copyToClipboard('curlBlock')">📋 Copy Command</button>
        </div>
    `;
}

function showResult(data, isError) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    const html = `
        <div class="status ${isError ? 'error' : 'success'}">
            ${isError ? '❌ Error Occurred' : '✅ Token Generated Successfully!'}
        </div>
        <div class="code-block" id="jsonResult">${JSON.stringify(data, null, 2)}</div>
        <div class="btn-group">
            <button class="btn btn-secondary" onclick="copyToClipboard('jsonResult')">📋 Copy JSON</button>
        </div>
    `;

    resultDiv.innerHTML = html;
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

// Global scope for HTML onclicks
window.authorize = authorize;
window.exchangeToken = exchangeToken;
window.showCurl = showCurl;
window.copyToClipboard = copyToClipboard;
