import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(sort: \Lesson.date) private var lessons: [Lesson]
    @Query private var clients: [Client]
    @Query private var payments: [Payment]

    @State private var showingAddLesson = false

    private let cal = Calendar.current

    private var todaysLessons: [Lesson] {
        lessons.filter { cal.isDateInToday($0.date) }.sorted { $0.date < $1.date }
    }

    private var weekCount: Int {
        lessons.filter {
            cal.isDate($0.date, equalTo: .now, toGranularity: .weekOfYear) && $0.date >= cal.startOfDay(for: .now)
        }.count
    }

    private var activeClientCount: Int {
        clients.filter(\.isActive).count
    }

    private var monthRevenue: Double {
        payments
            .filter { cal.isDate($0.date, equalTo: .now, toGranularity: .month) }
            .reduce(0) { $0 + $1.amount }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        StatTile(title: "Today", value: "\(todaysLessons.count)", systemImage: "calendar.day.timeline.left", tint: .blue)
                        StatTile(title: "This week", value: "\(weekCount)", systemImage: "calendar", tint: .indigo)
                        StatTile(title: "Active clients", value: "\(activeClientCount)", systemImage: "person.2", tint: .purple)
                        StatTile(title: "Revenue (mo.)", value: Format.money(monthRevenue), systemImage: "dollarsign.circle", tint: .green)
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12))
                    .listRowBackground(Color.clear)
                }

                Section("Today's Lessons") {
                    if todaysLessons.isEmpty {
                        HStack {
                            Image(systemName: "checkmark.circle")
                                .foregroundStyle(.green)
                            Text("No lessons scheduled today.")
                                .foregroundStyle(.secondary)
                        }
                    } else {
                        ForEach(todaysLessons) { lesson in
                            NavigationLink {
                                LessonFormView(lesson: lesson)
                            } label: {
                                LessonRow(lesson: lesson)
                            }
                        }
                    }
                }
            }
            .navigationTitle(Date.now.formatted(.dateTime.weekday(.wide).month().day()))
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAddLesson = true } label: {
                        Label("Schedule Lesson", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddLesson) {
                LessonFormView()
            }
        }
    }
}

#Preview {
    DashboardView()
        .modelContainer(AppModelContainer.makePreview())
}
