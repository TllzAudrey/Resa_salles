const message = document.getElementById("message");

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

async function loadSalles() {
    try {
        renderSalles(await requestApi("/api/salles"));
    } catch (error) {
        showMessage(error.message);
    }
}

function renderSalles(salles) {
    const salleList = document.getElementById("salleListItems");
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

function setupSallePage() {
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
}

function setupReservationPage() {
    const salleSelect = document.getElementById("salleName");
    const reservationKeySelect = document.getElementById("updateReservationKey");
    const deleteReservationKeySelect = document.getElementById("deleteReservationKey");
    const reservationList = document.getElementById("reservationListItems");
    let reservations = [];

    async function loadReservationSalles() {
        const salles = await requestApi("/api/salles");
        salleSelect.replaceChildren(new Option("--Sélectionnez une salle--", ""));
        salles.forEach(salle => {
            salleSelect.add(new Option(salle.name, salle.name));
        });
    }

    async function loadReservations() {
        reservations = await requestApi("/api/reservations");
        reservationList.replaceChildren();
        reservationKeySelect.replaceChildren(new Option("--Sélectionnez une réservation--", ""));
        deleteReservationKeySelect.replaceChildren(new Option("--Sélectionnez une réservation--", ""));

        reservations.forEach((reservation, index) => {
            const label = `${reservation.salle} — ${reservation.dateDebut} ${reservation.heureDebut}`;
            const key = String(index);
            reservationKeySelect.add(new Option(label, key));
            deleteReservationKeySelect.add(new Option(label, key));

            const item = document.createElement("li");
            item.textContent = `${label} à ${reservation.dateFin} ${reservation.heureFin} — ${reservation.capacite} participants`;
            reservationList.appendChild(item);
        });
    }

    document.getElementById("addReservationForm").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const reservation = {
            salle: salleSelect.value,
            dateDebut: document.getElementById("reservationStartDate").value,
            dateFin: document.getElementById("reservationEndDate").value,
            heureDebut: document.getElementById("reservationStartHour").value,
            heureFin: document.getElementById("reservationEndHour").value,
            capacite: document.getElementById("reservationCapacity").value
        };

        try {
            await requestApi("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reservation)
            });
            form.reset();
            showMessage("Réservation créée.");
            await loadReservations();
        } catch (error) {
            showMessage(error.message);
        }
    });

    reservationKeySelect.addEventListener("change", () => {
        if (reservationKeySelect.value === "") {
            return;
        }
        const reservation = reservations[Number(reservationKeySelect.value)];
        if (!reservation) {
            return;
        }

        document.getElementById("updateReservationStartDate").value = reservation.dateDebut;
        document.getElementById("updateReservationEndDate").value = reservation.dateFin;
        document.getElementById("updateReservationStartHour").value = reservation.heureDebut;
        document.getElementById("updateReservationEndHour").value = reservation.heureFin;
        document.getElementById("updateReservationCapacity").value = reservation.capacite;
    });

    document.getElementById("updateReservationForm").addEventListener("submit", async event => {
        event.preventDefault();
        if (reservationKeySelect.value === "") {
            showMessage("Sélectionnez une réservation à modifier.");
            return;
        }
        const current = reservations[Number(reservationKeySelect.value)];
        if (!current) {
            showMessage("Sélectionnez une réservation à modifier.");
            return;
        }

        const reservation = {
            salle: current.salle,
            dateDebut: document.getElementById("updateReservationStartDate").value,
            dateFin: document.getElementById("updateReservationEndDate").value,
            heureDebut: document.getElementById("updateReservationStartHour").value,
            heureFin: document.getElementById("updateReservationEndHour").value,
            capacite: document.getElementById("updateReservationCapacity").value
        };

        try {
            await requestApi("/api/reservations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current: {
                        salle: current.salle,
                        dateDebut: current.dateDebut,
                        heureDebut: current.heureDebut
                    },
                    reservation
                })
            });
            showMessage("Réservation modifiée.");
            await loadReservations();
        } catch (error) {
            showMessage(error.message);
        }
    });

    document.getElementById("deleteReservationForm").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (deleteReservationKeySelect.value === "") {
            showMessage("Sélectionnez une réservation à supprimer.");
            return;
        }
        const current = reservations[Number(deleteReservationKeySelect.value)];
        if (!current) {
            showMessage("Sélectionnez une réservation à supprimer.");
            return;
        }

        try {
            await requestApi("/api/reservations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current: {
                        salle: current.salle,
                        dateDebut: current.dateDebut,
                        heureDebut: current.heureDebut
                    }
                })
            });
            form.reset();
            showMessage("Réservation supprimée.");
            await loadReservations();
        } catch (error) {
            showMessage(error.message);
        }
    });

    Promise.all([loadReservationSalles(), loadReservations()]).catch(error => {
        showMessage(error.message);
    });
}

function setupHomePage() {
    const form = document.getElementById("reservationSearchForm");
    const dayInput = document.getElementById("reservationDay");
    const salleSelect = document.getElementById("reservationRoom");
    const reservationList = document.getElementById("reservationListItems");

    function renderReservations(reservations) {
        reservationList.replaceChildren();
        if (reservations.length === 0) {
            const item = document.createElement("li");
            item.textContent = "Aucune réservation pour ces critères.";
            reservationList.appendChild(item);
            return;
        }

        reservations.forEach(reservation => {
            const item = document.createElement("li");
            item.textContent = `${reservation.salle} — du ${reservation.dateDebut} ${reservation.heureDebut} au ${reservation.dateFin} ${reservation.heureFin} — ${reservation.capacite} participants`;
            reservationList.appendChild(item);
        });
    }

    async function loadReservations() {
        const query = new URLSearchParams();
        if (dayInput.value) {
            query.set("jour", dayInput.value);
        }
        if (salleSelect.value) {
            query.set("salle", salleSelect.value);
        }
        const queryString = query.toString();
        const url = queryString ? `/api/reservations?${queryString}` : "/api/reservations";
        renderReservations(await requestApi(url));
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        try {
            await loadReservations();
            showMessage("");
        } catch (error) {
            showMessage(error.message);
        }
    });

    document.getElementById("clearReservationFilters").addEventListener("click", async () => {
        form.reset();
        try {
            await loadReservations();
            showMessage("");
        } catch (error) {
            showMessage(error.message);
        }
    });

    Promise.all([
        requestApi("/api/salles"),
        requestApi("/api/reservations")
    ]).then(([salles, reservations]) => {
        salles.forEach(salle => {
            salleSelect.add(new Option(salle.name, salle.name));
        });
        renderReservations(reservations);
    }).catch(error => {
        showMessage(error.message);
    });
}

if (document.getElementById("addReservationForm")) {
    setupReservationPage();
} else if (document.getElementById("addSalleForm")) {
    setupSallePage();
} else if (document.getElementById("reservationSearchForm")) {
    setupHomePage();
}
