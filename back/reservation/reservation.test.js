const { getReservations, addReservation, editReservation, deleteReservation} = require("./reservation");
const fs = require("fs");
const path = require("path");
const dataLink = path.resolve(__dirname, "..", "data_test.json");

beforeEach(() => {
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [], reservations: [] }, null, 2));
});

test('reservation_pasDeSalle_returnError', () => {
    // Arrange
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: 20 };
    const expected = "Salle inexistante";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_pasDeDateDeDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: 20 };
    const expected = "Pas de Date de début";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_pasDeDateDeFin_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "", heureDebut: "09:00", heureFin: "10:00", capacite: 20 };
    const expected = "Pas de Date de fin";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_pasDeHeureDeDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "", heureFin: "10:00", capacite: 20 };
    const expected = "Pas d'heure de début";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_pasDeHeureDeFin_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "", capacite: 20 };
    const expected = "Pas d'heure de fin";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_pasDeCapacite_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "" };
    const expected = "Pas de capacité";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_CapaciteInvalide_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "70" };
    const expected = "Capacité de réservation supérieure à la capacité de la salle";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_valide_returnObject', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = reservation;
    const expectedMessage = "Réservation ajoutée avec succès";

    // Act
    const result = addReservation(reservation, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    // Assert
    expect(data.reservations).toContainEqual(expected);
    expect(result).toBe(expectedMessage);
});

test('reservation_HoraireInvalide_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "11:00", heureFin: "10:00", capacite: "30" };
    const expected = "Heure de fin inférieure à l'heure de début";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_DateInvalide_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-11", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Date de fin inférieure à la date de début";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('reservation_PeriodeDejaUtilisee_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:30", heureFin: "10:30", capacite: "30" };
    const expected = "Salle déjà réservée pour cette période";

    // Assert
    expect(() => addReservation(reservation, dataLink)).toThrow(expected);
});

test('getReservations_returnArray', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const expected = [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }];

    // Act
    const result = getReservations(dataLink);

    // Assert
    expect(result).toEqual(expected);
});

test('deleteReservation_PasDeSalle_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "", dateDebut: "2023-10-10", heureDebut: "09:30"};
    const expected = "Il faut spécifier la salle pour supprimer une réservation";

    // Assert
    expect(() => deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink)).toThrow(expected);
});

test('deleteReservation_PasDeDateDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "", heureDebut: "09:30"};
    const expected = "Il faut spécifier la date de début pour supprimer une réservation";

    // Assert
    expect(() => deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink)).toThrow(expected);
});

test('deleteReservation_PasDeHeureDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: ""};
    const expected = "Il faut spécifier l'heure de début pour supprimer une réservation";

    // Assert
    expect(() => deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink)).toThrow(expected);
});

test('deleteReservation_ReservationInexistante_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "Salle 2", dateDebut: "2023-10-10", heureDebut: "09:30"};
    const expected = "Réservation inexistante";

    // Assert
    expect(() => deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink)).toThrow(expected);
});

test('deleteReservation_AucuneReservation_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:30"};
    const expected = "Aucune réservation existante";

    // Assert
    expect(() => deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink)).toThrow(expected);
});

test('deleteReservation_Suppression_returnMessage', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const expected = "Réservation supprimée avec succès";

    // Act
    const result = deleteReservation(reservation.salle, reservation.dateDebut, reservation.heureDebut, dataLink);

    // Assert
    expect(result).toBe(expected);
});

test('editReservation_PasDeSalle_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Il faut spécifier la salle pour modifier une réservation";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_PasDeDateDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Il faut spécifier la date de début pour modifier une réservation";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_PasDeHeureDebut_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: ""};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Il faut spécifier l'heure de début pour modifier une réservation";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_nouvelleSalleInexistante_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 2", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Salle inexistante";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_heureDebutSuperieureAHeureFin_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "10:00", heureFin: "09:00", capacite: "30" };
    const expected = "Heure de fin inférieure à l'heure de début";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_dateDebutSuperieureADateFin_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-09", heureDebut: "09:00", heureFin: "10:00", capacite: "30" };
    const expected = "Date de fin inférieure à la date de début";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_capaciteSuperieureACapaciteSalle_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "55" };
    const expected = "Capacité de réservation supérieure à la capacité de la salle";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_PeriodeDejaUtilisee_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }, { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "10:00", heureFin: "11:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:30", heureFin: "10:30", capacite: "30" };
    const expected = "Salle déjà réservée pour cette période";

    // Assert
    expect(() => editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink)).toThrow(expected);
});

test('editReservation_ReservationInexistante_createNewReservation', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "11:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "11:00", heureFin: "12:00", capacite: "30" };
    const expected = "Nouvelle réservation créée avec succès";

    // Act
    const result = editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    // Assert
    // expect(data.reservations).toContainEqual(reservation);
    expect(result).toBe(expected);
});

test('editReservation_AucuneReservation_returnError', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "11:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "11:00", heureFin: "12:00", capacite: "30" };
    const expected = "Nouvelle réservation créée avec succès";

    // Act
    const result = editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    // Assert
    expect(data.reservations).toContainEqual(reservation);
    expect(result).toBe(expected);
});

test('editReservation_modificationValid_returnMessage', () => {
    // Arrange
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [{ name: "Salle 1", capacity: 50 }], reservations: [{ salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "10:00", capacite: "30" }] }, null, 2));
    const ancienneReservation = { salle: "Salle 1", dateDebut: "2023-10-10", heureDebut: "09:00"};
    const reservation = { salle: "Salle 1", dateDebut: "2023-10-10", dateFin: "2023-10-10", heureDebut: "09:00", heureFin: "11:00", capacite: "30" };
    const expected = "Réservation modifiée avec succès";

    // Act
    const result = editReservation(ancienneReservation.salle, ancienneReservation.dateDebut, ancienneReservation.heureDebut, reservation, dataLink);

    // Assert
    expect(result).toBe(expected);
});