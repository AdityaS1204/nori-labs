export default function Home() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - var(--nav-h))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <p style={{ color: "var(--muted)", fontSize: "13px", letterSpacing: "0.06em" }}>
        Hero section coming soon.
      </p>
    </section>
  );
}
