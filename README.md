# Resa_salles

## Backend des salles

Depuis le dossier `back`, installez les dépendances puis démarrez le serveur :

```sh
npm install
npm start
```

Le site est disponible à l'adresse `http://localhost:3000` et l'API expose
`GET`, `POST`, `PUT` et `DELETE` sur `/api/salles`. Les salles sont stockées
dans `back/data.json`.
Le nom (`name`) sert d'identifiant : pour modifier ou supprimer une salle,
`/api/salles/:id` reçoit son nom actuel, encodé dans l'URL.

Pour exécuter les tests métier et les tests HTTP :

```sh
npm test
```

Les tests HTTP utilisent leur propre fichier temporaire et ne modifient pas
`data.json`. Les tests de réservation restent à écrire.