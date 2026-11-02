# V3.2 — écran 1024×600

- Accueil et Manuel agrandis dans le profil de hauteur <= 700 px.
- Graphique Température + Hygrométrie à deux axes et courbes indépendantes.
- Activité du poêle sur un second onglet ; la valeur run est une moyenne de codes numériques.
- Navigation Configuration retirée et ancienne URL /config redirigée vers /monitor.
- API directe configurée sur http://pellet.local:8080 (uniquement pour le réseau local HTTP).

Pour production HTTPS publique, un reverse proxy HTTPS est nécessaire : pellet.local n’est pas résolu depuis Internet.
Les commandes physiques ne sont pas testées sur le poêle réel.
