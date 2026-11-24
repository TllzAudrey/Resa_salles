const {addSalle, editSalle} = require("./salle");


test("salle_add_returns_object", () => {
    // Arrange
    const salle = { name: "Salle 3", capacity: 50 };

    addSalle(salle);
    const data = JSON.parse(require("fs").readFileSync("./data.json", "utf8"));

    // Assert
    expect(data.salles).toContainEqual(salle);
});

test("salle_add_returns_error", () => {
    // Arrange
    const salle = { name: "Salle 1", capacity: 50 };
    const expected = "Salle déjà existante";

    // Assert
    expect(() => addSalle(salle)).toThrow(expected);
});

test("salle_edit_returns_object", () => {
    // Arrange
    const salle = { name: "Salle 1", capacity: 100 };

    editSalle(salle.name, salle);
    const data = JSON.parse(require("fs").readFileSync("./data.json", "utf8"));
    // Assert
    expect(data.salles).toContainEqual(salle);
});

test("salle_edit_returns_error", () => {
    // Arrange
    const salle = { name: "Salle 4", capacity: 50 };

    editSalle(salle.name, salle);
    const data = JSON.parse(require("fs").readFileSync("./data.json", "utf8"));


    // Assert
    expect(data.salles).toContainEqual(salle);
});
