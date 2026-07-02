const API_URL = 'http://localhost/api';

console.log("🔥 authService cargado - API_URL:", API_URL);

export async function login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
    }

    console.log("🔥 Respuesta del backend:", data);

    localStorage.setItem('token', data.token);
    localStorage.setItem('idrol', data.user.idrol);
    localStorage.setItem('rol', data.user.rol);
    localStorage.setItem('email', data.user.email);
    // 🌟 Guardamos el array de permisos convirtiéndolo en un string JSON
    localStorage.setItem('permisos', JSON.stringify(data.user.permisos || []));

    return data;
}

export async function logout() {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    localStorage.clear();
}