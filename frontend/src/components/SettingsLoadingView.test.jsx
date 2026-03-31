import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsLoadingView from "./SettingsLoadingView.jsx";

describe("SettingsLoadingView", () => {
  it("показывает статус загрузки для вспомогательных технологий", () => {
    render(<SettingsLoadingView />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/загрузка настроек сайта/i)).toBeInTheDocument();
  });
});
