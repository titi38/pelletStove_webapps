# V4.1 — correctif Angular 22 (zoneless)

- Ajoute `ChangeDetectorRef.markForCheck()` dans les callbacks HTTP des composants Manuel et Statistiques, et dans le timer de l’horloge.
- Supprime `downlevelIteration` du `tsconfig.json`.
- Conserve les URL du service `http://pellet.local:8080` et toutes les commandes.
- N’impose aucun changement de dépendance.

Lancer `npm start` depuis le projet existant après copie des fichiers.

Non compilé/testé avec l’installation locale de l’utilisateur ; valider la réception du LCD, le graphique et les interactions avant mise en production.
