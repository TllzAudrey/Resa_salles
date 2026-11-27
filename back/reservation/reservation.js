const fs = require("fs");
const path = require("path");

const defaultDataPath = path.resolve(__dirname, "..", "data.json");

function readData(dataPath = defaultDataPath) {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function writeData(data, dataPath = defaultDataPath) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function withoutGeneratedId(salle) {
    const result = { ...salle };
    delete result.id;
    return result;
}

function getReservations(dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const reservations = Array.isArray(data.reservations) ? data.reservations : [];
    return reservations;
}

function addReservation(reservation, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataSalles = Array.isArray(data.salles) ? data.salles : [];
    const dataReservations = Array.isArray(data.reservations) ? data.reservations : [];
    if (!dataSalles.some(existingSalle => existingSalle.name === reservation.salle)) {
        throw new Error("Salle inexistante");
    }

    if (!reservation.dateDebut) {
        throw new Error("Pas de Date de début");
    }

    if (!reservation.dateFin) {
        throw new Error("Pas de Date de fin");
    }

    if (!reservation.heureDebut) {
        throw new Error("Pas d'heure de début");
    }

    if (!reservation.heureFin) {
        throw new Error("Pas d'heure de fin");
    }
    
    if (reservation.heureFin < reservation.heureDebut) {
        throw new Error("Heure de fin inférieure à l'heure de début");
    }

    if (reservation.dateFin < reservation.dateDebut) {
        throw new Error("Date de fin inférieure à la date de début");
    }

    if (dataReservations.some(
        existingReservation => (existingReservation.salle === reservation.salle) && 
        ((`${existingReservation.dateDebut}T${existingReservation.heureDebut}` <= `${reservation.dateDebut}T${reservation.heureDebut}` && `${existingReservation.dateFin}T${existingReservation.heureFin}` > `${reservation.dateDebut}T${reservation.heureDebut}`) ||
        (`${existingReservation.dateDebut}T${existingReservation.heureDebut}` < `${reservation.dateFin}T${reservation.heureFin}` && `${existingReservation.dateFin}T${existingReservation.heureFin}` >= `${reservation.dateFin}T${reservation.heureFin}`)))) {
        throw new Error("Salle déjà réservée pour cette période");
    }

    if (!reservation.capacite) {
        throw new Error("Pas de capacité");
    } else if (reservation.capacite > dataSalles.find(salle => salle.name === reservation.salle).capacity) {
        throw new Error("Capacité de réservation supérieure à la capacité de la salle");
    }

    const newReservation = withoutGeneratedId(reservation);
    dataReservations.push(newReservation);
    data.reservations = dataReservations;
    writeData(data, dataPath);
    return "Réservation ajoutée avec succès";
}

function deleteReservation(salleReservee, dateDebut, HeureDebut, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataReservations = Array.isArray(data.reservations) ? data.reservations : [];
    
    if (!salleReservee) {
        throw new Error("Il faut spécifier la salle pour supprimer une réservation");
    }

    if (!dateDebut) {
        throw new Error("Il faut spécifier la date de début pour supprimer une réservation");
    }

    if (!HeureDebut) {
        throw new Error("Il faut spécifier l'heure de début pour supprimer une réservation");
    }

    if (dataReservations.length <= 0) {
        throw new Error("Aucune réservation existante");
    }

    if (!dataReservations.some(existingReservation => existingReservation.salle === salleReservee && existingReservation.dateDebut === dateDebut && existingReservation.heureDebut === HeureDebut)) {
        throw new Error("Réservation inexistante");
    }

    const index = dataReservations.findIndex(existingReservation => existingReservation.salle === salleReservee && existingReservation.dateDebut === dateDebut && existingReservation.heureDebut === HeureDebut);

    dataReservations.splice(index, 1);
    writeData(data, dataPath);
    return "Réservation supprimée avec succès";
}

function editReservation(salleReservee, dateDebut, HeureDebut, updatedReservation, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataSalles = Array.isArray(data.salles) ? data.salles : [];
    const dataReservations = Array.isArray(data.reservations) ? data.reservations : [];

    if (!salleReservee) {
        throw new Error("Il faut spécifier la salle pour modifier une réservation");
    }

    if (!dateDebut) {
        throw new Error("Il faut spécifier la date de début pour modifier une réservation");
    }

    if (!HeureDebut) {
        throw new Error("Il faut spécifier l'heure de début pour modifier une réservation");
    }

    if (!dataSalles.some(existingSalle => existingSalle.name === updatedReservation.salle)) {
        throw new Error("Salle inexistante");
    }

    if (updatedReservation.heureFin < updatedReservation.heureDebut) {
        throw new Error("Heure de fin inférieure à l'heure de début");
    }

    if (updatedReservation.dateFin < updatedReservation.dateDebut) {
        throw new Error("Date de fin inférieure à la date de début");
    }

    if (updatedReservation.capacite > dataSalles.find(salle => salle.name === updatedReservation.salle).capacity) {
        throw new Error("Capacité de réservation supérieure à la capacité de la salle");
    }

    if (dataReservations.some(
        existingReservation => (existingReservation.salle === updatedReservation.salle) && 
        ((`${existingReservation.dateDebut}T${existingReservation.heureDebut}` <= `${updatedReservation.dateDebut}T${updatedReservation.heureDebut}` && `${existingReservation.dateFin}T${existingReservation.heureFin}` > `${updatedReservation.dateDebut}T${updatedReservation.heureDebut}`) ||
        (`${existingReservation.dateDebut}T${existingReservation.heureDebut}` < `${updatedReservation.dateFin}T${updatedReservation.heureFin}` && `${existingReservation.dateFin}T${existingReservation.heureFin}` >= `${updatedReservation.dateFin}T${updatedReservation.heureFin}`))
        && !(existingReservation.salle === salleReservee && existingReservation.dateDebut === dateDebut && existingReservation.heureDebut === HeureDebut))) {
        throw new Error("Salle déjà réservée pour cette période");
    }

    const index = dataReservations.findIndex(existingReservation => existingReservation.salle === salleReservee && existingReservation.dateDebut === dateDebut && existingReservation.heureDebut === HeureDebut);

    if (index === -1) {
        addReservation(updatedReservation, dataPath);
        return "Nouvelle réservation créée avec succès";
    }

    dataReservations[index] = updatedReservation;
    writeData(data, dataPath);
    return "Réservation modifiée avec succès";
}

function jourReservation(jour, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataReservations = Array.isArray(data.reservations) ? data.reservations : [];
    return {
        reservations: dataReservations.filter(reservation =>
            reservation.dateDebut <= jour && reservation.dateFin >= jour)
    };
}

function salleReservation(salle, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataReservations = Array.isArray(data.reservations) ? data.reservations : [];
    return {
        reservations: dataReservations.filter(reservation => reservation.salle === salle)
    };
}


module.exports = {
    addReservation,
    deleteReservation,
    editReservation,
    getReservations,
    jourReservation,
    salleReservation
};