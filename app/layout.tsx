import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist } from "next/font/google";
import "./globals.css";

// Condensée et large pour les titres et les chiffres : c'est ce qui donne le
// caractère « salle de sport » sans avoir à charger d'images.
const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Geist pour le texte courant : lisible en petit corps, ce que Barlow
// Condensed ne fait pas bien.
const texte = Geist({
  variable: "--font-sans-geist",
  subsets: ["latin"],
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
  themeColor: "#0a0a0a",
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
      className={`${display.variable} ${texte.variable} h-full`}
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
