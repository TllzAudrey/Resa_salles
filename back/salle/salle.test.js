const {addSalle, editSalle, deleteSalle} = require("./salle");
const fs = require("fs");
const path = require("path");
const dataLink = path.resolve(__dirname, "..", "data_test.json");

beforeEach(() => {
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [], reservations: [] }, null, 2));
});

test("salle_add_returns_object", () => {
    // Arrange
    const salle = { name: "Salle 3", capacity: 50 };

    addSalle(salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    // Assert
    expect(data.salles).toContainEqual(salle);
});

test("salle_add_returns_error", () => {
    // Arrange
    const salle = { name: "Salle 1", capacity: 50 };
    const expected = "Salle déjà existante";

    const data = salle;
    fs.writeFileSync(dataLink, JSON.stringify({ salles: [salle], reservations: [] }, null, 2));

    // Assert
    expect(() => addSalle(salle, dataLink)).toThrow(expected);
});

test("salle_edit_returns_object", () => {
    // Arrange
    const salle = { name: "Salle 1", capacity: 100 };

    editSalle(salle.name, salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));
    // Assert
    expect(data.salles).toContainEqual(salle);
});

test("salle_edit_returns_error", () => {
    // Arrange
    const salle = { name: "Salle 5", capacity: 50 };
    const expected = "Nouvelle salle créée";

    const result =  editSalle(salle.name, salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));
    // Assert
    expect(data.salles).toContainEqual(salle);
    expect(result).toBe(expected);
});

test("salle_delete_returns_message", () => {
    // Arrange
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
    const expected = "Salle supprimée";

    const result = deleteSalle(salle, dataLink);
    const data = JSON.parse(fs.readFileSync(dataLink, "utf8"));

    // Assert
    expect(data.salles.some(existingSalle => existingSalle.name === salle)).toBe(false);
    expect(result).toBe(expected);
});

test("salle_delete_returns_error", () => {
    // Arrange
    const salle = "Salle 6";
    const expected = "Salle n'existais pas";

    // Assert
    expect(() => deleteSalle(salle, dataLink)).toThrow(expected);
});
