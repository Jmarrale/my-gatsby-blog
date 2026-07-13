import SwiftUI

/// A single lesson row used in the schedule and on client detail screens.
struct LessonRow: View {
    let lesson: Lesson
    var showClient: Bool = true

    var body: some View {
        HStack(spacing: 12) {
            VStack(spacing: 2) {
                Text(Format.time(lesson.date))
                    .font(.callout.weight(.semibold))
                    .monospacedDigit()
                Text(Format.duration(lesson.durationMinutes))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 64)

            Rectangle()
                .fill(lesson.status.tint)
                .frame(width: 3)
                .clipShape(Capsule())

            VStack(alignment: .leading, spacing: 4) {
                if showClient {
                    Text(lesson.client?.displayName ?? "No client")
                        .font(.headline)
                }
                if !lesson.techniqueTokens.isEmpty {
                    Text(lesson.techniqueTokens.joined(separator: " • "))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                } else if !lesson.location.isEmpty {
                    Label(lesson.location, systemImage: "mappin.and.ellipse")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer(minLength: 4)
            StatusBadge(status: lesson.status)
        }
        .padding(.vertical, 4)
    }
}
