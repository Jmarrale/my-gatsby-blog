import SwiftUI
import SwiftData

struct RootTabView: View {
    @Environment(\.modelContext) private var context

    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Today", systemImage: "sun.max") }

            ClientsListView()
                .tabItem { Label("Clients", systemImage: "person.2") }

            ScheduleView()
                .tabItem { Label("Schedule", systemImage: "calendar") }

            PaymentsView()
                .tabItem { Label("Payments", systemImage: "creditcard") }
        }
        .task {
            // Seed sample data on the very first launch (no-op once data exists).
            SampleData.seedIfEmpty(context)
        }
    }
}

#Preview {
    RootTabView()
        .modelContainer(AppModelContainer.makePreview())
}
