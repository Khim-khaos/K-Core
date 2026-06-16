[Readme на русском](README_RU.md)

# What is this project?
K-Core is a Minecraft web server control panel that supports Linux and Windows. The project offers an intuitive interface for managing servers, plugins and mods and more. Includes an integrated FTP server and file manager with syntax highlighting. Users can control access to servers through a user and role system

K-Core is an independent project, originally based on [kubek-minecraft-dashboard](https://github.com/seeroy/kubek-minecraft-dashboard), but now developed as a separate project with its own roadmap and features.

[![CI/CD status](https://github.com/Khim-khaos/K-Core/actions/workflows/build.yml/badge.svg)](https://github.com/Khim-khaos/K-Core/actions/workflows/build.yml)

## What's new in v3

Kubek v3 ships with a **complete UI overhaul** focused on polish, performance, and a unified design system:

- **New design system** — extended CSS variables, gradient & glow tokens, refined dark/light themes, mesh-gradient backgrounds
- **Glassmorphism 2.0** — layered transparency, smooth blur effects, subtle gradient borders
- **Micro-interactions** — button ripple effects, status pulses, shimmer progress, page transitions
- **Modern auth page** — split layout with animated aurora orbs, password visibility toggle, inline theme switcher
- **Rich dashboard** — server cards with status pills, live CPU/RAM usage, quick action overlay, animated running state
- **Polished console** — terminal-style window with traffic-light controls, tabs, live CPU/RAM/players sidebar
- **New server wizard** — step-numbered cards, searchable dropdowns, drag-friendly file upload
- **Welcome screen** — animated onboarding for first-time users with feature highlights
- **Notification toasts** — non-blocking success/error/warning/info notifications
- **Confirm dialogs** — promise-based modal for destructive actions
- **Tooltips & ripples** — automatic via `data-tooltip` attribute
- **Better accessibility** — proper ARIA labels, focus rings, keyboard-friendly controls
- **Mobile bottom nav** — gesture-friendly navigation bar
- **Tons of new utilities** in `KubekUtils` (toast, confirm, debounce, copyToClipboard, …)

**Features:**
- **Linux and Windows supported**
- **Intuitive Single-Page UI:** A clean and straightforward user interface for easy navigation and usage
- **Plugins and Mods Management:** Manage plugins and mods for your Minecraft server
- **Server Properties Editor:** Easily edit server.properties file to customize server settings
- **FTP Server:** Integrated FTP server for convenient file transfer
- **File Manager:** File manager with syntax highlighting for managing server files
- **Users and Roles System:** Manage users and roles with access restrictions to servers
- **Automatic Core Installation:** Support for automatic download and installation of Forge, Fabric, NeoForge
- **Download Mirrors:** Automatic failover to mirrors when main source is unavailable
- **Live Monitoring:** Real-time CPU, RAM, players, and server status tracking
- **WebSocket Tasks:** Track installation, downloads, and other long-running operations in real time
- **Auto-Updates:** Built-in update checker with notification
- **CSRF Protection:** State-changing requests require `X-Kubek-CSRF: true` header
- **IP Allowlist:** Restrict dashboard access to specific subnets
- **Rate Limiting:** Built-in protection against abuse
- **Prometheus-Ready:** `/api/health` endpoint for monitoring

**Natively supported cores:**
- Official Vanilla Server
- PaperMC
- Spigot
- Waterfall
- Velocity
- Purpur
- Magma
- **Forge** (automatic installer)
- **Fabric** (automatic server files installation)
- **NeoForge** (automatic installer)

# Installation

## Download prepared release (recommended)

Download and run the file suitable for your OS [from latest release](https://github.com/Khim-khaos/K-Core/releases/latest)

## Build from sources

Clone repository and install libs
**Node.js >= 20 required!**
```
git clone https://github.com/Khim-khaos/K-Core.git
cd K-Core
npm install
```

Start after installation
```
npm start
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

Regenerate Swagger docs:
```bash
npm run swagger
```

## Use Docker container

If you know all the ports you need to use, you can run K-Core in Docker using a command like this. In this example, port 3000 is used for the panel itself, and 25565 for the server
Replace YOUR_DIRECTORY with your folder path

```
docker run -d --name k-core \
            --restart unless-stopped \
			-p 3000:3000 \
			-p 25565:25565 \
			-v /YOUR_DIRECTORY/servers:/usr/kubek/servers \
			-v /YOUR_DIRECTORY/logs:/usr/kubek/logs \
			-v /YOUR_DIRECTORY/binaries:/usr/kubek/binaries \
			-v /YOUR_DIRECTORY/config.json:/usr/kubek/config.json \
			Khim-khaos/K-Core
```

If you want to open all ports, then use the command below (with it, K-Core will always work on port 3000, port remapping is not available)
```
docker run -d --name k-core --network host \
            --restart unless-stopped \
			-v /YOUR_DIRECTORY/servers:/usr/kubek/servers \
			-v /YOUR_DIRECTORY/logs:/usr/kubek/logs \
			-v /YOUR_DIRECTORY/binaries:/usr/kubek/binaries \
			-v /YOUR_DIRECTORY/config.json:/usr/kubek/config.json \
			Khim-khaos/K-Core
```

# Project structure

```
.
├── app.js                  # Entry point
├── modules/                # Backend logic
│   ├── webserver.js        # Express server & middleware
│   ├── serversController.js
│   ├── serversManager.js
│   ├── configuration.js
│   ├── ...
├── routers/                # REST API routes
│   ├── servers.js
│   ├── fileManager.js
│   ├── auth.js
│   ├── ...
├── web/                    # Frontend
│   ├── index.html          # Main SPA shell
│   ├── login.html          # Auth page
│   ├── 404.html
│   ├── css/
│   │   ├── theme.css       # Design tokens (colors, shadows, gradients)
│   │   ├── globals.css     # Base styles & utilities
│   │   ├── preloader.css
│   │   ├── elements/       # Reusable component styles
│   │   └── mobile.css
│   ├── js/classes/         # Frontend modules
│   │   ├── KubekUI.js
│   │   ├── KubekServers.js
│   │   ├── KubekFileManager.js
│   │   ├── KubekUtils.js   # Helpers (toast, confirm, debounce, …)
│   │   ├── ...
│   ├── pages/              # Page templates (loaded dynamically)
│   │   ├── dashboard.html
│   │   ├── console.html
│   │   ├── ...
│   └── sections/           # Persistent sections
│       ├── header.html
│       ├── sidebar.html
│       └── content-header.html
└── languages/              # i18n JSON files
```

# Security

- Authentication is required by default (`authorization: true` in `config.json`). Disabling it triggers a startup warning.
- All state-changing requests must include the `X-Kubek-CSRF: true` header (the frontend adds it automatically).
- Passwords are stored as salted SHA-256 hashes (`crypto-js`).
- Session cookies are HTTP-only and follow the same-site policy.
- Optional IP allowlist via CIDR ranges in `config.json`.
- Rate-limiting protects all non-static endpoints.
- Helmet is enabled for general hardening.

# License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
