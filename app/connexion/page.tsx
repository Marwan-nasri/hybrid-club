import Formulaire from "./formulaire";

export const metadata = { title: "Connexion" };

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ inscription?: string }>;
}) {
  const { inscription } = await searchParams;

  return <Formulaire modeInitial={inscription ? "inscription" : "connexion"} />;
}
