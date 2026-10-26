# URL Shortener

A URL Shortener project that starts with fundamental frontend development concepts and gradually evolves toward a production-oriented web application. The project begins with HTML, CSS, and vanilla JavaScript, with plans to progressively introduce React, Node.js, PostgreSQL, Redis caching, rate limiting, load balancing, Docker, and distributed systems concepts.

The goal is not just to build a functional URL shortener, but also to understand how real-world web applications are designed, developed, scaled, and deployed.

## Features

- ✅ Simple, responsive interface for shortening URLs
- ✅ Generates random 6-character short codes
- ✅ URL validation supporting HTTP and HTTPS
- ✅ Accessible real-time feedback using `aria-live`
- ✅ Browser-based URL mapping storage using `localStorage`
- ✅ Resolves short links through the `?u=` query parameter
- ✅ Displays local link history with original and shortened URLs
- ✅ Tracks total clicks and daily clicks for each browser profile
- ✅ Handles invalid URLs, unknown short codes, and storage errors
- ✅ No backend or external dependencies required in the current version

## Project Structure

```text
├── index.html      # HTML structure and markup
├── script.js       # URL shortening logic
├── style.css       # Styling and responsive layout
└── README.md       # Project documentation
```

## How to Use

### 1. Run the Application

Open a terminal in the project folder and start a local development server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### 2. Shorten a URL

- Enter a valid HTTP or HTTPS URL.
- Click the **Shorten** button.
- The application generates a random 6-character short code.
- The generated short URL is displayed for copying and sharing within the supported browser environment.

Submitting an existing URL reuses its existing code unless a custom alias is provided. A custom alias can create an additional code for the same destination.

### 3. Open a Short Link

Open the generated short URL in the same browser profile. The application retrieves the corresponding URL mapping from browser storage and redirects to the original destination.

**Current limitation:** Since URL mappings are stored in `localStorage`, links are not automatically shared across browsers or devices. The application also depends on its frontend page being available to resolve short links.

## Current Technology Stack

| Component | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3, Flexbox |
| Application logic | Vanilla JavaScript (ES6+) |
| Data storage | Browser `localStorage` |
| Accessibility | ARIA live regions |
| Dependencies | None |

## Learning Roadmap: From Frontend to System Design

This project will evolve incrementally, introducing backend development and system design concepts as the application becomes more sophisticated.

### Phase 1: Frontend Foundations — Current Version

- HTML, CSS, and vanilla JavaScript
- URL validation and short-code generation
- Browser storage and link history
- Click tracking and error handling
- Responsive design and accessibility

### Phase 2: Modern Frontend Development

- React for component-based UI development
- Reusable components, hooks, and state management
- API integration and asynchronous requests
- TypeScript for type safety
- Improved form validation and user experience

### Phase 3: Backend and Database

- Node.js and Express for REST APIs
- PostgreSQL for persistent URL mappings and analytics
- Database schema design, primary keys, foreign keys, and indexes
- Short-code generation and collision handling
- Server-side URL validation and error handling
- Separation of frontend, API, and database responsibilities

### Phase 4: Performance and Reliability

- Rate limiting to prevent API abuse
- Redis caching for frequently accessed short links
- Cache expiration and invalidation strategies
- Database query optimization and connection pooling
- Logging, monitoring, and performance testing

### Phase 5: Deployment and Scalability

- Docker for containerization
- Environment variables and configuration management
- Reverse proxies and load balancing
- Horizontal scaling of stateless API servers
- Health checks and graceful failure handling
- CI/CD fundamentals and cloud deployment

### Phase 6: Distributed Systems Concepts

- Unique ID generation and short-code collision strategies
- Caching trade-offs and cache consistency
- Database replication and availability
- Database partitioning and sharding concepts
- Handling concurrent requests
- Fault tolerance and failure recovery
- Consistency, availability, and scalability trade-offs

These phases are planned learning milestones, not features currently implemented in the application.

## Development Principles

The project follows an incremental learning approach:

1. Build a working solution with the simplest suitable technology.
2. Understand its limitations before introducing additional complexity.
3. Replace browser-only storage with a persistent backend and database.
4. Introduce caching, rate limiting, and performance optimizations when their benefits can be demonstrated.
5. Add containerization, load balancing, and distributed systems concepts as separate, testable improvements.

The objective is to understand **why each architectural decision is necessary**, not simply to use more technologies.

## Future Vision

The long-term goal is to transform this small frontend application into a scalable URL-shortening service while gaining practical experience with full-stack development, database design, backend engineering, system design, and production deployment.

The final project should demonstrate both a functional product and a clear understanding of the architectural decisions involved in building reliable web services.