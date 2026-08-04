import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Marque provisoire : le dégradé signature et l'initiale. Générée à la volée,
 * donc aucun binaire à versionner et la couleur suit la palette.
 * À remplacer par le vrai logo quand il existera.
 */
export default function Icon() {
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
            fontSize: 300,
            fontWeight: 900,
            color: "#F2F1EC",
            letterSpacing: "-0.05em",
            // Marge optique : un H paraît haut s'il est centré au pixel près.
            marginTop: -20,
          }}
        >
          H
        </div>
      </div>
    ),
    size,
  );
}
