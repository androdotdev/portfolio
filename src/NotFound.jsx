export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "JetBrains Mono, monospace",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 11, color: "#3d5070" }}>// 404</span>
      <span style={{ fontSize: 13, color: "#4da6ff" }}>page not found</span>
      <a href="/" style={{ fontSize: 10, color: "#3d5070", marginTop: 8 }}>
        ← back to console
      </a>
    </div>
  );
}
