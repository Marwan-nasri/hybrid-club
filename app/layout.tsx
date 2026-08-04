import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

// Les trois polices de CLAUDE.md. Anton n'existe qu'en 400 : c'est une
// display, elle porte les titres et rien d'autre.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

// Space Mono pour les labels techniques et tous les chiffres.
const spaceMono = Space_Mono({
  variable: "--font-mono-space",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Hybrid Club",
    template: "%s · Hybrid Club",
  },
  description:
    "Ton programme d'entraînement hybride et ton cadre nutritionnel, construits sur ton profil.",
  applicationName: "Hybrid Club",
};

export const viewport: Viewport = {
  // La barre d'état du téléphone prend la couleur de l'app.
  themeColor: "#0b0d11",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${anton.variable} ${grotesk.variable} ${spaceMono.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col">
        {/* Grain fixe très léger : casse la platitude du aplat noir sans
            jamais intercepter un clic. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23b)'/%3E%3C/svg%3E\")",
          }}
        />
        {children}
      </body>
    </html>
  );
}
