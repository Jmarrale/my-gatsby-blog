import SwiftUI

/// A small belt-rank pill with stripe markers, e.g. "Blue •• ".
struct BeltBadge: View {
    let belt: BeltRank
    var stripes: Int = 0

    var body: some View {
        HStack(spacing: 4) {
            Text(belt.rawValue)
                .font(.caption.weight(.semibold))
            if stripes > 0 {
                HStack(spacing: 2) {
                    ForEach(0..<min(stripes, 4), id: \.self) { _ in
                        Circle()
                            .fill(belt.textColor)
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .foregroundStyle(belt.textColor)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(belt.color, in: Capsule())
        .overlay(
            Capsule().strokeBorder(Color.primary.opacity(belt == .white ? 0.2 : 0), lineWidth: 1)
        )
    }
}

/// Circular avatar showing a client's initials, tinted by belt color.
struct ClientAvatar: View {
    let client: Client
    var size: CGFloat = 44

    var body: some View {
        Circle()
            .fill(client.belt.color.gradient)
            .frame(width: size, height: size)
            .overlay(
                Text(client.initials)
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundStyle(client.belt.textColor)
            )
            .overlay(
                Circle().strokeBorder(Color.primary.opacity(client.belt == .white ? 0.15 : 0), lineWidth: 1)
            )
    }
}

#Preview {
    VStack(spacing: 16) {
        BeltBadge(belt: .white, stripes: 3)
        BeltBadge(belt: .blue, stripes: 2)
        BeltBadge(belt: .purple)
        BeltBadge(belt: .brown, stripes: 1)
        BeltBadge(belt: .black)
    }
    .padding()
}
