import { useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const idrol = localStorage.getItem("idrol");
        const rol   = localStorage.getItem("rol");
        const email = localStorage.getItem("email");
        return token ? { token, idrol: Number(idrol), rol, email } : null;
    });

    const loginUser = (token, userData) => {
        setUser({
            token,
            idrol: userData.idrol,
            rol:   userData.rol,
            email: userData.email,
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