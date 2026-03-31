import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

window.scrollTo = vi.fn();
window.matchMedia =
  window.matchMedia ||
  function matchMedia() {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    };
  };
