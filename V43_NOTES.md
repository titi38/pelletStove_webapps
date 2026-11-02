# PelletControl V4.3

- Navigation : alignement vertical homogène du logo et des onglets.
- Service : URLs relatives `/dynamic/info.json`, `/dynamic/stats.json`, `/dynamic/command.json?...`.
- Développement : `npm start` utilise `proxy.conf.json` vers `http://pellet.local` (port 80, déjà reverse proxy vers Navajo).
- Production : aucun proxy Angular requis : le reverse proxy existant assure `/dynamic`.
- Le format brut de la commande après `?` est préservé.
- Aucun changement des dépendances.
