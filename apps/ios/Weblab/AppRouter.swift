import Foundation
import Combine

/// App-wide router that:
///  1. Holds the URL the WebView should currently load
///  2. Handles incoming `weblab://` deep links (OAuth callbacks, universal links, etc.)
///
/// We use a small router so the deep-link path is testable and decoupled from the
/// WebView itself.
@MainActor
final class AppRouter: ObservableObject {
    // The base web origin. Set via `WEBLAB_URL` build setting if you want to
    // point a debug build at staging or localhost. Defaults to production.
    static let webOrigin: URL = {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "WeblabURL") as? String,
           let url = URL(string: raw) {
            return url
        }
        return URL(string: "https://weblab.build")!
    }()

    /// The URL that the WKWebView should currently navigate to. Bumping this
    /// triggers a navigation in the WebView (see `WebView`).
    @Published var currentURL: URL = AppRouter.webOrigin

    /// Bumped when an OAuth deep link comes in — used to force a reload of the
    /// callback URL inside the WebView so the existing server-side
    /// `/auth/callback` handler runs in the WebView's cookie jar.
    @Published var loadToken: Int = 0

    /// Handle a URL the system delivered us. Two flavours:
    ///   - `weblab://auth/callback?code=...` — Supabase OAuth completion.
    ///   - `https://weblab.build/...` — universal link, navigate normally.
    func handleIncomingURL(_ url: URL) {
        if url.scheme == "weblab" {
            handleAuthCallback(url)
            return
        }
        if url.host == "weblab.build" {
            currentURL = url
            loadToken &+= 1
        }
    }

    /// Convert `weblab://auth/callback?code=XYZ` into
    /// `https://weblab.build/auth/callback?code=XYZ&native=1` and load it in
    /// the WebView. The existing server-side callback exchanges the code for a
    /// session using the PKCE code_verifier cookie that's already in the
    /// WebView's cookie jar (it was set when we initiated the OAuth flow).
    private func handleAuthCallback(_ url: URL) {
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }

        let path = components.path.isEmpty ? "/auth/callback" : "/" + components.path
            .split(separator: "/")
            .joined(separator: "/")

        components.scheme = AppRouter.webOrigin.scheme
        components.host = AppRouter.webOrigin.host
        components.path = path

        var items = components.queryItems ?? []
        if !items.contains(where: { $0.name == "native" }) {
            items.append(URLQueryItem(name: "native", value: "1"))
        }
        components.queryItems = items

        if let resolved = components.url {
            currentURL = resolved
            loadToken &+= 1
        }
    }
}
