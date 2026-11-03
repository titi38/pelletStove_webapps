# pelletStove_webapps
PelletControl — Angular 22 migration (V4 candidate)
Base : front tactile V3.4, affichage 1024x600, écran manuel, statistiques combinées.

Prérequis
Node.js >= 24.15.0 (recommandé Node 24 LTS), npm.

nvm install 24
nvm use 24
npm install
npm start
Puis http://localhost:4200 . Compilation production : npm run build. Le site compilé se trouve dans dist/pellet/browser/.

Changements
Angular 22.2 / TypeScript 6 / RxJS 7.8 / Sass.
Dépendances obsolètes retirées : node-sass, Bootstrap 3, ng-bootstrap, Protractor, TSLint.
Google Charts conservé par un composant adaptateur local, sans wrapper Angular 12.
API Navajo inchangée : http://pellet.local:8080.
Les anciennes routes Configuration redirigent toujours vers Accueil.
