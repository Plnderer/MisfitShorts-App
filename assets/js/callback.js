document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    const statusDiv = document.getElementById('statusMessage');
    const contentDiv = document.getElementById('authContent');

    if (error) {
        statusDiv.innerHTML = `
            <div class="status error">
                <strong>Authorization Failed</strong><br>
                ${errorDescription || error}
            </div>
            <a href="token.html" class="btn btn-secondary" style="margin-top:20px">Try Again</a>
        `;
        contentDiv.style.display = 'none';
    } else if (code) {
        statusDiv.innerHTML = `<div class="status success"><strong>✓ Authorization Successful!</strong></div>`;
        document.getElementById('authCode').textContent = code;

        // Update the direct link button
        const tokenLink = document.getElementById('tokenLink');
        tokenLink.href = `token.html?code=${encodeURIComponent(code)}`;
    } else {
        statusDiv.innerHTML = `
            <div class="status error"><strong>No Code Found</strong></div>
            <p class="info">This page is an OAuth callback handler. You should arrive here after authorizing with TikTok.</p>
            <a href="token.html" class="btn" style="margin-top:20px">Go to Token Exchange</a>
        `;
        contentDiv.style.display = 'none';
    }
});

function copyCode() {
    const code = document.getElementById('authCode').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerText;
        btn.innerText = '✓ Copied!';
        setTimeout(() => { btn.innerText = originalText; }, 2000);
    });
}

window.copyCode = copyCode;
