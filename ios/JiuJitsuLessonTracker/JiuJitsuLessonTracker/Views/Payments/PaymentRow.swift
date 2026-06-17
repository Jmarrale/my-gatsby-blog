import SwiftUI

struct PaymentRow: View {
    let payment: Payment
    var showClient: Bool = true

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: payment.method.systemImage)
                .font(.title3)
                .foregroundStyle(.green)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 3) {
                if showClient {
                    Text(payment.client?.displayName ?? "—")
                        .font(.headline)
                }
                HStack(spacing: 6) {
                    Text(payment.date.formatted(.dateTime.month(.abbreviated).day().year()))
                    if payment.lessonsCovered > 0 {
                        Text("· \(payment.lessonsCovered) lesson\(payment.lessonsCovered == 1 ? "" : "s")")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
                if !payment.note.isEmpty {
                    Text(payment.note)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()
            Text(Format.money(payment.amount))
                .font(.headline.monospacedDigit())
                .foregroundStyle(.green)
        }
        .padding(.vertical, 2)
    }
}
