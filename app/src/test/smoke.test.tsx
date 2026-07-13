import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AuthProvider } from "../auth/AuthProvider";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("app smoke test (local/mock mode)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the dashboard with the Today heading", async () => {
    renderAt("/");
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument(),
    );
    // Bottom nav is present with all five tabs.
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("lists seeded sample students", async () => {
    renderAt("/students");
    await waitFor(() =>
      expect(screen.getByText("Alex Costa")).toBeInTheDocument(),
    );
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
  });
});
