
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
const historySearch = document.getElementById('history-search');
const historySearchStatus = document.getElementById('history-search-status');
const linkCount = document.getElementById('link-count');
const clickCount = document.getElementById('click-count');
const todayClickCount = document.getElementById('today-click-count');
let currentShortUrl = '';

function getTodayClicks(value) {
  const today = new Date().toDateString();
  if (value && value.clicksTodayDate === today && Number.isFinite(value.clicksToday)) {
    return { clicksTodayDate: today, clicksToday: value.clicksToday };
  }

  const legacyClicks = value && Array.isArray(value.clickDates)
    ? value.clickDates.filter((date) => new Date(date).toDateString() === today).length
    : 0;
  return { clicksTodayDate: legacyClicks ? today : null, clicksToday: legacyClicks };
}

function readMappings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    const mappings = s ? JSON.parse(s) : {};
    return Object.fromEntries(Object.entries(mappings).map(([code, value]) => [code, {
      url: typeof value === 'string' ? value : value.url,
      createdAt: typeof value === 'string' ? new Date().toISOString() : value.createdAt,
      clicks: typeof value === 'string' ? 0 : Number(value.clicks) || 0,
      lastClickedAt: typeof value === 'string' ? null : value.lastClickedAt || null,
      ...getTodayClicks(typeof value === 'string' ? null : value)
    }]));
  } catch (error) {
    throw new Error('Unable to read saved links. Browser storage may be unavailable or its data may be invalid.', { cause: error });
  }
}

function writeMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    throw new Error('Unable to save this link. Browser storage may be unavailable or full.', { cause: error });
  }
}

function resetResultActions() {
  currentShortUrl = '';
  copyButton.disabled = true;
  qrButton.disabled = true;
  copyStatus.textContent = '';
  qrBox.hidden = true;
  qrCode.removeAttribute('src');
}

function showFormError(message) {
  resetResultActions();
  result.textContent = message;
}

function showStorageError(error) {
  showFormError(error.message);
}

function loadMappings() {
  try {
    return readMappings();
  } catch (error) {
    showStorageError(error);
    return null;
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

function normalizeAlias(value) {
  return value.trim().replace(/\s+/g, '-').toLowerCase();
}

function parseHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch (error) {
    return null;
  }
}

function generateQrCode(dataUrl) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dataUrl)}`;
  qrCode.src = qrUrl;
  qrCode.alt = `QR code for ${dataUrl}`;
  qrBox.hidden = false;
}

function filterHistory() {
  const query = historySearch.value.trim().toLowerCase();
  let visibleCount = 0;
  [...historyList.children].forEach((item) => {
    item.hidden = !item.dataset.search.includes(query);
    if (!item.hidden) visibleCount += 1;
  });
  historyEmpty.hidden = visibleCount > 0;
  historyEmpty.textContent = historyList.childElementCount
    ? 'No links match your search.'
    : 'Your shortened links will appear here.';
  historySearchStatus.textContent = query
    ? `${visibleCount} matching ${visibleCount === 1 ? 'link' : 'links'}.`
    : `Showing all ${visibleCount} ${visibleCount === 1 ? 'link' : 'links'}.`;
}

function renderHistory(mappings) {
  const entries = Object.entries(mappings).sort((a, b) => (
    new Date(b[1].createdAt) - new Date(a[1].createdAt)
  ));
  const totalClicks = entries.reduce((total, [, record]) => total + record.clicks, 0);
  const today = new Date().toDateString();
  const clicksToday = entries.reduce((total, [, record]) => (
    total + (record.clicksTodayDate === today ? record.clicksToday : 0)
  ), 0);
  linkCount.textContent = entries.length;
  clickCount.textContent = totalClicks;
  todayClickCount.textContent = clicksToday;
  historyList.replaceChildren();

  entries.forEach(([code, record]) => {
    const item = document.createElement('li');
    const shortLink = document.createElement('a');
    const target = document.createElement('span');
    const clicks = document.createElement('span');
    const removeButton = document.createElement('button');
    const shortUrl = buildShortUrlForCode(code);
    shortLink.href = shortUrl;
    shortLink.textContent = shortUrl;
    shortLink.target = '_blank';
    shortLink.rel = 'noopener noreferrer';
    item.dataset.search = `${shortUrl} ${record.url}`.toLowerCase();
    removeButton.type = 'button';
    removeButton.className = 'delete-link';
    removeButton.textContent = 'Delete';
    removeButton.dataset.code = code;
    removeButton.setAttribute('aria-label', `Delete short link ${code}`);
    target.textContent = record.url;
    clicks.textContent = `${record.clicks} ${record.clicks === 1 ? 'click' : 'clicks'}`;
    item.append(shortLink, target, clicks, removeButton);
    historyList.append(item);
  });
  filterHistory();
}

historySearch.addEventListener('input', filterHistory);

historyList.addEventListener('click', (event) => {
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = input.value.trim();
  const requestedAlias = normalizeAlias(aliasInput.value);

  if (!url) {
    showFormError('Please enter a URL to shorten.');
    return;
  }

  if (!parseHttpUrl(url)) {
    showFormError('Please enter a valid HTTP or HTTPS URL (for example, https://example.com).');
    return;
  }

  if (requestedAlias && !/^[a-z0-9_-]{3,20}$/i.test(requestedAlias)) {
    showFormError('Custom alias can only contain letters, numbers, hyphen, and underscore.');
    return;
  }

  const mappings = loadMappings();
  if (!mappings) return;
  const existing = Object.keys(mappings).find((k) => mappings[k].url === url);

  if (requestedAlias && mappings[requestedAlias] && mappings[requestedAlias].url !== url) {
    showFormError('That custom short code is already taken.');
    return;
  }

  const code = requestedAlias || existing || (function getUniqueCode() {
    let c;
    do { c = makeCode(); } while (mappings[c]);
    return c;
  })();

  if (!mappings[code]) {
    mappings[code] = {
      url,
      createdAt: new Date().toISOString(),
      clicks: 0,
      lastClickedAt: null,
      clickDates: []
    };
  }

  try {
    writeMappings(mappings);
  } catch (error) {
    showStorageError(error);
    return;
  }
  renderHistory(mappings);
  aliasInput.value = '';

  currentShortUrl = buildShortUrlForCode(code);
  result.textContent = currentShortUrl;
  copyButton.disabled = false;
  qrButton.disabled = false;
  copyStatus.textContent = '';
  qrBox.hidden = true;
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

qrButton.addEventListener('click', () => {
  if (!currentShortUrl) return;
  generateQrCode(currentShortUrl);
});

// Resolve short code on page load and redirect when possible
(function resolveShortUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('u');
  if (!code) return;

  const mappings = loadMappings();
  if (!mappings) return;
  const record = mappings[code];
  if (!record) {
    result.textContent = 'This short link does not exist.';
    return;
  }

  const parsed = parseHttpUrl(record.url);
  if (!parsed) {
    result.textContent = 'This short link has an invalid stored target. Only HTTP and HTTPS links are allowed.';
    return;
  }

  record.clicks += 1;
  const clickedAt = new Date().toISOString();
  record.lastClickedAt = clickedAt;
  const today = new Date(clickedAt).toDateString();
  record.clicksToday = record.clicksTodayDate === today ? record.clicksToday + 1 : 1;
  record.clicksTodayDate = today;
  try {
    writeMappings(mappings);
  } catch (error) {
    showStorageError(error);
    return;
  }
  window.location.replace(record.url);
})();

const initialMappings = loadMappings();
if (initialMappings) renderHistory(initialMappings);
