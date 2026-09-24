const API_URL = "http://localhost/api";

export async function registrarEmpresa(datos) {
    const response = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (!response.ok) {
        // Error de validación de Laravel
        if (data.errors) {
            const primerError = Object.values(data.errors)[0];

            throw new Error(
                Array.isArray(primerError)
                    ? primerError[0]
                    : primerError
            );
        }

        throw new Error(
            data.message || "Error al registrar la empresa"
        );
    }

    return data;
}