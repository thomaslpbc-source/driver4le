# Driver4le

Base desktop HTML/CSS/JS pour le jeu Driver4le.

## Structure

- `index.html` : page principale
- `src/css/styles.css` : styles desktop + base responsive 
- `src/js/app.js` : bootstrap du jeu
- `src/js/modules/` : logique découpée par responsabilité
- `src/data/drivers.json` : données pilotes avec chemins d'images
- `src/assets/images/` : assets triés par type

## Comportement implémenté

- Rotation globale du pilote toutes les jours à 12h 
- Même pilote pour tous les utilisateurs grâce à une clé de rotation partagée
- 6 essais max
- Révélation progressive de 6 indices : silhouette, casque, radio, écuries, stats, nationalité
- Recherche triée avec priorité aux noms commençant par la chaîne saisie, puis aux correspondances partielles
- Menu de recherche limité à 7 résultats
- Sauvegarde locale de la partie pour la rotation en cours

## SEO et publication ajoutés

- `CNAME` pour `driver4le.com`
- `robots.txt`
- `sitemap.xml`
- métadonnées SEO principales sur `index.html`
- balises canoniques
- données structurées Schema.org
- `404.html`
- bloc de texte éditorial indexable pour mieux contextualiser le site
