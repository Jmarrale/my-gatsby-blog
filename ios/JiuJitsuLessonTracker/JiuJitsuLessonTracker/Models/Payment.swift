import Foundation
import SwiftData

/// A payment received from a client. Supports package tracking via
/// `lessonsCovered` (e.g. a 10-lesson package paid up front).
@Model
final class Payment {
    var date: Date = Date.now
    var amount: Double = 0
    var method: PaymentMethod = PaymentMethod.cash

    /// How many lessons this payment prepays for. Use 0 for non-lesson charges.
    var lessonsCovered: Int = 1

    var note: String = ""

    var client: Client?

    var createdAt: Date = Date.now

    init(
        date: Date = .now,
        amount: Double = 0,
        method: PaymentMethod = .cash,
        lessonsCovered: Int = 1,
        note: String = "",
        client: Client? = nil
    ) {
        self.date = date
        self.amount = amount
        self.method = method
        self.lessonsCovered = lessonsCovered
        self.note = note
        self.client = client
        self.createdAt = .now
    }
}
