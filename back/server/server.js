const express = require("express");
const path = require("path");
const {
    addSalle,
    deleteSalle,
    editSalle,
    getSalles
} = require("../salle/salle");

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

app.get("/", (request, response) => {
    response.sendFile(path.join(frontendPath, "salle.html"));
});

app.use(express.static(frontendPath));

app.use("/api", (request, response) => {
    response.status(404).json({ error: "Route API introuvable." });
});

app.use((error, request, response, next) => {
    if (error.code === "SALLE_DUPLICATE") {
        return response.status(409).json({ error: error.message });
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