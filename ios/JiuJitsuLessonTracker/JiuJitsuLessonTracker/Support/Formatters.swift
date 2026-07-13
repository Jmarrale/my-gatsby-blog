import Foundation

/// Shared, reusable formatters and small formatting helpers.
enum Format {

    static let currency: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 2
        return f
    }()

    static func money(_ value: Double) -> String {
        currency.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    static func duration(_ minutes: Int) -> String {
        guard minutes >= 60 else { return "\(minutes) min" }
        let hours = minutes / 60
        let mins = minutes % 60
        return mins == 0 ? "\(hours) hr" : "\(hours) hr \(mins) min"
    }

    /// "Today", "Tomorrow", "Yesterday", or a medium date.
    static func relativeDay(_ date: Date) -> String {
        let cal = Calendar.current
        if cal.isDateInToday(date) { return "Today" }
        if cal.isDateInTomorrow(date) { return "Tomorrow" }
        if cal.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
    }

    static func time(_ date: Date) -> String {
        date.formatted(date: .omitted, time: .shortened)
    }
}
