"use client";

/**
 * AmbientBackground
 * 4 blurred animated color blobs that drift slowly behind the entire app.
 * Signature visual effect for Dealock — Aurora glassmorphism.
 * Sits in position: fixed at z-index -1, never interferes with interaction.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "var(--bg)" }}
    >
      {/* Blob 1 — top-left, violet (iris) */}
      <div
        className="absolute rounded-full"
        style={{
          width: "520px",
          height: "520px",
          top: "-120px",
          left: "-100px",
          background: "#6D4DFF",
          opacity: 0.35,
          filter: "blur(120px)",
          animation: "drift-1 16s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — bottom-right, cyan */}
      <div
        className="absolute rounded-full"
        style={{
          width: "480px",
          height: "480px",
          bottom: "-80px",
          right: "-60px",
          background: "#00D4FF",
          opacity: 0.25,
          filter: "blur(120px)",
          animation: "drift-2 14s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      />

      {/* Blob 3 — middle-right, magenta/rose */}
      <div
        className="absolute rounded-full"
        style={{
          width: "380px",
          height: "380px",
          top: "40%",
          right: "20%",
          background: "#FF3D8B",
          opacity: 0.22,
          filter: "blur(120px)",
          animation: "drift-3 18s ease-in-out infinite",
          animationDelay: "-6s",
        }}
      />

      {/* Blob 4 — top-right, mint */}
      <div
        className="absolute rounded-full"
        style={{
          width: "340px",
          height: "340px",
          top: "10%",
          right: "-40px",
          background: "#00FFAA",
          opacity: 0.18,
          filter: "blur(120px)",
          animation: "drift-4 13s ease-in-out infinite",
          animationDelay: "-9s",
        }}
      />
    </div>
  );
}
