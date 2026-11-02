# Statistiques — V2

- Le front charge `/dynamic/stats.json` toutes les 60 secondes, URL relative à l'origine du site.
- 3 courbes Google Charts : température, humidité et moyenne de mode, à pas de 15 minutes.
- Le JSON représente les quarts d’heure *terminés*; hour/quarter désignent le quart courant.
- Valeurs (0,0) affichées comme une interruption de mesure sur température/humidité. Attention, une valeur nulle réelle serait également masquée.
- Le serveur conserve seulement 96 quarts en RAM, aucune persistance.
- La reconstruction des dates est approximative aux changements d'heure, car l'API n'expose pas de timestamps.
- Le mode est une moyenne arithmétique des codes numériques, pas une durée par état; il faut la sémantique de runMode pour une légende.

## Correctif backend recommandé

Dans Stats::getStatsJson(), remplacer la boucle basée sur un modulo potentiellement négatif par:

```cpp
for (int n = nbStats; n > 0; --n) {
    int idx = (idxStats - n + 24 * 4) % (24 * 4);
    writer.StartArray();
    writer.Double(dailyStats[idx][0]);
    writer.Double(dailyStats[idx][1]);
    writer.Double(dailyStats[idx][2]);
    writer.EndArray();
}
```

Le code actuel utilise `(idxStats - nbStats) % 96` (indice négatif possible) et n'effectue pas de modulo lors de l'incrément dans la boucle.

Autre bug: le premier appel à `updateIfEndQuarter()` initialise `currentTimeStat` sans terminer de période, ce qui est correct; mais `dailyStats` n'est pas initialisé dans le constructeur. Pour éviter des valeurs indéfinies dans tous les cas, initialiser le tampon.

## Déploiement

Le front attend que `/dynamic/stats.json` soit disponible sur le même domaine que l'application. Si l'application utilise un chemin de proxy différent, adapter `refreshStats()` dans `src/app/services/pellets.service.ts`.
