import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var router: AppRouter

    var body: some View {
        WebView()
            .ignoresSafeArea(.container, edges: [])
            .background(Color.black)
            .preferredColorScheme(.dark)
    }
}
