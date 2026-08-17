const STORAGE_KEY = 'url-shortener-map';
const form = document.getElementById('shorten-form');
const input = document.getElementById('url');
const result = document.getElementById('result');
const shortLink = document.getElementById('short-link');
const errorBox = document.getElementById('error');
const copyButton = document.getElementById('copy-button');

function readMappings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function writeMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    // Ignore storage write failures in restricted contexts.
  }
}

function makeCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function buildShortUrl(code) {
  const url = new URL(window.location.href);
  url.search = `?u=${encodeURIComponent(code)}`;
  return url.toString();
}

function showShortenedUrl(fullUrl) {
  result.textContent = fullUrl;
  shortLink.href = fullUrl;
  shortLink.textContent = 'Open link';
  shortLink.style.display = 'inline-flex';
}

function showError(message) {
  errorBox.textContent = message;
}

function clearError() {
  errorBox.textContent = '';
}

function createShortUrl(value) {
  const rawUrl = value.trim();
  if (!rawUrl) {
    showError('Please enter a URL to shorten.');
    return;
  }

  let candidate;
  try {
    candidate = new URL(rawUrl);
  } catch {
    showError('Please provide a valid URL, including the protocol (https:// or http://).');
    return;
  }

  if (!candidate.protocol.startsWith('http')) {
    showError('Only http and https URLs are supported.');
    return;
  }

  clearError();

  const mappings = readMappings();
  const existingCode = Object.keys(mappings).find((code) => mappings[code] === candidate.href);

  const code = existingCode || makeCode();
  if (!existingCode) {
    mappings[code] = candidate.href;
    writeMappings(mappings);
  }

  const fullUrl = buildShortUrl(code);
  showShortenedUrl(fullUrl);
}

function resolveShortUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('u');

  if (!code) {
    return;
  }

  const mappings = readMappings();
  const target = mappings[code];

  if (!target) {
    result.textContent = 'This short link is not available yet.';
    shortLink.style.display = 'none';
    return;
  }

  window.location.replace(target);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  createShortUrl(input.value);
});

copyButton.addEventListener('click', async () => {
  const url = result.textContent;

  if (!url || url === 'No link generated yet.') {
    showError('Generate a short link first to copy it.');
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 1500);
    clearError();
  } catch {
    showError('Copy failed. You can still copy the link manually.');
  }
});

resolveShortUrl();
