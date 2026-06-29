const API_URL = 'http://localhost:8000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export async function getFarmacias() {
    const response = await fetch(`${API_URL}/farmacias`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener farmacias');
    return response.json();
}

export async function createFarmacia(data) {
    const response = await fetch(`${API_URL}/farmacias`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al crear farmacia');
    return result;
}

export async function updateFarmacia(id, data) {
    const response = await fetch(`${API_URL}/farmacias/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al actualizar farmacia');
    return result;
}

export async function deleteFarmacia(id) {
    const response = await fetch(`${API_URL}/farmacias/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al eliminar farmacia');
    return result;
}