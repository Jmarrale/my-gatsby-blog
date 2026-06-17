import SwiftUI
import SwiftData

struct PaymentsView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Payment.date, order: .reverse) private var payments: [Payment]
    @State private var showingAdd = false

    private var thisMonthTotal: Double {
        let cal = Calendar.current
        return payments
            .filter { cal.isDate($0.date, equalTo: .now, toGranularity: .month) }
            .reduce(0) { $0 + $1.amount }
    }

    private var allTimeTotal: Double {
        payments.reduce(0) { $0 + $1.amount }
    }

    /// Payments grouped by "Month Year" header.
    private var grouped: [(label: String, key: Date, payments: [Payment])] {
        let cal = Calendar.current
        let groups = Dictionary(grouping: payments) { payment -> Date in
            let comps = cal.dateComponents([.year, .month], from: payment.date)
            return cal.date(from: comps) ?? payment.date
        }
        return groups.keys.sorted(by: >).map { key in
            (key.formatted(.dateTime.month(.wide).year()), key, groups[key]!.sorted { $0.date > $1.date })
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if payments.isEmpty {
                    ContentUnavailableView {
                        Label("No payments yet", systemImage: "creditcard")
                    } description: {
                        Text("Record a payment with the + button to start tracking revenue.")
                    } actions: {
                        Button("Record Payment") { showingAdd = true }
                            .buttonStyle(.borderedProminent)
                    }
                } else {
                    List {
                        Section {
                            HStack(spacing: 12) {
                                StatTile(title: "This month", value: Format.money(thisMonthTotal), systemImage: "calendar", tint: .green)
                                StatTile(title: "All time", value: Format.money(allTimeTotal), systemImage: "sum", tint: .blue)
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12))
                            .listRowBackground(Color.clear)
                        }

                        ForEach(grouped, id: \.key) { group in
                            Section(group.label) {
                                ForEach(group.payments) { payment in
                                    PaymentRow(payment: payment)
                                }
                                .onDelete { offsets in
                                    for index in offsets { context.delete(group.payments[index]) }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Payments")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAdd = true } label: {
                        Label("Record Payment", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAdd) {
                PaymentFormView()
            }
        }
    }
}

#Preview {
    PaymentsView()
        .modelContainer(AppModelContainer.makePreview())
}
