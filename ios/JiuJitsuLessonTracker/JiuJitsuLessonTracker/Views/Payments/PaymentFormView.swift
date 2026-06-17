import SwiftUI
import SwiftData

/// Record or edit a payment. Provide `payment` to edit, or `presetClient`
/// to pre-select the client when adding from a client's detail screen.
struct PaymentFormView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Client.name) private var clients: [Client]

    var payment: Payment?
    var presetClient: Client?

    @State private var client: Client?
    @State private var date = Date.now
    @State private var amount = 0.0
    @State private var method: PaymentMethod = .cash
    @State private var lessonsCovered = 1
    @State private var note = ""

    private var isEditing: Bool { payment != nil }

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

                Section("Payment") {
                    HStack {
                        Text("Amount")
                        Spacer()
                        TextField("0", value: $amount, format: .currency(code: Locale.current.currency?.identifier ?? "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    Picker("Method", selection: $method) {
                        ForEach(PaymentMethod.allCases) { Label($0.rawValue, systemImage: $0.systemImage).tag($0) }
                    }
                    Stepper("Lessons covered: \(lessonsCovered)", value: $lessonsCovered, in: 0...100)
                }

                Section("Note") {
                    TextField("e.g. 10-lesson package", text: $note, axis: .vertical)
                        .lineLimit(1...4)
                }
            }
            .navigationTitle(isEditing ? "Edit Payment" : "Record Payment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(client == nil || amount <= 0)
                }
            }
            .onAppear(perform: load)
        }
    }

    private func load() {
        if let payment {
            client = payment.client
            date = payment.date
            amount = payment.amount
            method = payment.method
            lessonsCovered = payment.lessonsCovered
            note = payment.note
        } else if let presetClient {
            client = presetClient
        }
    }

    private func save() {
        let target: Payment
        if let payment {
            target = payment
        } else {
            target = Payment()
            context.insert(target)
        }
        target.client = client
        target.date = date
        target.amount = amount
        target.method = method
        target.lessonsCovered = lessonsCovered
        target.note = note
        dismiss()
    }
}

#Preview {
    PaymentFormView()
        .modelContainer(AppModelContainer.makePreview())
}
