// Local-storage milestone (minimal & focused):
// - Store mappings of code -> target in localStorage
// - Generate a 6-char code and save mapping on submit; show short URL as ?u=<code>
// - On page load, if ?u=<code> present, resolve mapping and redirect

const STORAGE_KEY = 'url-shortener-mappings';
const form = document.querySelector('form');
const input = document.getElementById('url');
const result = document.getElementById('result');

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
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    result.textContent = 'Please enter a valid URL including the protocol (https://).';
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

  result.textContent = buildShortUrlForCode(code);
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
