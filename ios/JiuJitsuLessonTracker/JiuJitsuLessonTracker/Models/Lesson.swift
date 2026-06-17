import Foundation
import SwiftData

/// A single private lesson — used for both scheduling (future, `.scheduled`)
/// and the lesson log / attendance (past, `.completed` / `.cancelled` / `.noShow`).
@Model
final class Lesson {
    var date: Date = Date.now
    var durationMinutes: Int = 60
    var status: LessonStatus = LessonStatus.scheduled
    var location: String = ""

    /// Free-text or comma-separated list of techniques drilled.
    var techniques: String = ""
    var notes: String = ""

    /// Price charged for this specific lesson (defaults from the client's rate).
    var rate: Double = 0

    var client: Client?

    var createdAt: Date = Date.now

    init(
        date: Date = .now,
        durationMinutes: Int = 60,
        status: LessonStatus = .scheduled,
        location: String = "",
        techniques: String = "",
        notes: String = "",
        rate: Double = 0,
        client: Client? = nil
    ) {
        self.date = date
        self.durationMinutes = durationMinutes
        self.status = status
        self.location = location
        self.techniques = techniques
        self.notes = notes
        self.rate = rate
        self.client = client
        self.createdAt = .now
    }
}

// MARK: - Derived data

extension Lesson {
    var endDate: Date {
        date.addingTimeInterval(TimeInterval(durationMinutes * 60))
    }

    var isPast: Bool { endDate < .now }

    /// Techniques split into trimmed, non-empty tokens for chip display.
    var techniqueTokens: [String] {
        techniques
            .split(whereSeparator: { $0 == "," || $0 == "\n" })
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }
}
