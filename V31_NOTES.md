# V3.1 — écran tactile et statistiques

- Optimisation CSS pour les écrans d’au moins 850 px de large et au plus 700 px de haut.
- Accueil : réduction des marges ; commandes tactiles d’au moins 44 px de haut.
- Statistiques : un graphique à la fois, choix par onglets ; toutes les valeurs reçues (jusqu’à 96 quarts d’heure) restent présentes.
- API : le fichier `pellets.service.ts` est conservé tel quel dans la V3. Si tu l’as modifié localement pour `pellet.local:8080`, conserve ta version du service.
- Le tampon circulaire du backend `Stats.cc` présente un défaut à corriger séparément (index négatif / absence de modulo lors de la sérialisation).
- Le rendu réel et la compilation restent à valider sur le panneau 1024 × 600.
