/**
 * Le mot que le membre doit écrire pour confirmer la suppression.
 *
 * Dans son propre fichier parce qu'un module `"use server"` ne peut exporter
 * que des fonctions asynchrones : une constante exportée depuis actions.ts
 * n'est pas visible côté client.
 */
export const CONFIRMATION = "SUPPRIMER";
