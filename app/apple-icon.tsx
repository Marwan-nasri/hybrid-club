import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS applique lui-même les coins arrondis et n'accepte pas la transparence :
 * l'icône doit remplir tout le carré, d'où un fichier distinct de /icon.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF4B2B 0%, #5B7CFF 100%)",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: "#F2F1EC",
            letterSpacing: "-0.05em",
            marginTop: -8,
          }}
        >
          H
        </div>
      </div>
    ),
    size,
  );
}
