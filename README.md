<h1 align="center">
  Backmapper
  <br>
</h1>

Backmapper est une application hybride melant cartographie et blog de voyage. Elle permet de situer les étapes d'un voyage sur la carte du monde et d'y associer ses souvenirs et photos.

Ce repo concerne la partie Frontend de l'application.
Ce projet a été réalisé avec Angular.
Il s'appuie sur la librairie OpenLayers pour gérer la cartographie.

## Comment l'utiliser

Pour cloner et lancer cette application vous aurez besoin de [Git](https://git-scm.com) et [Node.js](https://nodejs.org/en/download/)

Avant toutes choses, installer le backend de Backmapper (https://github.com/Jean-Paul-Groove/backmapper-back).
Puis depuis votre ligne de commande :

```bash
# Clonez ce repository
$ git clone https://github.com/Jean-Paul-Groove/backmapper-front

# Rendez vous dans le nouveau dossier
$ cd backmapper-front

# Installez les dépendances
$ npm install
```

Il vous faudra ensuite vous rendre dans le dossier src/environments et modifier l'URL du backend dans le fichier environment.development.ts

Enfin vous pouvez lancer l'application depuis votre CLI:

```bash
$ npm start
```

## Credits

Backmapper utilise notamment les dépendances suivantes:

- [Angular](https://angular.io/)
  - rxjs
    -zone.js
- [OpenLayers](https://openlayers.org/)
