export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!email || !password) {
                reject({ message: "Todos los campos son obligatorios" });
            }

            resolve({
                token: "fake-jwt-token",
                user: {
                    id: 1,
                    name: email.split("@")[0],
                    email: email,
                },
            });
        }, 1000);
    });
};