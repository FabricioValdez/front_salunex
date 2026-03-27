const API_URL = 'http://localhost:8000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export async function getAlmacenes() {
    const response = await fetch(`${API_URL}/almacenes`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener almacenes');
    return response.json();
}

export async function createAlmacen(data) {
    const response = await fetch(`${API_URL}/almacenes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al crear almacén');
    return result;
}

export async function updateAlmacen(id, data) {
    const response = await fetch(`${API_URL}/almacenes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al actualizar almacén');
    return result;
}

export async function deleteAlmacen(id) {
    const response = await fetch(`${API_URL}/almacenes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al eliminar almacén');
    return result;
}