/**
 * A simple full‑screen terminal‑style display.  It renders the
 * provided message with a green phosphor font on a black
 * background.  This component is useful for transient screens such
 * as session checks or authentication feedback.
 *
 * @param {Object} props Component props
 * @param {string} props.message The message to display
 */
export default function TerminalScreen({ message }) {
  const terminalFont = "'Courier New', Consolas, monospace";
  const greenPhosphor = "#00FF00";

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: greenPhosphor,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: terminalFont,
        textTransform: "uppercase",
      }}
    >
      {message}
    </div>
  );
}