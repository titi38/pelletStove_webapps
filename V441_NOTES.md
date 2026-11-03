# PelletControl V4.4.1 — Frontend

- Journal : contraste corrigé sur fond clair (titres, lignes, dates, messages, formulaires, niveaux).
- Navigation : onglets « Programmation » et « Journal », routes `/planning` et `/logs`.
- Planification : périodes de présence par jour, copie, ajout, modification et suppression ; 20°C Normal, 19°C Eco par défaut.
- Préserve les endpoints API `/dynamic` existants.

**Attention** : la page Programmation nécessite le backend C++ qui expose l'endpoint `schedule.json` ; sans lui la page indique une erreur de chargement et ne peut pas sauvegarder.

Ne pas déployer un backend de contrôle du chauffage sans validation de sa compilation et de son fonctionnement sur installation de test.
