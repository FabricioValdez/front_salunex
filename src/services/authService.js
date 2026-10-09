import api from './api'; // Asegúrate de ajustar la ruta si api.js está en otra carpeta

export async function login(email, password) {
    const response = await api.post('/login', { email, password });
    const data = response.data;

    // 1. Guardamos el token primero para que el interceptor de Axios ya lo pueda usar
    localStorage.setItem('token', data.token);
    localStorage.setItem('idrol', data.user.idrol);
    localStorage.setItem('rol', data.user.rol);
    localStorage.setItem('email', data.user.email);

    // 2. 🌟 SOLUCIÓN: Hacemos el fetch de permisos en este paso intermedio
    try {
        const resPermisos = await api.get('/usuario/permisos');
        const permisosUsuario = resPermisos.data.permisos || [];

        // Guardamos los permisos reales en memoria local
        localStorage.setItem('permisos', JSON.stringify(permisosUsuario));
        data.user.permisos = permisosUsuario; // Se lo inyectamos a los datos que recibe AuthProvider
        localStorage.setItem('ubicacion', JSON.stringify(data.user.ubicacion || null));

    } catch (error) {
        console.error("Error obteniendo los permisos en el login:", error);
        localStorage.setItem('permisos', JSON.stringify([]));
        data.user.permisos = [];
    }

    return data;
}

export async function logout() {
    try {
        await api.post('/logout');
    } catch (error) {
        console.warn("Aviso: Error en el logout del backend, procediendo con la limpieza local.");
    } finally {
        // Mantenemos la limpieza, pero quitamos el window.location.href
        localStorage.clear();
    }
}