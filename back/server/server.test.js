const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "salles-server-test-"));
const storagePath = path.join(storageDirectory, "data.json");
const previousStoragePath = process.env.SALLE_DATA_FILE;
process.env.SALLE_DATA_FILE = storagePath;

const app = require("./server");

beforeEach(() => {
    fs.writeFileSync(storagePath, JSON.stringify({ salles: [], reservations: [] }));
});

afterAll(() => {
    if (previousStoragePath === undefined) {
        delete process.env.SALLE_DATA_FILE;
    } else {
        process.env.SALLE_DATA_FILE = previousStoragePath;
    }
    fs.rmSync(storageDirectory, { recursive: true, force: true });
});

describe("routes des salles", () => {
    test("GET /api/salles retourne les salles sans générer d'identifiant distinct", async () => {
        fs.writeFileSync(storagePath, JSON.stringify({
            salles: [{ name: "Salle existante", capacity: 20, id: "1" }],
            reservations: []
        }));

        const response = await request(app).get("/api/salles");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ name: "Salle existante", capacity: 20 }]);
    });

    test("POST /api/salles crée une salle et la stocke", async () => {
        const response = await request(app)
            .post("/api/salles")
            .send({ name: "Salle 1", capacity: 30 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ name: "Salle 1", capacity: 30 });
        expect(JSON.parse(fs.readFileSync(storagePath, "utf8")).salles).toEqual([response.body]);
    });

    test("POST /api/salles rejette un nom déjà utilisé", async () => {
        await request(app).post("/api/salles").send({ name: "Salle 1", capacity: 30 });

        const response = await request(app)
            .post("/api/salles")
            .send({ name: "Salle 1", capacity: 40 });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Salle déjà existante");
    });

    test("POST /api/salles rejette les données invalides", async () => {
        const response = await request(app)
            .post("/api/salles")
            .send({ name: "", capacity: -1 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    test("PUT /api/salles/:id utilise le nom actuel comme identifiant", async () => {
        await request(app).post("/api/salles").send({ name: "Salle 1", capacity: 30 });

        const response = await request(app)
            .put("/api/salles/Salle%201")
            .send({ name: "Salle rénovée", capacity: 50 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ name: "Salle rénovée", capacity: 50 });
        expect(JSON.parse(fs.readFileSync(storagePath, "utf8")).salles).toEqual([response.body]);
    });

    test("PUT /api/salles/:id retourne 404 si la salle n'existe pas", async () => {
        const response = await request(app)
            .put("/api/salles/99")
            .send({ name: "Salle absente", capacity: 10 });

        expect(response.status).toBe(404);
    });

    test("DELETE /api/salles/:id utilise le nom de la salle comme identifiant", async () => {
        await request(app).post("/api/salles").send({ name: "Salle 1", capacity: 30 });

        const response = await request(app).delete("/api/salles/Salle%201");

        expect(response.status).toBe(204);
        expect(JSON.parse(fs.readFileSync(storagePath, "utf8")).salles).toEqual([]);
    });

    test("DELETE /api/salles/:id retourne 404 si la salle n'existe pas", async () => {
        const response = await request(app).delete("/api/salles/99");

        expect(response.status).toBe(404);
    });

    test("une route API inconnue retourne une erreur JSON 404", async () => {
        const response = await request(app).get("/api/inconnue");

        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test("un JSON mal formé retourne une erreur 400", async () => {
        const response = await request(app)
            .post("/api/salles")
            .set("Content-Type", "application/json")
            .send("{");

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    test("la page de gestion charge un client qui utilise les routes API", async () => {
        const page = await request(app).get("/salle.html");
        const script = await request(app).get("/app.js");

        expect(page.status).toBe(200);
        expect(page.text).toContain("/app.js");
        expect(script.status).toBe(200);
        expect(script.text).toContain("fetch(");
        expect(script.text).toContain("salle.name");
        expect(script.text).not.toContain("salle.id");
        expect(script.text).not.toContain("data.json");
    });
});