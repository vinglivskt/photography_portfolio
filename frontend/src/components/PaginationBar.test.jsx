import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PaginationBar from "./PaginationBar.jsx";

vi.mock("../utils/colorlibPlugins.js", () => ({
  closeColorlibMenu: vi.fn(),
}));

describe("PaginationBar", () => {
  it("не рендерится при одной странице", () => {
    const { container } = render(
      <MemoryRouter>
        <PaginationBar page={1} pages={1} basePath="/blog" />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("показывает текущую страницу и ссылки", () => {
    render(
      <MemoryRouter initialEntries={["/blog?page=2"]}>
        <PaginationBar page={2} pages={4} basePath="/blog" />
      </MemoryRouter>
    );

    expect(screen.getByRole("navigation", { name: /постраничная навигация/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute("href", "/blog?page=3");
    expect(screen.getByRole("link", { name: "«" })).toHaveAttribute("href", "/blog");
  });
});
