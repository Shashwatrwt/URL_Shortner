// Minimal script for milestone: generate a short code and display it
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
  result.textContent = code;
});
