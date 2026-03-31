import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PageHeader from "./PageHeader.jsx";

vi.mock("../utils/colorlibPlugins.js", () => ({
  closeColorlibMenu: vi.fn(),
}));

describe("PageHeader", () => {
  it("показывает заголовок, подзаголовок и крошки", () => {
    render(
      <MemoryRouter>
        <PageHeader title="Коллекция" subtitle="Описание раздела" />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Коллекция" })).toBeInTheDocument();
    expect(screen.getByText("Описание раздела")).toBeInTheDocument();

    const crumbs = screen.getByRole("navigation", { name: /хлебные крошки/i });
    expect(within(crumbs).getByRole("link", { name: "Главная" })).toHaveAttribute("href", "/");
    const current = within(crumbs).getByText("Коллекция");
    expect(current.closest("[aria-current]")).toHaveAttribute("aria-current", "page");
  });
});
