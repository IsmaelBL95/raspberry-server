/**
 * Header component for the root dashboard.  It displays a system
 * identifier and the status of the MongoDB backend.  Status color
 * and text are derived from the `mongoStatus` prop.
 *
 * @param {Object} props Component props
 * @param {string} props.mongoStatus The status of MongoDB (`"up"`,
 *   `"down"` or `"unknown"`)
 */
export default function HeaderStatus({ mongoStatus }) {
  const terminalFont = "'Courier New', Consolas, monospace";
  const greenPhosphor = "#00FF00";
  const mongoIsUp = mongoStatus === "up";
  const statusColor = mongoIsUp ? greenPhosphor : "red";
  const statusText = (() => {
    if (mongoStatus === "up") return "ACTIVE";
    if (mongoStatus === "down") return "DB_DOWN";
    return "DB_UNKNOWN";
  })();

  return (
    <header
      style={{
        padding: "10px 16px",
        borderBottom: `1px solid ${greenPhosphor}`,
        fontSize: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        fontFamily: terminalFont,
        textTransform: "uppercase",
        color: greenPhosphor,
        backgroundColor: "#000",
      }}
    >
      <span>SYSTEM_CONTROL_UNIT // ROOT_ACCESS</span>
      <span style={{ color: statusColor }}>STATUS: {statusText}</span>
    </header>
  );
}