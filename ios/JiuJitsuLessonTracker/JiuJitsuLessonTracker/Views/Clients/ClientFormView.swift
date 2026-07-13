import SwiftUI
import SwiftData

/// Add or edit a client. Pass an existing client to edit, or omit to create.
struct ClientFormView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss

    /// The client being edited, or `nil` when creating a new one.
    var client: Client?

    @State private var name = ""
    @State private var belt: BeltRank = .white
    @State private var stripes = 0
    @State private var email = ""
    @State private var phone = ""
    @State private var startDate = Date.now
    @State private var notes = ""
    @State private var isActive = true
    @State private var defaultLessonRate = 0.0

    private var isEditing: Bool { client != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    TextField("Full name", text: $name)
                        .textInputAutocapitalization(.words)
                    Picker("Belt", selection: $belt) {
                        ForEach(BeltRank.allCases) { Text($0.rawValue).tag($0) }
                    }
                    Stepper("Stripes: \(stripes)", value: $stripes, in: 0...4)
                    DatePicker("Training since", selection: $startDate, displayedComponents: .date)
                    Toggle("Active client", isOn: $isActive)
                }

                Section("Contact") {
                    TextField("Email", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }

                Section("Billing") {
                    HStack {
                        Text("Default lesson rate")
                        Spacer()
                        TextField("0", value: $defaultLessonRate, format: .currency(code: Locale.current.currency?.identifier ?? "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Notes") {
                    TextField("Goals, injuries, preferences…", text: $notes, axis: .vertical)
                        .lineLimit(3...8)
                }
            }
            .navigationTitle(isEditing ? "Edit Client" : "New Client")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: loadIfEditing)
        }
    }

    private func loadIfEditing() {
        guard let client else { return }
        name = client.name
        belt = client.belt
        stripes = client.stripes
        email = client.email
        phone = client.phone
        startDate = client.startDate
        notes = client.notes
        isActive = client.isActive
        defaultLessonRate = client.defaultLessonRate
    }

    private func save() {
        let target: Client
        if let client {
            target = client
        } else {
            target = Client()
            context.insert(target)
        }
        target.name = name.trimmingCharacters(in: .whitespaces)
        target.belt = belt
        target.stripes = stripes
        target.email = email
        target.phone = phone
        target.startDate = startDate
        target.notes = notes
        target.isActive = isActive
        target.defaultLessonRate = defaultLessonRate
        dismiss()
    }
}

#Preview {
    ClientFormView()
        .modelContainer(AppModelContainer.makePreview())
}
