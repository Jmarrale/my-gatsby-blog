import SwiftUI

/// Brazilian Jiu-Jitsu adult belt ranks, in progression order.
enum BeltRank: String, Codable, CaseIterable, Identifiable, Comparable {
    case white = "White"
    case blue = "Blue"
    case purple = "Purple"
    case brown = "Brown"
    case black = "Black"

    var id: String { rawValue }

    /// Sort/progression index used for `Comparable` conformance.
    private var order: Int {
        Self.allCases.firstIndex(of: self) ?? 0
    }

    static func < (lhs: BeltRank, rhs: BeltRank) -> Bool {
        lhs.order < rhs.order
    }

    /// Display color for the belt badge.
    var color: Color {
        switch self {
        case .white: return Color(white: 0.85)
        case .blue: return .blue
        case .purple: return .purple
        case .brown: return .brown
        case .black: return .black
        }
    }

    /// Contrasting color for text drawn on top of the belt color.
    var textColor: Color {
        self == .white ? .black : .white
    }
}

/// Lifecycle of a single lesson. Drives both the schedule and attendance.
enum LessonStatus: String, Codable, CaseIterable, Identifiable {
    case scheduled = "Scheduled"
    case completed = "Completed"
    case cancelled = "Cancelled"
    case noShow = "No-show"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .scheduled: return "calendar"
        case .completed: return "checkmark.circle.fill"
        case .cancelled: return "xmark.circle"
        case .noShow: return "person.fill.xmark"
        }
    }

    var tint: Color {
        switch self {
        case .scheduled: return .blue
        case .completed: return .green
        case .cancelled: return .orange
        case .noShow: return .red
        }
    }
}

/// How a payment was received.
enum PaymentMethod: String, Codable, CaseIterable, Identifiable {
    case cash = "Cash"
    case card = "Card"
    case bankTransfer = "Bank transfer"
    case venmo = "Venmo"
    case paypal = "PayPal"
    case other = "Other"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .cash: return "banknote"
        case .card: return "creditcard"
        case .bankTransfer: return "building.columns"
        case .venmo, .paypal: return "dollarsign.circle"
        case .other: return "ellipsis.circle"
        }
    }
}
