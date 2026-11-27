# Resa_salles

Seuls les tests métiers ont été réalisé en TDD à la main, les tests du serveurs ont été réalisé par IA

## Backend des salles

Depuis le dossier `back`, installez les dépendances puis démarrez le serveur :

```sh
npm install
npm start
```

Le site est disponible à l'adresse `http://localhost:3000` et l'API expose
`GET`, `POST`, `PUT` et `DELETE` sur `/api/salles`, ainsi que les opérations de
gestion des réservations sur `/api/reservations`. Les salles et réservations
sont stockées dans `back/data.json`.
Le nom (`name`) sert d'identifiant : pour modifier ou supprimer une salle,
`/api/salles/:id` reçoit son nom actuel, encodé dans l'URL.
La liste des réservations peut être filtrée par jour (`?jour=YYYY-MM-DD`) ou
par salle (`?salle=Nom%20de%20la%20salle`); les deux filtres peuvent être
combinés. Le filtre par jour inclut les réservations qui couvrent cette date.

Pour exécuter les tests métier et les tests HTTP :

```sh
npm test
```

Les tests HTTP utilisent leur propre fichier temporaire et ne modifient pas
`data.json`. Les tests de réservation restent à écrire.