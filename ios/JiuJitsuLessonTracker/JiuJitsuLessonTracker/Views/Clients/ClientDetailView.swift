import SwiftUI
import SwiftData

struct ClientDetailView: View {
    @Bindable var client: Client
    @Environment(\.modelContext) private var context

    @State private var showingEdit = false
    @State private var showingAddLesson = false
    @State private var showingAddPayment = false

    private var recentLessons: [Lesson] {
        client.lessonsList.sorted { $0.date > $1.date }
    }

    var body: some View {
        List {
            header

            statsSection

            if !client.upcomingLessons.isEmpty {
                Section("Upcoming") {
                    ForEach(client.upcomingLessons) { lesson in
                        NavigationLink {
                            LessonFormView(lesson: lesson)
                        } label: {
                            LessonRow(lesson: lesson, showClient: false)
                        }
                    }
                }
            }

            Section {
                if recentLessons.isEmpty {
                    Text("No lessons logged yet.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(recentLessons) { lesson in
                        NavigationLink {
                            LessonFormView(lesson: lesson)
                        } label: {
                            LessonRow(lesson: lesson, showClient: false)
                        }
                    }
                    .onDelete(perform: deleteLessons)
                }
            } header: {
                HStack {
                    Text("Lesson Log")
                    Spacer()
                    Button {
                        showingAddLesson = true
                    } label: {
                        Label("Add", systemImage: "plus")
                            .labelStyle(.titleAndIcon)
                            .font(.caption)
                    }
                }
            }

            paymentsSection

            if !client.notes.isEmpty {
                Section("Notes") {
                    Text(client.notes)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle(client.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Edit") { showingEdit = true }
            }
        }
        .sheet(isPresented: $showingEdit) {
            ClientFormView(client: client)
        }
        .sheet(isPresented: $showingAddLesson) {
            LessonFormView(presetClient: client)
        }
        .sheet(isPresented: $showingAddPayment) {
            PaymentFormView(presetClient: client)
        }
    }

    // MARK: Sections

    private var header: some View {
        Section {
            HStack(spacing: 16) {
                ClientAvatar(client: client, size: 64)
                VStack(alignment: .leading, spacing: 6) {
                    Text(client.displayName)
                        .font(.title3.bold())
                    BeltBadge(belt: client.belt, stripes: client.stripes)
                    Text("Training since \(client.startDate.formatted(.dateTime.month(.abbreviated).year()))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }
            .padding(.vertical, 4)

            if !client.email.isEmpty || !client.phone.isEmpty {
                HStack(spacing: 24) {
                    if let url = URL(string: "tel:\(client.phone)"), !client.phone.isEmpty {
                        Link(destination: url) {
                            Label("Call", systemImage: "phone")
                        }
                    }
                    if let url = URL(string: "mailto:\(client.email)"), !client.email.isEmpty {
                        Link(destination: url) {
                            Label("Email", systemImage: "envelope")
                        }
                    }
                }
                .font(.subheadline)
            }
        }
    }

    private var statsSection: some View {
        Section {
            HStack(spacing: 12) {
                StatTile(title: "Completed", value: "\(client.completedLessons.count)", systemImage: "checkmark.circle", tint: .green)
                StatTile(title: "Prepaid left", value: "\(client.lessonsRemaining)", systemImage: "ticket", tint: client.lessonsRemaining < 0 ? .red : .blue)
                StatTile(title: "Balance", value: Format.money(client.outstandingBalance), systemImage: "dollarsign.circle", tint: client.outstandingBalance > 0 ? .red : .green)
            }
            .listRowInsets(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12))
            .listRowBackground(Color.clear)
        }
    }

    private var paymentsSection: some View {
        Section {
            let payments = client.paymentsList.sorted { $0.date > $1.date }
            if payments.isEmpty {
                Text("No payments recorded.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(payments) { payment in
                    PaymentRow(payment: payment, showClient: false)
                }
                .onDelete { offsets in
                    for index in offsets { context.delete(payments[index]) }
                }
            }
        } header: {
            HStack {
                Text("Payments")
                Spacer()
                Button {
                    showingAddPayment = true
                } label: {
                    Label("Add", systemImage: "plus")
                        .labelStyle(.titleAndIcon)
                        .font(.caption)
                }
            }
        }
    }

    private func deleteLessons(at offsets: IndexSet) {
        for index in offsets { context.delete(recentLessons[index]) }
    }
}

#Preview {
    NavigationStack {
        PreviewClientDetail()
    }
    .modelContainer(AppModelContainer.makePreview())
}

/// Helper that grabs the first sample client for the preview.
private struct PreviewClientDetail: View {
    @Query(sort: \Client.name) private var clients: [Client]
    var body: some View {
        if let client = clients.first {
            ClientDetailView(client: client)
        } else {
            Text("No sample client")
        }
    }
}
