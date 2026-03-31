import { NavLink, useMatch, useResolvedPath } from "react-router-dom";
import { closeColorlibMenu } from "../utils/colorlibPlugins.js";

/** Элемент боковой навигации с подсветкой активного маршрута. */
export default function SidebarNavItem({ to, end = false, children }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });

  return (
    <li className={match ? "colorlib-active" : undefined}>
      <NavLink
        to={to}
        end={end}
        onClick={() => closeColorlibMenu()}
        className={({ isActive }) =>
          isActive ? "portfolio-sidebar-link portfolio-sidebar-link--active" : "portfolio-sidebar-link"
        }
      >
        {children}
      </NavLink>
    </li>
  );
}
