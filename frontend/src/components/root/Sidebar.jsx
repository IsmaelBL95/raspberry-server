import { NavLink } from "react-router-dom";

/**
 * Sidebar navigation for the root dashboard.  It displays links
 * corresponding to nested routes.  Active links are styled with
 * borders and background colors.
 */
export default function Sidebar() {
  const greenPhosphor = "#00FF00";
  const terminalFont = "'Courier New', Consolas, monospace";

  const navLinkStyle = ({ isActive }) => ({
    color: greenPhosphor,
    textDecoration: "none",
    padding: "4px 8px",
    border: isActive ? `1px solid ${greenPhosphor}` : "1px solid transparent",
    backgroundColor: isActive ? "rgba(0, 255, 0, 0.1)" : "transparent",
    fontFamily: terminalFont,
    textTransform: "uppercase",
  });

  return (
    <aside
      style={{
        width: 200,
        borderRight: `1px solid ${greenPhosphor}`,
        padding: "20px 12px",
        backgroundColor: "#000",
        color: greenPhosphor,
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <NavLink to="" end style={navLinkStyle}>
          {">"} INICIO
        </NavLink>
        <NavLink to="users" style={navLinkStyle}>
          {">"} USUARIOS
        </NavLink>
      </nav>
    </aside>
  );
}