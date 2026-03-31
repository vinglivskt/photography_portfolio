import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SidebarNavItem from "./SidebarNavItem.jsx";

vi.mock("../utils/colorlibPlugins.js", () => ({
  closeColorlibMenu: vi.fn(),
}));

describe("SidebarNavItem", () => {
  it("добавляет colorlib-active для совпавшего маршрута", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/about"]}>
        <ul>
          <SidebarNavItem to="/about">Обо мне</SidebarNavItem>
        </ul>
      </MemoryRouter>
    );

    const li = container.querySelector("li.colorlib-active");
    expect(li).toBeTruthy();
    expect(li.querySelector("a")).toHaveAttribute("href", "/about");
  });

  it("не подсвечивает главную на вложенном пути при end", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/collection"]}>
        <ul>
          <SidebarNavItem to="/" end>
            Главная
          </SidebarNavItem>
        </ul>
      </MemoryRouter>
    );

    expect(container.querySelector("li.colorlib-active")).toBeFalsy();
  });
});
