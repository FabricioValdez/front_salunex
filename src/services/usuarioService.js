const API_URL = 'http://localhost:8000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Listar todos los usuarios
export async function getUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// Obtener roles para el select
export async function getRoles() {
    const response = await fetch(`${API_URL}/roles`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener roles');
    return response.json();
}

// Crear usuario
export async function createUsuario(data) {
    const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al crear usuario');
    return result;
}

// Actualizar usuario
export async function updateUsuario(id, data) {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al actualizar usuario');
    return result;
}

// Eliminar usuario
export async function deleteUsuario(id) {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al eliminar usuario');
    return result;
}