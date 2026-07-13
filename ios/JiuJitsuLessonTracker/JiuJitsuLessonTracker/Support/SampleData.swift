import Foundation
import SwiftData

/// Seed data so the app shows something useful on first launch and in previews.
enum SampleData {

    /// Inserts sample clients with lessons and payments into the context.
    @MainActor
    static func populate(_ context: ModelContext) {
        let cal = Calendar.current
        let today = cal.startOfDay(for: .now)

        func day(_ offset: Int, hour: Int = 17, minute: Int = 0) -> Date {
            let base = cal.date(byAdding: .day, value: offset, to: today) ?? today
            return cal.date(bySettingHour: hour, minute: minute, second: 0, of: base) ?? base
        }

        // MARK: Alex — active blue belt on a 10-pack
        let alex = Client(
            name: "Alex Costa",
            belt: .blue,
            stripes: 2,
            email: "alex.costa@example.com",
            phone: "555-0142",
            startDate: cal.date(byAdding: .month, value: -14, to: today) ?? today,
            notes: "Competing at the next local open. Working takedowns.",
            defaultLessonRate: 80
        )
        context.insert(alex)
        context.insert(Payment(date: day(-20), amount: 800, method: .card, lessonsCovered: 10, note: "10-lesson package", client: alex))
        context.insert(Lesson(date: day(-18), status: .completed, location: "Main mat", techniques: "Single leg, sprawl defense", rate: 80, client: alex))
        context.insert(Lesson(date: day(-11), status: .completed, location: "Main mat", techniques: "Guard retention, hip escape", rate: 80, client: alex))
        context.insert(Lesson(date: day(-4), status: .completed, location: "Main mat", techniques: "Knee cut pass, underhook", rate: 80, client: alex))
        context.insert(Lesson(date: day(2), status: .scheduled, location: "Main mat", techniques: "Leg drag, back takes", rate: 80, client: alex))
        context.insert(Lesson(date: day(9), status: .scheduled, location: "Main mat", rate: 80, client: alex))

        // MARK: Maria — newer white belt, pay-as-you-go
        let maria = Client(
            name: "Maria Santos",
            belt: .white,
            stripes: 3,
            email: "maria.s@example.com",
            phone: "555-0188",
            startDate: cal.date(byAdding: .month, value: -5, to: today) ?? today,
            notes: "Focus on fundamentals and confidence. Prefers morning sessions.",
            defaultLessonRate: 70
        )
        context.insert(maria)
        context.insert(Payment(date: day(-7), amount: 70, method: .cash, lessonsCovered: 1, note: "Single lesson", client: maria))
        context.insert(Lesson(date: day(-7, hour: 9), status: .completed, location: "Studio B", techniques: "Mount escapes, bridge & roll", rate: 70, client: maria))
        context.insert(Lesson(date: day(1, hour: 9), status: .scheduled, location: "Studio B", techniques: "Closed guard basics", rate: 70, client: maria))

        // MARK: Jordan — purple belt prepping for competition
        let jordan = Client(
            name: "Jordan Lee",
            belt: .purple,
            stripes: 0,
            email: "jordan.lee@example.com",
            phone: "555-0119",
            startDate: cal.date(byAdding: .year, value: -4, to: today) ?? today,
            notes: "Advanced. Drilling competition-specific scenarios.",
            defaultLessonRate: 95
        )
        context.insert(jordan)
        context.insert(Payment(date: day(-30), amount: 475, method: .bankTransfer, lessonsCovered: 5, note: "5-lesson package", client: jordan))
        context.insert(Lesson(date: day(-25), status: .completed, location: "Main mat", techniques: "Berimbolo, leg lock entries", rate: 95, client: jordan))
        context.insert(Lesson(date: day(-12), status: .completed, location: "Main mat", techniques: "Pressure passing", rate: 95, client: jordan))
        context.insert(Lesson(date: day(-3), status: .noShow, location: "Main mat", notes: "Did not show — follow up.", rate: 95, client: jordan))
        context.insert(Lesson(date: day(3, hour: 18), status: .scheduled, location: "Main mat", techniques: "Comp simulation rounds", rate: 95, client: jordan))

        try? context.save()
    }

    /// Seeds sample data only if the store has no clients yet.
    @MainActor
    static func seedIfEmpty(_ context: ModelContext) {
        let descriptor = FetchDescriptor<Client>()
        let count = (try? context.fetchCount(descriptor)) ?? 0
        guard count == 0 else { return }
        populate(context)
    }
}
