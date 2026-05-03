import SwiftUI

@main
struct WeblabApp: App {
    @StateObject private var router = AppRouter()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(router)
                .onOpenURL { url in
                    router.handleIncomingURL(url)
                }
        }
    }
}
