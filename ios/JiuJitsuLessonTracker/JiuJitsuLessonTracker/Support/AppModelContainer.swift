import Foundation
import SwiftData

/// Centralizes SwiftData container creation.
///
/// ## Enabling iCloud (CloudKit) sync
/// The app ships using **local on-device storage** so it builds and runs with
/// zero configuration in the Simulator. To turn on cross-device cloud sync:
///
/// 1. In Xcode select the target → **Signing & Capabilities**.
/// 2. Pick your Team, then **+ Capability → iCloud** and check **CloudKit**.
///    Add a container named `iCloud.com.example.JiuJitsuLessonTracker`
///    (or match it to your bundle identifier).
/// 3. **+ Capability → Background Modes** and check **Remote notifications**
///    so the app syncs in the background.
/// 4. Set `useCloudKit = true` below and rebuild.
///
/// SwiftData then mirrors the local store to your private CloudKit database
/// automatically — no extra code required.
enum AppModelContainer {

    /// Flip to `true` after completing the CloudKit setup steps above.
    static let useCloudKit = false

    /// The schema shared by the app and previews.
    static let schema = Schema([
        Client.self,
        Lesson.self,
        Payment.self,
    ])

    /// Builds the production container (persisted to disk).
    static func makeShared() -> ModelContainer {
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false,
            cloudKitDatabase: useCloudKit ? .automatic : .none
        )
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    /// An in-memory container seeded with sample data, for SwiftUI previews.
    @MainActor
    static func makePreview() -> ModelContainer {
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: true,
            cloudKitDatabase: .none
        )
        do {
            let container = try ModelContainer(for: schema, configurations: [configuration])
            SampleData.populate(container.mainContext)
            return container
        } catch {
            fatalError("Failed to create preview ModelContainer: \(error)")
        }
    }
}
