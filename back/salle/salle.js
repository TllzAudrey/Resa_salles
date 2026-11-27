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

function getSalles(dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const salles = Array.isArray(data.salles) ? data.salles : [];
    return salles.map(withoutGeneratedId);
}

function addSalle(salle, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    const dataSalles = Array.isArray(data.salles) ? data.salles : [];
    if (dataSalles.some(existingSalle => existingSalle.name === salle.name)) {
        const error = new Error("Salle déjà existante");
        error.code = "SALLE_DUPLICATE";
        throw error;
    }

    const newSalle = withoutGeneratedId(salle);
    dataSalles.push(newSalle);
    data.salles = dataSalles;
    writeData(data, dataPath);
    return newSalle;
}

function editSalle(name, updatedSalle, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    data.salles = Array.isArray(data.salles) ? data.salles : [];
    const index = data.salles.findIndex(salle => salle.name === name);
    if (index < 0) {
        return null;
    }
    if (data.salles.some(salle => salle.name !== name && salle.name === updatedSalle.name)) {
        const error = new Error("Salle déjà existante");
        error.code = "SALLE_DUPLICATE";
        throw error;
    }

    data.salles[index] = withoutGeneratedId(updatedSalle);
    writeData(data, dataPath);
    return data.salles[index];
}


function deleteSalle(name, dataPath = defaultDataPath) {
    const data = readData(dataPath);
    data.salles = Array.isArray(data.salles) ? data.salles : [];
    const index = data.salles.findIndex(salle => salle.name === name);
    if (index < 0) {
        return false;
    }

    data.salles.splice(index, 1);
    writeData(data, dataPath);
    return true;
}

module.exports = {
    addSalle,
    deleteSalle,
    editSalle,
    getSalles
};
