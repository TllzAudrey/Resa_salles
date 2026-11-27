const message = document.getElementById("message");
const salleList = document.getElementById("salleListItems");

async function requestApi(url, options) {
    const response = await fetch(url, options);
    if (response.status === 204) {
        return null;
    }

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || "La requête a échoué.");
    }
    return result;
}

function showMessage(text) {
    message.textContent = text;
}

function renderSalles(salles) {
    salleList.replaceChildren();

    salles.forEach(salle => {
        const item = document.createElement("li");
        const description = document.createElement("span");
        description.textContent = `${salle.name} — capacité : ${salle.capacity} `;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Modifier";
        editButton.addEventListener("click", () => {
            document.getElementById("updateSalleKey").value = salle.name;
            document.getElementById("updateSalleName").value = salle.name;
            document.getElementById("updateSalleCapacity").value = salle.capacity;
            document.getElementById("updateSalleName").focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";
        deleteButton.addEventListener("click", async () => {
            try {
                await requestApi(`/api/salles/${encodeURIComponent(salle.name)}`, { method: "DELETE" });
                showMessage("Salle supprimée.");
                await loadSalles();
            } catch (error) {
                showMessage(error.message);
            }
        });

        item.append(description, editButton, " ", deleteButton);
        salleList.appendChild(item);
    });
}

async function loadSalles() {
    try {
        renderSalles(await requestApi("/api/salles"));
    } catch (error) {
        showMessage(error.message);
    }
}

document.getElementById("addSalleForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const salle = {
        name: document.getElementById("salleName").value.trim(),
        capacity: Number(document.getElementById("salleCapacity").value)
    };

    try {
        await requestApi("/api/salles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(salle)
        });
        form.reset();
        showMessage("Salle créée.");
        await loadSalles();
    } catch (error) {
        showMessage(error.message);
    }
});

document.getElementById("updateSalleForm").addEventListener("submit", async event => {
    event.preventDefault();
    const name = document.getElementById("updateSalleKey").value.trim();
    const salle = {
        name: document.getElementById("updateSalleName").value.trim(),
        capacity: Number(document.getElementById("updateSalleCapacity").value)
    };

    try {
        await requestApi(`/api/salles/${encodeURIComponent(name)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(salle)
        });
        showMessage("Salle modifiée.");
        await loadSalles();
    } catch (error) {
        showMessage(error.message);
    }
});

document.getElementById("deleteSalleForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = document.getElementById("deleteSalleKey").value.trim();

    try {
        await requestApi(`/api/salles/${encodeURIComponent(name)}`, { method: "DELETE" });
        form.reset();
        showMessage("Salle supprimée.");
        await loadSalles();
    } catch (error) {
        showMessage(error.message);
    }
});

loadSalles();
