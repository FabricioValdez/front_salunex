const API_URL = 'http://localhost:8000/api';

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
    console.log("🔥 user antes de guardar:", data.user);
    console.log("🔥 idrol:", data.user.idrol);

    localStorage.setItem('token', data.token);
    localStorage.setItem('idrol', data.user.idrol);
    localStorage.setItem('rol', data.user.rol);
    localStorage.setItem('email', data.user.email);

    console.log("🔥 localStorage idrol guardado:", localStorage.getItem('idrol'));

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