import SwiftUI
import SwiftData

struct ClientsListView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Client.name) private var clients: [Client]
    @State private var searchText = ""
    @State private var showingAdd = false

    private var filtered: [Client] {
        guard !searchText.isEmpty else { return clients }
        return clients.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    private var activeClients: [Client] { filtered.filter(\.isActive) }
    private var inactiveClients: [Client] { filtered.filter { !$0.isActive } }

    var body: some View {
        NavigationStack {
            Group {
                if clients.isEmpty {
                    ContentUnavailableView {
                        Label("No clients yet", systemImage: "person.2")
                    } description: {
                        Text("Add your first private-lesson student to get started.")
                    } actions: {
                        Button("Add Client") { showingAdd = true }
                            .buttonStyle(.borderedProminent)
                    }
                } else {
                    List {
                        Section(activeClients.isEmpty ? "" : "Active") {
                            ForEach(activeClients) { client in
                                clientRow(client)
                            }
                        }
                        if !inactiveClients.isEmpty {
                            Section("Inactive") {
                                ForEach(inactiveClients) { client in
                                    clientRow(client)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Clients")
            .searchable(text: $searchText, prompt: "Search clients")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAdd = true } label: {
                        Label("Add Client", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAdd) {
                ClientFormView()
            }
        }
    }

    private func clientRow(_ client: Client) -> some View {
        NavigationLink {
            ClientDetailView(client: client)
        } label: {
            HStack(spacing: 12) {
                ClientAvatar(client: client)
                VStack(alignment: .leading, spacing: 4) {
                    Text(client.displayName)
                        .font(.headline)
                    BeltBadge(belt: client.belt, stripes: client.stripes)
                }
                Spacer()
                if let next = client.nextLesson {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Next")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text(Format.relativeDay(next.date))
                            .font(.caption.weight(.medium))
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive) {
                context.delete(client)
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}

#Preview {
    ClientsListView()
        .modelContainer(AppModelContainer.makePreview())
}
