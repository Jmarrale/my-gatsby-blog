import Foundation
import SwiftData

/// A private-lesson client (student).
///
/// All properties have default values and relationships are optional so the
/// model is compatible with CloudKit-backed SwiftData syncing.
@Model
final class Client {
    var name: String = ""
    var belt: BeltRank = BeltRank.white
    var stripes: Int = 0
    var email: String = ""
    var phone: String = ""
    var startDate: Date = Date.now
    var notes: String = ""
    var isActive: Bool = true

    /// Default price charged for one private lesson with this client.
    var defaultLessonRate: Double = 0

    /// Inverse relationships. Deleting a client cascades to their records.
    @Relationship(deleteRule: .cascade, inverse: \Lesson.client)
    var lessons: [Lesson]? = []

    @Relationship(deleteRule: .cascade, inverse: \Payment.client)
    var payments: [Payment]? = []

    var createdAt: Date = Date.now

    init(
        name: String = "",
        belt: BeltRank = .white,
        stripes: Int = 0,
        email: String = "",
        phone: String = "",
        startDate: Date = .now,
        notes: String = "",
        isActive: Bool = true,
        defaultLessonRate: Double = 0
    ) {
        self.name = name
        self.belt = belt
        self.stripes = stripes
        self.email = email
        self.phone = phone
        self.startDate = startDate
        self.notes = notes
        self.isActive = isActive
        self.defaultLessonRate = defaultLessonRate
        self.createdAt = .now
    }
}

// MARK: - Derived data

extension Client {
    var lessonsList: [Lesson] { lessons ?? [] }
    var paymentsList: [Payment] { payments ?? [] }

    /// First and last initial, for the avatar badge.
    var initials: String {
        let parts = name.split(separator: " ")
        let letters = parts.prefix(2).compactMap { $0.first }
        let result = String(letters).uppercased()
        return result.isEmpty ? "?" : result
    }

    var displayName: String {
        name.trimmingCharacters(in: .whitespaces).isEmpty ? "Unnamed client" : name
    }

    var completedLessons: [Lesson] {
        lessonsList.filter { $0.status == .completed }
    }

    var upcomingLessons: [Lesson] {
        lessonsList
            .filter { $0.status == .scheduled && $0.date >= Calendar.current.startOfDay(for: .now) }
            .sorted { $0.date < $1.date }
    }

    var nextLesson: Lesson? { upcomingLessons.first }

    var totalPaid: Double {
        paymentsList.reduce(0) { $0 + $1.amount }
    }

    /// Number of lessons the client has prepaid for across all payments.
    var lessonsPrepaid: Int {
        paymentsList.reduce(0) { $0 + $1.lessonsCovered }
    }

    /// Prepaid lessons remaining after accounting for completed lessons.
    var lessonsRemaining: Int {
        lessonsPrepaid - completedLessons.count
    }

    /// Estimated outstanding balance: completed lessons not covered by prepayment.
    var outstandingBalance: Double {
        let owed = Double(max(0, -lessonsRemaining)) * defaultLessonRate
        return owed
    }
}
