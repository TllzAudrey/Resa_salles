const { addSalle, editSalle, deleteSalle, getSalles } = require("./salle");
const fs = require("fs");
const path = require("path");
const dataLink = path.resolve(__dirname, "..", "data_test.json");

beforeEach(() => {
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [], reservations: [] }, null, 2));
});

test("getSalles retourne les salles sans propriété id", () => {
    fs.writeFileSync(dataLink, JSON.stringify({
        salles: [{ name: "Salle 1", capacity: 50, id: "1" }],
        reservations: []
    }, null, 2));

    expect(getSalles(dataLink)).toEqual([{ name: "Salle 1", capacity: 50 }]);
});

test("addSalle ajoute une salle et retourne l'objet ajouté", () => {
    const salle = { name: "Salle 3", capacity: 50 };

    const result = addSalle(salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    expect(result).toEqual(salle);
    expect(data.salles).toContainEqual(salle);
});

test("addSalle rejette un nom déjà utilisé", () => {
    const salle = { name: "Salle 1", capacity: 50 };
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [salle], reservations: [] }, null, 2));

    expect(() => addSalle(salle, dataLink)).toThrow("Salle déjà existante");
});

test("editSalle modifie une salle existante", () => {
    const ancienneSalle = { name: "Salle 1", capacity: 50 };
    const nouvelleSalle = { name: "Salle rénovée", capacity: 100 };
    fs.writeFileSync(dataLink, JSON.stringify({
        salles: [ancienneSalle],
        reservations: []
    }, null, 2));

    const result = editSalle(ancienneSalle.name, nouvelleSalle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    expect(result).toEqual(nouvelleSalle);
    expect(data.salles).toEqual([nouvelleSalle]);
});

test("editSalle_reservationExistante_modificationEnCascade", () => {
    const dataReservations = [
        {
            salle: "Salle 1",  
            dateDebut: "2023-10-10",
            dateFin: "2023-10-10",
            heureDebut: "09:00",
            heureFin: "10:00",
            capacite: "30"
        }
    ];
    const ancienneSalle = { name: "Salle 1", capacity: 50 };
    const nouvelleSalle = { name: "Salle rénovée", capacity: 100 };
    fs.writeFileSync(dataLink, JSON.stringify({
        salles: [ancienneSalle],
        reservations: dataReservations
    }, null, 2));

    const result = editSalle(ancienneSalle.name, nouvelleSalle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    expect(result).toEqual(nouvelleSalle);
    expect(data.salles).toEqual([nouvelleSalle]);
    expect(data.reservations[0].salle).toBe(nouvelleSalle.name);
});

test("editSalle_reservationExistante_refuseModification", () => {
    const dataReservations = [
        {
            salle: "Salle 1",  
            dateDebut: "2023-10-10",
            dateFin: "2023-10-10",
            heureDebut: "09:00",
            heureFin: "10:00",
            capacite: "30"
        }
    ];
    const ancienneSalle = { name: "Salle 1", capacity: 50 };
    const nouvelleSalle = { name: "Salle 1", capacity: 20 };
    const expected = "Impossible de modifier la salle car des réservations existent pour cette salle avec une capacité supérieure.";
    fs.writeFileSync(dataLink, JSON.stringify({
        salles: [ancienneSalle],
        reservations: dataReservations
    }, null, 2));

    expect(() => editSalle(ancienneSalle.name, nouvelleSalle, dataLink)).toThrow(expected);
});

test("editSalle retourne null si la salle n'existe pas", () => {
    const salle = { name: "Salle absente", capacity: 50 };

    expect(editSalle(salle.name, salle, dataLink)).toBeNull();
});

test("editSalle rejette un nouveau nom déjà utilisé", () => {
    fs.writeFileSync(dataLink, JSON.stringify({
        salles: [
            { name: "Salle 1", capacity: 50 },
            { name: "Salle 2", capacity: 30 }
        ],
        reservations: []
    }, null, 2));

    expect(() => editSalle("Salle 1", { name: "Salle 2", capacity: 60 }, dataLink))
        .toThrow("Salle déjà existante");
});

test("deleteSalle supprime une salle existante", () => {
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [
        {
            "name": "Salle 5",
            "capacity": 50
        },
        {
            "name": "Salle 4",
            "capacity": 50
        }
    ], reservations: [] }, null, 2));

    const salle = "Salle 5";
    const result = deleteSalle(salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    expect(result).toBe(true);
    expect(data.salles.some(existingSalle => existingSalle.name === salle)).toBe(false);
});

test("deleteSalle retourne false si la salle n'existe pas", () => {
    expect(deleteSalle("Salle 6", dataLink)).toBe(false);
});
