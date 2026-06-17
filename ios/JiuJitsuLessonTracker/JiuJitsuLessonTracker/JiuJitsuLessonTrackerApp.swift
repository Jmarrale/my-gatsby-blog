import SwiftUI
import SwiftData

@main
struct JiuJitsuLessonTrackerApp: App {
    let modelContainer = AppModelContainer.makeShared()

    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
        .modelContainer(modelContainer)
    }
}
