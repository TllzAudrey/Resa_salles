const express = require("express");
const path = require("path");
const {
    addSalle,
    deleteSalle,
    editSalle,
    getSalles
} = require("../salle/salle");
const {
    addReservation,
    deleteReservation,
    editReservation,
    getReservations,
    jourReservation,
    salleReservation
} = require("../reservation/reservation");

const app = express();
const dataPath = process.env.SALLE_DATA_FILE || path.resolve(__dirname, "..", "data.json");
const frontendPath = path.resolve(__dirname, "..", "..", "front");

app.use(express.json());

function isValidSalle(salle) {
    return salle &&
        typeof salle.name === "string" &&
        salle.name.trim().length > 0 &&
        Number.isInteger(salle.capacity) &&
        salle.capacity > 0;
}

function isValidReservation(reservation) {
    return reservation &&
        typeof reservation.salle === "string" &&
        reservation.salle.trim().length > 0 &&
        typeof reservation.dateDebut === "string" &&
        reservation.dateDebut.length > 0 &&
        typeof reservation.dateFin === "string" &&
        reservation.dateFin.length > 0 &&
        typeof reservation.heureDebut === "string" &&
        reservation.heureDebut.length > 0 &&
        typeof reservation.heureFin === "string" &&
        reservation.heureFin.length > 0 &&
        typeof reservation.capacite === "string" &&
        Number.isFinite(Number(reservation.capacite)) &&
        Number(reservation.capacite) > 0;
}

app.get("/api/salles", (request, response) => {
    response.json(getSalles(dataPath));
});

app.post("/api/salles", (request, response) => {
    if (!isValidSalle(request.body)) {
        return response.status(400).json({ error: "Le nom et la capacité de la salle sont obligatoires." });
    }

    const salle = {
        name: request.body.name.trim(),
        capacity: request.body.capacity
    };
    const createdSalle = addSalle(salle, dataPath);
    response.status(201).json(createdSalle);
});

app.put("/api/salles/:id", (request, response) => {
    if (!isValidSalle(request.body)) {
        return response.status(400).json({ error: "Le nom et la capacité de la salle sont obligatoires." });
    }

    const salle = {
        name: request.body.name.trim(),
        capacity: request.body.capacity
    };
    const updatedSalle = editSalle(request.params.id, salle, dataPath);
    if (!updatedSalle) {
        return response.status(404).json({ error: "Salle introuvable." });
    }
    response.json(updatedSalle);
});

app.delete("/api/salles/:id", (request, response) => {
    if (!deleteSalle(request.params.id, dataPath)) {
        return response.status(404).json({ error: "Salle introuvable." });
    }
    response.status(204).end();
});

app.get("/api/reservations", (request, response) => {
    const { jour, salle } = request.query;
    if ((jour !== undefined && (typeof jour !== "string" || jour.length === 0)) ||
        (salle !== undefined && (typeof salle !== "string" || salle.trim().length === 0))) {
        return response.status(400).json({ error: "Les filtres jour et salle doivent être des valeurs uniques et non vides." });
    }

    let reservations;
    if (jour !== undefined && salle !== undefined) {
        reservations = jourReservation(jour, dataPath).reservations.filter(
            reservation => reservation.salle === salle.trim()
        );
    } else if (jour !== undefined) {
        reservations = jourReservation(jour, dataPath).reservations;
    } else if (salle !== undefined) {
        reservations = salleReservation(salle.trim(), dataPath).reservations;
    } else {
        reservations = getReservations(dataPath);
    }
    response.json(reservations);
});

app.post("/api/reservations", (request, response) => {
    if (!isValidReservation(request.body)) {
        return response.status(400).json({ error: "Les informations de la réservation sont invalides." });
    }

    const reservation = {
        salle: request.body.salle.trim(),
        dateDebut: request.body.dateDebut,
        dateFin: request.body.dateFin,
        heureDebut: request.body.heureDebut,
        heureFin: request.body.heureFin,
        capacite: request.body.capacite
    };
    addReservation(reservation, dataPath);
    response.status(201).json(reservation);
});

app.put("/api/reservations", (request, response) => {
    const current = request.body && request.body.current;
    const reservation = request.body && request.body.reservation;
    if (!current ||
        typeof current.salle !== "string" ||
        current.salle.trim().length === 0 ||
        typeof current.dateDebut !== "string" ||
        current.dateDebut.length === 0 ||
        typeof current.heureDebut !== "string" ||
        current.heureDebut.length === 0 ||
        !isValidReservation(reservation)) {
        return response.status(400).json({ error: "Les informations de la réservation sont invalides." });
    }

    const reservationKey = {
        salle: current.salle.trim(),
        dateDebut: current.dateDebut,
        heureDebut: current.heureDebut
    };
    const exists = getReservations(dataPath).some(existingReservation =>
        existingReservation.salle === reservationKey.salle &&
        existingReservation.dateDebut === reservationKey.dateDebut &&
        existingReservation.heureDebut === reservationKey.heureDebut);
    if (!exists) {
        return response.status(404).json({ error: "Réservation introuvable." });
    }

    const updatedReservation = {
        salle: reservation.salle.trim(),
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        heureDebut: reservation.heureDebut,
        heureFin: reservation.heureFin,
        capacite: reservation.capacite
    };
    editReservation(
        reservationKey.salle,
        reservationKey.dateDebut,
        reservationKey.heureDebut,
        updatedReservation,
        dataPath
    );
    response.json(updatedReservation);
});

app.delete("/api/reservations", (request, response) => {
    const current = request.body && request.body.current;
    if (!current ||
        typeof current.salle !== "string" ||
        current.salle.trim().length === 0 ||
        typeof current.dateDebut !== "string" ||
        current.dateDebut.length === 0 ||
        typeof current.heureDebut !== "string" ||
        current.heureDebut.length === 0) {
        return response.status(400).json({ error: "Les informations de la réservation sont invalides." });
    }

    const reservationKey = {
        salle: current.salle.trim(),
        dateDebut: current.dateDebut,
        heureDebut: current.heureDebut
    };
    const exists = getReservations(dataPath).some(existingReservation =>
        existingReservation.salle === reservationKey.salle &&
        existingReservation.dateDebut === reservationKey.dateDebut &&
        existingReservation.heureDebut === reservationKey.heureDebut);
    if (!exists) {
        return response.status(404).json({ error: "Réservation introuvable." });
    }

    deleteReservation(
        reservationKey.salle,
        reservationKey.dateDebut,
        reservationKey.heureDebut,
        dataPath
    );
    response.status(204).end();
});

app.get("/", (request, response) => {
    response.sendFile(path.join(frontendPath, "index.html"));
});

app.use(express.static(frontendPath));

app.use("/api", (request, response) => {
    response.status(404).json({ error: "Route API introuvable." });
});

app.use((error, request, response, next) => {
    if (error.code === "SALLE_DUPLICATE") {
        return response.status(409).json({ error: error.message });
    }
    if (error.message === "Salle déjà réservée pour cette période") {
        return response.status(409).json({ error: error.message });
    }
    if (error.message === "Salle inexistante") {
        return response.status(404).json({ error: error.message });
    }
    if ([
        "Pas de Date de début",
        "Pas de Date de fin",
        "Pas d'heure de début",
        "Pas d'heure de fin",
        "Heure de fin inférieure à l'heure de début",
        "Date de fin inférieure à la date de début",
        "Pas de capacité",
        "Capacité de réservation supérieure à la capacité de la salle"
    ].includes(error.message)) {
        return response.status(400).json({ error: error.message });
    }
    if (error.status === 400) {
        return response.status(400).json({ error: "Requête JSON invalide." });
    }
    console.error(error);
    response.status(500).json({ error: "Erreur interne du serveur." });
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
    });
}

module.exports = app;