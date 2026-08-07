import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hybrid Club",
    short_name: "Hybrid",
    description:
      "Ton programme d'entraînement hybride et ton cadre nutritionnel, construits sur ton profil.",
    lang: "fr",
    // Installée, l'app s'ouvre sur la séance du jour et non sur la landing :
    // c'est ce que le membre vient chercher.
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d11",
    theme_color: "#0b0d11",
    categories: ["health", "fitness"],
    // Le logo est un fichier et non plus une image générée : Next le sert à
    // /icon.png. Opaque et non transparent, pour deux raisons — Android
    // rognerait un fond transparent en laissant apparaître le thème du
    // téléphone, et iOS remplace la transparence par du noir.
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
