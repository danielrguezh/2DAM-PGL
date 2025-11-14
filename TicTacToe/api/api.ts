export async function fetchDevices() {
    const res = await fetch(`http://127.0.0.1:5000/devices/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "devices not found" : "Error en la solicitud");
    }
    return res.json();
}

export async function fetchDevicesByIdInfo(id: string) {
    const res = await fetch(`http://127.0.0.1:5000/devices/${id}/info/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "Personaje no encontrado" : "Error en la solicitud");
    }
    return res.json();
}

export async function fetchMatches() {
    const res = await fetch(`http://127.0.0.1:5000/matches/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "Personaje no encontrado" : "Error en la solicitud");
    }
    return res.json();
}

export async function fetchMatchesWaitingStatus() {
    const res = await fetch(`http://127.0.0.1:5000/matches/waiting-status/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "Personaje no encontrado" : "Error en la solicitud");
    }
    return res.json();
}

export async function fetchMatchesById(id: string) {
    const res = await fetch(`http://127.0.0.1:5000/matches/${id}/moves/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "Personaje no encontrado" : "Error en la solicitud");
    }
    return res.json();
}

export async function fetchMatchesByIdMoves(id: string) {
    const res = await fetch(`http://127.0.0.1:5000/matches/${id}/`);
    if (!res.ok) {
        throw new Error(res.status === 404 ? "Personaje no encontrado" : "Error en la solicitud");
    }
    return res.json();
}

