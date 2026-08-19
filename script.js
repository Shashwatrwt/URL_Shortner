// Redirect-handling milestone (minimal & focused):
// - Generate a 6-char code on submit and display a short URL that embeds the original URL as a query param `t`.
// - On page load, if ?t=<encodedUrl> is present, decode and redirect to the original URL.

const form = document.querySelector('form');
const input = document.getElementById('url');
const result = document.getElementById('result');

function makeCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function buildShortUrlFor(targetUrl, code) {
  // Use the current page origin + pathname so the link points back to this page
  const base = window.location.origin + window.location.pathname;
  return `${base}?t=${encodeURIComponent(targetUrl)}&c=${encodeURIComponent(code)}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = input.value.trim();
  if (!url) {
    result.textContent = 'Please enter a URL to shorten.';
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    result.textContent = 'Please enter a valid URL including the protocol (https://).';
    return;
  }

  const code = makeCode();
  const shortUrl = buildShortUrlFor(url, code);
  result.textContent = shortUrl;
});

// Redirect handler: if the page is opened with ?t=<encodedTarget>, redirect to it.
(function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const encodedTarget = params.get('t');
  if (!encodedTarget) return;

  try {
    const target = decodeURIComponent(encodedTarget);
    // Basic validation: must be a http/https URL
    const parsed = new URL(target);
    if (!parsed.protocol.startsWith('http')) {
      result.textContent = 'Invalid redirect target.';
      return;
    }

    // Perform redirect
    window.location.replace(target);
  } catch (e) {
    // If decoding/parsing fails, show a friendly message
    result.textContent = 'Unable to resolve this short link.';
  }
})();
