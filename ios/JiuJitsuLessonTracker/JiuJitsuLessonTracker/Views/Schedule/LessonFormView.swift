import SwiftUI
import SwiftData

/// Add or edit a lesson. Provide `lesson` to edit, or `presetClient` to
/// pre-select a client when scheduling from a client's detail screen.
struct LessonFormView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Client.name) private var clients: [Client]

    var lesson: Lesson?
    var presetClient: Client?

    @State private var client: Client?
    @State private var date = Date.now
    @State private var durationMinutes = 60
    @State private var status: LessonStatus = .scheduled
    @State private var location = ""
    @State private var techniques = ""
    @State private var notes = ""
    @State private var rate = 0.0

    private var isEditing: Bool { lesson != nil }

    private let durationOptions = [30, 45, 60, 75, 90, 120]

    var body: some View {
        NavigationStack {
            Form {
                Section("Client") {
                    Picker("Client", selection: $client) {
                        Text("Select…").tag(Client?.none)
                        ForEach(clients) { c in
                            Text(c.displayName).tag(Client?.some(c))
                        }
                    }
                }

                Section("When") {
                    DatePicker("Date & time", selection: $date)
                    Picker("Duration", selection: $durationMinutes) {
                        ForEach(durationOptions, id: \.self) { Text(Format.duration($0)).tag($0) }
                    }
                    Picker("Status", selection: $status) {
                        ForEach(LessonStatus.allCases) { Label($0.rawValue, systemImage: $0.systemImage).tag($0) }
                    }
                }

                Section("Details") {
                    TextField("Location (e.g. Main mat)", text: $location)
                    TextField("Techniques (comma separated)", text: $techniques, axis: .vertical)
                        .lineLimit(2...6)
                    HStack {
                        Text("Rate")
                        Spacer()
                        TextField("0", value: $rate, format: .currency(code: Locale.current.currency?.identifier ?? "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Notes") {
                    TextField("How did it go?", text: $notes, axis: .vertical)
                        .lineLimit(3...8)
                }
            }
            .navigationTitle(isEditing ? "Edit Lesson" : "New Lesson")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(client == nil)
                }
            }
            .onAppear(perform: load)
            .onChange(of: client) { _, newValue in
                // Default the rate to the client's standard rate when unset.
                if rate == 0, let r = newValue?.defaultLessonRate { rate = r }
            }
        }
    }

    private func load() {
        if let lesson {
            client = lesson.client
            date = lesson.date
            durationMinutes = lesson.durationMinutes
            status = lesson.status
            location = lesson.location
            techniques = lesson.techniques
            notes = lesson.notes
            rate = lesson.rate
        } else if let presetClient {
            client = presetClient
            rate = presetClient.defaultLessonRate
            location = presetClient.lessonsList.first?.location ?? ""
        }
    }

    private func save() {
        let target: Lesson
        if let lesson {
            target = lesson
        } else {
            target = Lesson()
            context.insert(target)
        }
        target.client = client
        target.date = date
        target.durationMinutes = durationMinutes
        target.status = status
        target.location = location
        target.techniques = techniques
        target.notes = notes
        target.rate = rate
        dismiss()
    }
}

#Preview {
    LessonFormView()
        .modelContainer(AppModelContainer.makePreview())
}
