
const STORAGE_KEY = 'url-shortener-mappings';
const form = document.querySelector('form');
const input = document.getElementById('url');
const result = document.getElementById('result');
const copyButton = document.getElementById('copy-button');
const copyStatus = document.getElementById('copy-status');
let currentShortUrl = '';

function readMappings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  } catch (e) {
    return {};
  }
}

function writeMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (e) {
    // ignore write errors
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

function buildShortUrlForCode(code) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?u=${encodeURIComponent(code)}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = input.value.trim();
  if (!url) {
    result.textContent = 'Please enter a URL to shorten.';
    currentShortUrl = '';
    copyButton.disabled = true;
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    result.textContent = 'Please enter a valid URL including the protocol (https://).';
    currentShortUrl = '';
    copyButton.disabled = true;
    return;
  }

  const mappings = readMappings();

  // If a mapping already exists for this URL, return its code
  const existing = Object.keys(mappings).find((k) => mappings[k] === url);
  const code = existing || (function getUniqueCode() {
    let c;
    do { c = makeCode(); } while (mappings[c]);
    return c;
  })();

  mappings[code] = url;
  writeMappings(mappings);

  currentShortUrl = buildShortUrlForCode(code);
  result.textContent = currentShortUrl;
  copyButton.disabled = false;
  copyStatus.textContent = '';
});

copyButton.addEventListener('click', async () => {
  if (!currentShortUrl) return;

  try {
    await navigator.clipboard.writeText(currentShortUrl);
    copyStatus.textContent = 'Copied!';
  } catch (e) {
    copyStatus.textContent = 'Copy failed. Select the link to copy it manually.';
  }
});

// Resolve short code on page load and redirect when possible
(function resolveShortUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('u');
  if (!code) return;

  const mappings = readMappings();
  const target = mappings[code];
  if (!target) {
    result.textContent = 'This short link does not exist.';
    return;
  }

  try {
    const parsed = new URL(target);
    if (!parsed.protocol.startsWith('http')) {
      result.textContent = 'Invalid stored target.';
      return;
    }
    window.location.replace(target);
  } catch (e) {
    result.textContent = 'Unable to redirect to stored target.';
  }
})();
