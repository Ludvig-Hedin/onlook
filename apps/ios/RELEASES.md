# iOS Releases Guide

The Weblab iOS app is a native SwiftUI + WKWebView wrapper around
[weblab.build](https://weblab.build). This doc covers building locally,
sending TestFlight invites to friends, and shipping to the App Store.

---

## Prerequisites

- **macOS with Xcode 15+** (required for any iOS build)
- **An Apple Developer account** ($99/year) — needed for TestFlight and the App
  Store. You don't need it just to run on the simulator or your own iPhone via
  a free personal team, but you do need it to send a build to anyone else.
- **[XcodeGen](https://github.com/yonaskolb/XcodeGen)** — generates the Xcode
  project from `project.yml`:

  ```bash
  brew install xcodegen
  ```

---

## 1. Generate the Xcode project

```bash
cd apps/ios
xcodegen generate
open Weblab.xcodeproj
```

XcodeGen reads `project.yml` and produces a fresh `Weblab.xcodeproj`. The
`.xcodeproj` is gitignored — regenerate any time you change `project.yml`.

---

## 2. Run on the simulator (no Apple Developer account needed)

```bash
# Build & launch on the booted simulator from the CLI:
xcodebuild -project apps/ios/Weblab.xcodeproj \
  -scheme Weblab \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

# Or just hit ⌘R in Xcode after `open Weblab.xcodeproj`.
```

To test deep links in the simulator:

```bash
xcrun simctl openurl booted "weblab://auth/callback?code=test"
```

The app should catch this URL and load `https://weblab.build/auth/callback?code=test&native=1`.

---

## 3. Run on your own device

1. Plug in your iPhone, unlock it, trust the Mac.
2. In Xcode: select your device in the run-target dropdown, sign in with your
   Apple ID under **Signing & Capabilities → Team**, hit ⌘R.
3. The first run installs the app and prompts you to trust the developer in
   **Settings → General → VPN & Device Management**.

This is fine for solo testing. For sending to friends, use TestFlight.

---

## 4. Distribute via TestFlight (the right way to share with friends)

1. **Bump the version** in `project.yml` (`MARKETING_VERSION`) and commit.
2. **Set your Team ID** in `project.yml` (`DEVELOPMENT_TEAM`). Run
   `xcodegen generate` again.
3. **Archive** in Xcode: **Product → Archive** (the destination dropdown must
   say "Any iOS Device", not a simulator).
4. The Organizer window opens automatically. Hit **Distribute App →
   App Store Connect → Upload**.
5. Once the build appears in [App Store Connect](https://appstoreconnect.apple.com)
   (5–15 minutes), open the app's TestFlight tab.
6. Add **internal testers** (up to 100 of your team members) — they get the
   build in the TestFlight app within minutes, no App Store review needed.
7. For **external testers** (up to 10,000) you need a one-time TestFlight
   review (~24 hours), but afterwards you can hand out a join URL like
   `testflight.apple.com/join/abc12345`.

> **Update the join URL** in `apps/web/client/src/utils/constants/index.ts` →
> `ExternalRoutes.DOWNLOAD_IOS` so the website's download page points to your
> real TestFlight invite.

---

## 5. App Store release

Same archive flow. After upload, in App Store Connect:

1. Fill in app metadata, screenshots (6.7" and 6.5" required), privacy info.
2. Submit for review. First-time review usually 24–48 hours.
3. Once approved, release manually or auto-release.

---

## 6. Sign-in (the important part)

Sign-in works **without any code changes to the web app** as long as Supabase
is configured to accept the custom URL scheme as a redirect target.

### What the iOS app does

1. User taps "Sign in with Google" inside the WebView.
2. The web app initiates the Supabase OAuth flow normally. The PKCE
   `code_verifier` cookie gets set inside the WebView's persistent cookie jar
   (`WKWebsiteDataStore.default()`).
3. The WebView tries to navigate to `accounts.google.com` — Google blocks
   embedded webviews with a "disallowed_useragent" error. We detect this in
   `WebView.swift` (`isBlockedOAuthHost`) and intercept the navigation.
4. We open the same URL via `ASWebAuthenticationSession`, which uses Safari
   under the hood. Google accepts it.
5. After login, Supabase redirects to `weblab://auth/callback?code=...`.
6. `ASWebAuthenticationSession` returns that URL to us. `AppRouter`
   rewrites it to `https://weblab.build/auth/callback?code=...&native=1` and
   loads it inside the WKWebView.
7. The existing server-side `/auth/callback` route exchanges the code for a
   session using the `code_verifier` cookie that's still in the WebView's
   cookie jar. Session cookies get set in the WebView. User is logged in.

### Required Supabase configuration

In your Supabase project dashboard → **Authentication → URL Configuration**:

- Add `weblab://auth/callback` to the **Redirect URLs** allow-list.
- Keep `https://weblab.build/auth/callback` as well (for the web app and
  desktop wrapper which both use the https URL after the deep-link bounce).

That's it. No web app code changes needed for OAuth on iOS.

### Apple Sign-In (optional)

Apple's `appleid.apple.com` is also in the blocked-host list, so Sign in with
Apple gets routed through `ASWebAuthenticationSession` automatically. If you
want native Sign in with Apple (the system sheet rather than a Safari flow),
add the **Sign in with Apple** capability in Xcode and call
`ASAuthorizationAppleIDProvider` directly — that's a future improvement.

---

## 7. File reference

```
apps/ios/
├── project.yml              # XcodeGen project definition
├── RELEASES.md              # this file
├── .gitignore               # ignores generated Xcode artefacts
└── Weblab/
    ├── WeblabApp.swift      # @main entry point
    ├── ContentView.swift    # SwiftUI root view
    ├── WebView.swift        # WKWebView + OAuth interception
    ├── AppRouter.swift      # Deep-link → web URL rewriting
    └── Info.plist           # Bundle config + weblab:// URL scheme
```

---

## 8. Common issues

| Symptom | Cause / Fix |
|---|---|
| "Disallowed useragent" from Google | OAuth provider isn't being routed through `ASWebAuthenticationSession`. Make sure the host is in `WebView.Coordinator.blockedOAuthHosts`. |
| Auth completes but user isn't signed in | Supabase doesn't have `weblab://auth/callback` in its allowed redirect URLs. Add it. |
| Deep link launches the app but stays on login screen | The `?native=1` query param isn't being added — check `AppRouter.handleAuthCallback`. |
| Cookies don't persist across launches | Make sure `WKWebViewConfiguration.websiteDataStore = .default()` (not `.nonPersistent()`). |
| Universal links don't open in the app | You need to host an `apple-app-site-association` file at `https://weblab.build/.well-known/apple-app-site-association` referencing your Team ID and bundle ID. |
