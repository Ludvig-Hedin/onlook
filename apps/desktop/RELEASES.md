# Desktop Releases Guide

The Onlook desktop app is an Electron wrapper around [onlook.com](https://onlook.com).  
This doc covers three paths: building locally, sharing with friends, and publishing an official release.

---

## Prerequisites

- **Node.js 20+** (use `nvm use 20` or install from nodejs.org)
- **macOS** to build the Mac DMG (Apple requires a Mac for `.dmg`)
- **Windows** to build the Windows installer (can also be done in CI)
- Linux builds can be produced on any OS via GitHub Actions

Install desktop dependencies once:

```bash
cd apps/desktop
npm install
```

---

## 1. Build locally (fastest — great for sharing with friends)

```bash
# From the repo root:
cd apps/desktop

# Build for your current OS only
npm run build:mac     # → dist/Onlook.dmg  (macOS)
npm run build:win     # → dist/Onlook Setup.exe  (Windows)
npm run build:linux   # → dist/Onlook.AppImage  (Linux)
```

The output files land in `apps/desktop/dist/`.

> **Sharing with friends:** just send them the file directly — e.g. `Onlook.dmg` via AirDrop, Google Drive, or iMessage. They double-click it and drag Onlook to Applications. Done.

### macOS Gatekeeper warning

Because the app isn't notarized yet, macOS will show *"Onlook can't be opened because it is from an unidentified developer."*

Tell your friends to do this **once** to bypass it:

```
Right-click (or Control-click) the app → Open → Open anyway
```

Or from Terminal after mounting the DMG:
```bash
xattr -cr /Applications/Onlook.app
```

---

## 2. Publish an official GitHub Release (makes the download button work)

The download button in the hero points to:

| Platform | URL |
|----------|-----|
| macOS    | `github.com/onlook-dev/onlook/releases/latest/download/Onlook.dmg` |
| Windows  | `github.com/onlook-dev/onlook/releases/latest/download/Onlook-Setup.exe` |
| Linux    | `github.com/onlook-dev/onlook/releases/latest/download/Onlook.AppImage` |

These URLs resolve automatically once you push a tagged release with those filenames attached.

### Step-by-step

```bash
# 1. Bump the version in apps/desktop/package.json, then commit:
git add apps/desktop/package.json
git commit -m "chore: bump desktop to v0.1.0"

# 2. Push a tag that matches the CI trigger  (desktop-v*)
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

GitHub Actions will:
1. Spin up runners for macOS, Windows, and Linux in parallel
2. `npm run build:*` on each
3. Create a GitHub Release named `desktop-v0.1.0`
4. Attach the `.dmg`, `.exe`, and `.AppImage` as release assets

The download button will work as soon as the release is published (usually ~10 minutes).

---

## 3. GitHub Actions CI (`.github/workflows/desktop-release.yml`)

The workflow is already committed and triggers on any tag matching `desktop-v*`.

```
desktop-v0.1.0   ← triggers the build
desktop-v0.2.3   ← triggers the build
v0.1.0           ← does NOT trigger (no "desktop-" prefix)
```

No secrets are required for the first release — `GITHUB_TOKEN` is provided automatically.  
The workflow uploads artifacts via `softprops/action-gh-release`.

---

## 4. Auto-updates

`electron-updater` is already wired up in `main.js`.  
Once a user installs the app, it will check GitHub Releases on every launch and offer to update automatically — no action needed from you.

---

## 5. Code signing (optional, removes the Gatekeeper warning)

Skip this for now if you're just sharing with friends.  
Add these secrets to your GitHub repo when you're ready:

| Secret name           | What it is                                 |
|-----------------------|--------------------------------------------|
| `MAC_CERT_P12_BASE64` | Base64-encoded `.p12` Apple Developer cert |
| `MAC_CERT_PASSWORD`   | Password for the `.p12`                    |

Then uncomment the two `CSC_*` lines in `desktop-release.yml`.

---

## File naming reference (electron-builder defaults)

| Platform | Output filename              |
|----------|------------------------------|
| macOS    | `Onlook-{version}-arm64.dmg` + `Onlook-{version}.dmg` |
| Windows  | `Onlook Setup {version}.exe` |
| Linux    | `Onlook-{version}.AppImage`  |

> **Note:** The download URLs in `constants/index.ts` point to the *latest* release, not a specific version, so they stay valid across releases without any code changes.
