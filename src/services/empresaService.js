const API_URL = 'http://localhost:8000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export async function getEmpresas() {
    const response = await fetch(`${API_URL}/empresas`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener empresas');
    return response.json();
}

export async function createEmpresa(data) {
    const response = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al crear empresa');
    return result;
}

export async function updateEmpresa(id, data) {
    const response = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al actualizar empresa');
    return result;
}

export async function deleteEmpresa(id) {
    const response = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al eliminar empresa');
    return result;
}