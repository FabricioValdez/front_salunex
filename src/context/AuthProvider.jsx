import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../services/api";

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const idrol = localStorage.getItem("idrol");
        const rol = localStorage.getItem("rol");
        const email = localStorage.getItem("email");
        const permisos = localStorage.getItem("permisos");
        const ubicacion = localStorage.getItem("ubicacion");

        return token
            ? {
                token,
                idrol: Number(idrol),
                rol,
                email,
                permisos: permisos && permisos !== "undefined" ? JSON.parse(permisos) : [],
                // 🌟 CORRECCIÓN 1: Aquí incluimos la ubicación en la carga inicial
                ubicacion: ubicacion && ubicacion !== "undefined" && ubicacion !== "null" ? JSON.parse(ubicacion) : null,
            }
            : null;
    });

    // Sincronizar permisos en segundo plano si la sesión ya existe
    useEffect(() => {
        if (user && user.token) {
            api.get('/usuario/permisos')
                .then(res => {
                    const permisosFrescos = res.data.permisos || [];
                    localStorage.setItem("permisos", JSON.stringify(permisosFrescos));

                    // Solo actualizamos el estado si hubo cambios para evitar parpadeos
                    setUser(prev => {
                        if (JSON.stringify(prev.permisos) !== JSON.stringify(permisosFrescos)) {
                            // 🌟 CORRECCIÓN 2: Se quitó la línea de sintaxis inválida aquí
                            return { ...prev, permisos: permisosFrescos };
                        }
                        return prev;
                    });
                })
                .catch(console.error);
        }
    }, [user?.token]);

    const loginUser = (token, userData) => {
        setUser({
            token,
            idrol: userData.idrol,
            rol: userData.rol,
            email: userData.email,
            permisos: userData.permisos || [],
            // 🌟 Inyectamos la ubicación cuando se hace login activo
            ubicacion: userData.ubicacion || null,
        });
    };

    const logoutUser = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;