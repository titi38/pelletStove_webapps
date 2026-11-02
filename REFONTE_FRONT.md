# Refonte du tableau de bord (prototype V1)

- Refonte visuelle de la page Monitor et de la navigation, responsive.
- Angular, routes, commandes et API laissés en place (sauf appel de rafraîchissement immédiat).
- Ajustement de la configuration des styles : `angular.json` référence désormais Bootstrap CSS et le `src/styles.scss` existant (sans importer le SCSS indisponible de Bootstrap 3).

## Points à vérifier avant utilisation réelle

1. Le service `pellets.service.ts` fourni ignore le paramètre `command` dans `sendCommand`. **Aucune correction de l'API n'a été appliquée** : il faut confirmer le vrai chemin et la syntaxe du backend.
2. Les noms des modes `vacation` / `absent` / `basic` sont repris du template existant, à vérifier sur vos réponses JSON.
3. Le modèle du niveau de granulés ne donne pas de capacité maximale : pas de jauge en pourcentage inventée.
4. `Statistics` contient toujours des données de démonstration de 2014.
5. La refonte n'a pas été compilée ni testée contre un poêle.

## Exécution

Avec une installation Node adaptée à Angular 12 : `npm ci` puis `npm start`. Les dépendances d'origine sont anciennes ; envisager une migration Angular séparée.
