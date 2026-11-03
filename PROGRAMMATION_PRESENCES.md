# Programmation des présences — V4.4 candidate

Interface Angular 22 : une page **Programmation des présences** avec les 7 jours de la semaine, ajout/modification/suppression des périodes (HH:MM), prévention des chevauchements, copie vers d'autres jours, consignes Normal 20 °C et Éco 19 °C. Les modifications ne sont sauvegardées qu'en cliquant sur **Enregistrer la programmation**.

Sur Accueil, lorsque le mode Auto est actif : option Éco et boutons « Je pars » et « Je rentre ». Disponibilité pilotée par l'état retourné par `info.json` (marche/arrêt). Journal remplace Logs dans la navigation.

## API requise

- `GET /dynamic/schedule.json` retourne `{ "days": [[{"start":"05:00","end":"08:00"}], ... 7 jours], "comfort":20, "ecoComfort":19, "eco":false, "override":"none", "presence":true }`.
- `GET /dynamic/schedule.json?action=save&config=<JSON encodé>` enregistre le calendrier et les consignes. Réponse `{ "success": true }` ou `{ "success": false, "error": "..." }`.
- `GET /dynamic/schedule.json?action=eco&enabled=1|0` active/désactive l'option Éco.
- `GET /dynamic/schedule.json?action=override&value=arrive|leave|clear` gère les dérogations.

Le backend candidate correspondant est dans `backend_programmation_candidate.patch` fourni séparément. Ne pas activer le frontal avant son déploiement : les requêtes d'édition échoueraient.

## Précautions importantes

- Le backend conserve le couvre-feu historique 22h-05h et les protections grand froid; l'anticipation ne les contourne pas.
- Les temporisations existantes de 90 minutes et pauses de 20 ou 60 minutes peuvent retarder une dérogation : ce n'est pas une commande immédiate On/Off.
- Les jours utilisent l'heure locale Raspberry; une plage franchissant minuit se crée en deux périodes sur deux jours.
- Configuration conservée dans `presence-schedule.json` du répertoire de travail du service, ou dans `PELLET_SCHEDULE_FILE` si défini.
- Les commandes de modification utilisent GET pour compatibilité avec l'API Navajo existante; elles doivent être protégées (auth, absence de mise en cache et contrôle d'accès). **Ne pas publier ce candidat sans revue de sécurité et tests sur le Raspberry.**
- Le patch backend est basé sur les derniers `AutoMode.cc/.hh` transmis, mais sur des `PelletService.cc/.hh` plus anciens. Vérifier avec `git apply --check` ; ne jamais forcer si cela échoue.
- Ce candidat n'a pas été compilé ni testé sur le poêle réel.
