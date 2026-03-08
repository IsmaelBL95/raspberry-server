import { Outlet } from "react-router-dom";
import TerminalScreen from "../../components/TerminalScreen.jsx";
import HeaderStatus from "../../components/root/HeaderStatus.jsx";
import Sidebar from "../../components/root/Sidebar.jsx";
import { useRootSession } from "../../hooks/useRootSession.js";
import { useReadyStatus } from "../../hooks/useReadyStatus.js";

/**
 * Layout component for the root dashboard.  It handles session
 * validation and backend readiness polling.  When the session is
 * verified it renders a header, sidebar and outlet for nested
 * routes.  During session checking it displays a terminal style
 * loading screen.
 */
export default function RootLayout() {
  // Check the session and navigate if invalid.
  const { checking } = useRootSession();
  // Begin readiness polling once the session check completes.
  const { mongoStatus } = useReadyStatus(!checking);

  // Display a terminal style screen while verifying session.
  if (checking) {
    return <TerminalScreen message="[SYSTEM]: VERIFYING_ROOT_PRIVILEGES..." />;
  }

  // Layout once the session is validated.
  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#00FF00",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Courier New', Consolas, monospace",
      }}
    >
      <HeaderStatus mongoStatus={mongoStatus} />
      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}