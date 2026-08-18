# URL Shortener

A simple, client-side URL shortener web application. Enter a long URL and generate a random 6-character short code instantly.

## Features

- ✅ Easy-to-use interface for shortening URLs
- ✅ Generates random 6-character short codes
- ✅ URL validation (requires protocol like https://)
- ✅ Real-time feedback with aria-live region for accessibility
- ✅ Responsive design with clean, modern styling
- ✅ No backend required - runs entirely in the browser


## Project Structure


```
├── index.html      # HTML structure and markup
├── script.js       # JavaScript for URL shortening logic
├── style.css       # CSS styling and layout
└── README.md       # This file
```

## How to Use

1. **Open the Application**
   - Open `index.html` in your web browser

2. **Enter a URL**
   - Type or paste a long URL in the input field
   - Must include the protocol (e.g., `https://example.com`)

3. **Generate Short Code**
   - Click the "Shorten" button
   - A random 6-character code will be generated and displayed

4. **Error Handling**
   - If the input is empty, you'll see an error message
   - If the URL is invalid, you'll be prompted to enter a valid URL with protocol

## Technical Details

- **Language**: HTML5, CSS3, JavaScript (ES6)
- **Styling**: Custom CSS with flexbox layout
- **Accessibility**: Uses `aria-live="polite"` for screen reader support
- **No Dependencies**: Pure vanilla JavaScript, no external libraries needed

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Form Validation
- ES6 JavaScript
- CSS3 Flexbox

## Future Enhancements

- Store short codes in browser localStorage
- Add ability to copy short code to clipboard
- Display a list of previously generated codes
- Connect to a backend API for persistent short URL storage
- Add QR code generation