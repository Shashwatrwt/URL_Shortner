
const STORAGE_KEY = 'url-shortener-mappings';
const form = document.querySelector('form');
const input = document.getElementById('url');
const aliasInput = document.getElementById('custom-alias');
const result = document.getElementById('result');
const copyButton = document.getElementById('copy-button');
const qrButton = document.getElementById('qr-button');
const copyStatus = document.getElementById('copy-status');
const qrBox = document.getElementById('qr-box');
const qrCode = document.getElementById('qr-code');
const historyEmpty = document.getElementById('history-empty');
const historyList = document.getElementById('history-list');
const linkCount = document.getElementById('link-count');
const clickCount = document.getElementById('click-count');
const todayClickCount = document.getElementById('today-click-count');
let currentShortUrl = '';

function readMappings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    const mappings = s ? JSON.parse(s) : {};
    return Object.fromEntries(Object.entries(mappings).map(([code, value]) => [code, {
      url: typeof value === 'string' ? value : value.url,
      createdAt: typeof value === 'string' ? new Date().toISOString() : value.createdAt,
      clicks: typeof value === 'string' ? 0 : Number(value.clicks) || 0,
      lastClickedAt: typeof value === 'string' ? null : value.lastClickedAt || null,
      clickDates: typeof value === 'string' || !Array.isArray(value.clickDates) ? [] : value.clickDates
    }]));
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

function renderHistory(mappings) {
  const entries = Object.entries(mappings).sort((a, b) => (
    new Date(b[1].createdAt) - new Date(a[1].createdAt)
  ));
  const totalClicks = entries.reduce((total, [, record]) => total + record.clicks, 0);
  const today = new Date().toDateString();
  const clicksToday = entries.reduce((total, [, record]) => (
    total + record.clickDates.filter((date) => new Date(date).toDateString() === today).length
  ), 0);
  linkCount.textContent = entries.length;
  clickCount.textContent = totalClicks;
  todayClickCount.textContent = clicksToday;
  historyList.replaceChildren();
  historyEmpty.hidden = entries.length > 0;

  entries.forEach(([code, record]) => {
    const item = document.createElement('li');
    const shortLink = document.createElement('strong');
    const target = document.createElement('span');
    const clicks = document.createElement('span');
    shortLink.textContent = buildShortUrlForCode(code);
    target.textContent = record.url;
    clicks.textContent = `${record.clicks} ${record.clicks === 1 ? 'click' : 'clicks'}`;
    item.append(shortLink, target, clicks);
    historyList.append(item);
  });
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
  const existing = Object.keys(mappings).find((k) => mappings[k].url === url);
  const code = existing || (function getUniqueCode() {
    let c;
    do { c = makeCode(); } while (mappings[c]);
    return c;
  })();

  if (!existing) {
    mappings[code] = {
      url,
      createdAt: new Date().toISOString(),
      clicks: 0,
      lastClickedAt: null,
      clickDates: []
    };
  }
  writeMappings(mappings);
  renderHistory(mappings);

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
  const record = mappings[code];
  if (!record) {
    result.textContent = 'This short link does not exist.';
    return;
  }

  try {
    const parsed = new URL(record.url);
    if (!parsed.protocol.startsWith('http')) {
      result.textContent = 'Invalid stored target.';
      return;
    }
    record.clicks += 1;
    const clickedAt = new Date().toISOString();
    record.lastClickedAt = clickedAt;
    record.clickDates.push(clickedAt);
    writeMappings(mappings);
    window.location.replace(record.url);
  } catch (e) {
    result.textContent = 'Unable to redirect to stored target.';
  }
})();

renderHistory(readMappings());
