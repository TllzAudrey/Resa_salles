
function addSalle(salle) {
    const data = JSON.parse(require("fs").readFileSync("./data.json", "utf8"));
    const dataSalles = data.salles || [];
    if(dataSalles.some(s => s.name === salle.name)) {
        throw new Error("Salle déjà existante");
    }

    dataSalles.push(salle);
    require("fs").writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

function editSalle(name, updatedSalle) {
    const data = JSON.parse(require("fs").readFileSync("./data.json", "utf8"));
    const dataSalles = data.salles || [];
    for(let i = 0; i < dataSalles.length; i++) {
        if(dataSalles[i].name === name) {
            dataSalles[i] = updatedSalle;
            require("fs").writeFileSync("./data.json", JSON.stringify(data, null, 2));
            return;
        }
    }
    addSalle(updatedSalle);
}

module.exports = {
    addSalle,
    editSalle
};