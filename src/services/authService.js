import api from './api'; // Asegúrate de ajustar la ruta si api.js está en otra carpeta

export async function login(email, password) {
    // api.post('/login') usará https://back-salunex2.onrender.com/api/login en Vercel
    const response = await api.post('/login', { email, password });
    const data = response.data;

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
    try {
        // Intentamos avisarle al backend que destruya el token
        await api.post('/logout');
    } catch (error) {
        // Si hay algún problema en el servidor, lo atrapamos para limpiar el cliente de todos modos
        console.warn("Aviso: Error en el logout del backend, procediendo con la limpieza local.");
    } finally {
        // 🌟 Esto se ejecuta SÍ O SÍ
        localStorage.clear();
        window.location.href = '/login'; 
    }
}