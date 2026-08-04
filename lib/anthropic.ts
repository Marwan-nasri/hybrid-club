import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
// Extensions explicites : elles permettent de lancer scripts/test-generation.ts
// avec node, sans passer par le serveur Next.
import { calculerBesoins, type Besoins } from "./nutrition.ts";
import type { ProfilComplet } from "./prompts/profil.ts";
import {
  SYSTEME_PROGRAMME,
  SchemaProgramme,
  promptProgramme,
} from "./prompts/program-generation.ts";
import {
  SYSTEME_NUTRITION,
  SchemaIdeesRepas,
  assemblerNutrition,
  promptNutrition,
} from "./prompts/nutrition-generation.ts";

export const MODELE = "claude-sonnet-5";

// La clé est lue depuis l'environnement par le SDK. `server-only` en tête de
// fichier fait échouer le build si un composant client importe ce module.
const anthropic = new Anthropic();

/**
 * Un appel + validation Zod. Le schéma est passé à l'API (structured outputs)
 * ET revérifié côté serveur : l'API garantit la forme, pas nos règles métier
 * (planning cohérent, nombre de séances…).
 */
async function generer<T extends z.ZodType>(
  schema: T,
  systeme: string,
  prompt: string,
): Promise<z.infer<T>> {
  const message = await anthropic.messages.parse({
    model: MODELE,
    max_tokens: 16000,
    system: systeme,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(schema) },
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error("Réponse tronquée par max_tokens.");
  }
  if (!message.parsed_output) {
    throw new Error("La réponse ne respecte pas le schéma attendu.");
  }
  return message.parsed_output;
}

/** Un seul réessai : au-delà, c'est le prompt qui est en cause, pas la chance. */
async function avecUnReessai<T>(travail: () => Promise<T>): Promise<T> {
  try {
    return await travail();
  } catch {
    return await travail();
  }
}

export type Generation = {
  program_json: z.infer<typeof SchemaProgramme>;
  nutrition_json: ReturnType<typeof assemblerNutrition>;
  besoins: Besoins;
};

/**
 * Seulement les idées de repas, à cadre nutritionnel inchangé. C'est ce que
 * fait le bouton « D'autres idées » : les macros ne bougent pas, elles ne
 * dépendent pas de l'IA.
 */
export async function genererIdeesRepas(
  profil: ProfilComplet,
  besoins: Besoins,
) {
  const idees = await avecUnReessai(() =>
    generer(
      SchemaIdeesRepas,
      SYSTEME_NUTRITION,
      promptNutrition(profil, besoins),
    ),
  );
  return assemblerNutrition(besoins, idees);
}

export async function genererPourProfil(
  profil: ProfilComplet,
): Promise<Generation> {
  // Les macros ne dépendent pas de l'IA : on les calcule avant, et le prompt
  // nutrition les reçoit comme contrainte.
  const besoins = calculerBesoins(profil);

  // Les deux appels sont indépendants — en parallèle, l'attente du membre
  // c'est le plus lent des deux, pas la somme.
  const [programme, nutrition] = await Promise.all([
    avecUnReessai(() =>
      generer(SchemaProgramme, SYSTEME_PROGRAMME, promptProgramme(profil)),
    ),
    genererIdeesRepas(profil, besoins),
  ]);

  return { program_json: programme, nutrition_json: nutrition, besoins };
}
