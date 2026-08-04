import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hybrid Club — ton programme muscu + cardio";

/**
 * Vignette de partage, générée à la volée comme les icônes : aucun binaire à
 * versionner, et les couleurs suivent la palette. Le lien circulera sur
 * Snapchat et Instagram, où une vignette générique coûte cher.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B0D11",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: "#9BA1AE",
            textTransform: "uppercase",
          }}
        >
          Hybrid Club
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            fontWeight: 900,
            color: "#F2F1EC",
            lineHeight: 1.05,
          }}
        >
          <div>Ton programme,</div>
          <div>pas celui d&apos;un autre</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 30, color: "#9BA1AE" }}>
            Muscu + cardio et cadre nutritionnel, construits sur ton profil.
          </div>
          {/* Le dégradé signature, en barre pleine largeur. */}
          <div
            style={{
              height: 12,
              borderRadius: 6,
              background: "linear-gradient(90deg, #FF4B2B, #5B7CFF)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
