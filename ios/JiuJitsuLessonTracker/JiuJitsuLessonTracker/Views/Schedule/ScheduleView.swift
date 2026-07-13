import SwiftUI
import SwiftData

struct ScheduleView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Lesson.date) private var lessons: [Lesson]
    @State private var showingAdd = false
    @State private var scope: Scope = .upcoming

    enum Scope: String, CaseIterable, Identifiable {
        case upcoming = "Upcoming"
        case past = "Past"
        var id: String { rawValue }
    }

    private var startOfToday: Date { Calendar.current.startOfDay(for: .now) }

    private var visibleLessons: [Lesson] {
        switch scope {
        case .upcoming:
            return lessons.filter { $0.date >= startOfToday }
        case .past:
            return lessons.filter { $0.date < startOfToday }
        }
    }

    /// Lessons grouped by calendar day, preserving order.
    private var grouped: [(day: Date, lessons: [Lesson])] {
        let cal = Calendar.current
        let groups = Dictionary(grouping: visibleLessons) { cal.startOfDay(for: $0.date) }
        return groups.keys.sorted { scope == .upcoming ? $0 < $1 : $0 > $1 }
            .map { ($0, groups[$0]!.sorted { $0.date < $1.date }) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if visibleLessons.isEmpty {
                    ContentUnavailableView {
                        Label(scope == .upcoming ? "Nothing scheduled" : "No past lessons",
                              systemImage: "calendar")
                    } description: {
                        Text(scope == .upcoming
                             ? "Schedule a lesson with the + button."
                             : "Completed and past lessons will appear here.")
                    }
                } else {
                    List {
                        ForEach(grouped, id: \.day) { group in
                            Section(dayHeader(group.day)) {
                                ForEach(group.lessons) { lesson in
                                    NavigationLink {
                                        LessonFormView(lesson: lesson)
                                    } label: {
                                        LessonRow(lesson: lesson)
                                    }
                                    .swipeActions(edge: .leading) {
                                        if lesson.status == .scheduled {
                                            Button {
                                                lesson.status = .completed
                                            } label: {
                                                Label("Done", systemImage: "checkmark")
                                            }
                                            .tint(.green)
                                        }
                                    }
                                    .swipeActions(edge: .trailing) {
                                        Button(role: .destructive) {
                                            context.delete(lesson)
                                        } label: {
                                            Label("Delete", systemImage: "trash")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Picker("Scope", selection: $scope) {
                        ForEach(Scope.allCases) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                }
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAdd = true } label: {
                        Label("Schedule Lesson", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAdd) {
                LessonFormView()
            }
        }
    }

    private func dayHeader(_ day: Date) -> String {
        let cal = Calendar.current
        let full = day.formatted(.dateTime.weekday(.wide).month().day())
        if cal.isDateInToday(day) || cal.isDateInTomorrow(day) || cal.isDateInYesterday(day) {
            return "\(Format.relativeDay(day)) · \(full)"
        }
        return full
    }
}

#Preview {
    ScheduleView()
        .modelContainer(AppModelContainer.makePreview())
}
