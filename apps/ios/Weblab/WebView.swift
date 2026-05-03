import SwiftUI
import WebKit
import AuthenticationServices

/// The full-screen WKWebView that renders weblab.build.
///
/// Two responsibilities:
///   1. Persistent cookies — uses `WKWebsiteDataStore.default()` so sessions
///      survive across app launches.
///   2. OAuth interception — Google/GitHub block raw WebViews ("disallowed
///      useragent"). We detect those navigations and route them through
///      `ASWebAuthenticationSession`, which uses Safari's flow but lets us
///      receive the `weblab://` callback URL.
struct WebView: UIViewRepresentable {
    @EnvironmentObject private var router: AppRouter

    func makeCoordinator() -> Coordinator { Coordinator(router: router) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()  // persistent cookies
        config.applicationNameForUserAgent = "Weblab/iOS"
        // Expose `window.weblabNative` so the web app can detect the wrapper.
        let bridgeJS = """
        window.weblabNative = {
            platform: 'ios',
            version: '\(Bundle.main.shortVersion)'
        };
        """
        let userScript = WKUserScript(
            source: bridgeJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(userScript)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .always
        context.coordinator.webView = webView
        webView.load(URLRequest(url: router.currentURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // If the router's load token has changed (e.g. after a deep link),
        // force-load the latest URL in the WebView.
        let currentToken = context.coordinator.lastLoadToken
        if router.loadToken != currentToken {
            context.coordinator.lastLoadToken = router.loadToken
            webView.load(URLRequest(url: router.currentURL))
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, ASWebAuthenticationPresentationContextProviding {
        weak var webView: WKWebView?
        var lastLoadToken: Int = 0
        var authSession: ASWebAuthenticationSession?
        let router: AppRouter

        init(router: AppRouter) { self.router = router }

        // MARK: - Navigation

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            // Hand `weblab://` URLs straight to the router.
            if url.scheme == "weblab" {
                Task { @MainActor in self.router.handleIncomingURL(url) }
                decisionHandler(.cancel)
                return
            }

            // OAuth providers known to block embedded WebViews — route via
            // ASWebAuthenticationSession.
            if Self.isBlockedOAuthHost(url) {
                startAuthSession(initialURL: url)
                decisionHandler(.cancel)
                return
            }

            // External (non-weblab) http(s) URLs — open in Safari.
            if let scheme = url.scheme, scheme.hasPrefix("http"),
               url.host != AppRouter.webOrigin.host,
               navigationAction.targetFrame?.isMainFrame == true,
               !Self.isBlockedOAuthHost(url) == false {
                // (Above branch already handles OAuth providers.)
            }

            decisionHandler(.allow)
        }

        // Allow target=_blank links to navigate in the same WebView so the
        // login redirect dance works.
        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }

        // MARK: - OAuth via ASWebAuthenticationSession

        private func startAuthSession(initialURL: URL) {
            // Cancel any in-flight session.
            authSession?.cancel()

            let session = ASWebAuthenticationSession(
                url: initialURL,
                callbackURLScheme: "weblab"
            ) { [weak self] callbackURL, error in
                guard let self else { return }
                if let error {
                    print("Auth session error: \(error.localizedDescription)")
                    return
                }
                guard let callbackURL else { return }
                Task { @MainActor in self.router.handleIncomingURL(callbackURL) }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false  // share Safari cookies for SSO
            authSession = session
            session.start()
        }

        // MARK: - ASWebAuthenticationPresentationContextProviding

        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            // Use the active key window.
            let scene = UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .first(where: { $0.activationState == .foregroundActive })
            return scene?.keyWindow ?? ASPresentationAnchor()
        }

        // MARK: - Helpers

        private static let blockedOAuthHosts: Set<String> = [
            "accounts.google.com",
            "appleid.apple.com",
        ]

        /// True if this URL is an OAuth provider that's known to refuse
        /// embedded WebViews. GitHub works in WKWebView so it's not listed.
        static func isBlockedOAuthHost(_ url: URL) -> Bool {
            guard let host = url.host?.lowercased() else { return false }
            return blockedOAuthHosts.contains(host)
        }
    }
}

private extension Bundle {
    var shortVersion: String {
        (object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String) ?? "0.0.0"
    }
}
