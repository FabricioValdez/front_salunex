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
    
    try {
        // Intentamos avisarle al backend que destruya el token
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        // Si el backend intenta redirigir y el navegador lo bloquea, 
        // atrapamos el error aquí de forma silenciosa para que no rompa la app.
        console.warn("Aviso: El backend redirigió el logout, procediendo con la limpieza local.");
    } finally {
        // 🌟 Esto se ejecuta SÍ O SÍ, garantizando que se limpie la sesión en React
        localStorage.clear();
        window.location.href = '/login'; 
    }
}