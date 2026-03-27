"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #EFEFEF", padding: 32, maxWidth: 360, textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#1A1A1A" }}>Errore critico</p>
            <p style={{ fontSize: 12, color: "#999", marginTop: 4, marginBottom: 16 }}>{error.message}</p>
            <button
              onClick={reset}
              style={{ padding: "8px 20px", background: "#111", color: "white", fontSize: 14, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer" }}
            >
              Riprova
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
