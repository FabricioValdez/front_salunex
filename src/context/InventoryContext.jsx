import { createContext, useState } from "react";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {

    const [inventario, setInventario] = useState([

        // EXPIRADOS
        {
            id: 1,
            nombre: "Amoxicilina 500mg",
            lote: "A102-442",
            fechaExp: "2024-01-10",
            cantidad: 25,
            categoria: "Antibiótico",
            precio: 120.5
        },
        {
            id: 2,
            nombre: "Insulina Glargina",
            lote: "B99-X502",
            fechaExp: "2024-02-01",
            cantidad: 12,
            categoria: "Hormona",
            precio: 450.0
        },

        // PRÓXIMOS A EXPIRAR (menos de 90 días)
        {
            id: 3,
            nombre: "Paracetamol 500mg",
            lote: "P44-210",
            fechaExp: "2026-03-12",
            cantidad: 40,
            categoria: "Antiinflamatorio",
            precio: 35.0
        },
        {
            id: 4,
            nombre: "Ibuprofeno 400mg",
            lote: "I77-332",
            fechaExp: "2026-04-20",
            cantidad: 30,
            categoria: "Antiinflamatorio",
            precio: 42.0
        },
        {
            id: 5,
            nombre: "Omeprazol 20mg",
            lote: "O21-119",
            fechaExp: "2026-05-10",
            cantidad: 18,
            categoria: "Antiácido",
            precio: 55.0
        },

        // FUTURO (NO DEBEN APARECER EN CONTROL DE CALIDAD)
        {
            id: 6,
            nombre: "Metformina 850mg",
            lote: "M88-441",
            fechaExp: "2027-01-15",
            cantidad: 50,
            categoria: "Antidiabético",
            precio: 80.0
        },
        {
            id: 7,
            nombre: "Loratadina 10mg",
            lote: "L33-990",
            fechaExp: "2027-03-10",
            cantidad: 22,
            categoria: "Antihistamínico",
            precio: 35.0
        }

    ]);

    const agregarMedicamento = (med) => {
        setInventario([...inventario, { ...med, id: Date.now() }]);
    };

    const eliminarMedicamento = (id) => {
        setInventario(inventario.filter((med) => med.id !== id));
    };

    const actualizarMedicamento = (medActualizado) => {
        setInventario(
            inventario.map((med) =>
                med.id === medActualizado.id ? medActualizado : med
            )
        );
    };

    return (
        <InventoryContext.Provider
            value={{
                inventario,
                agregarMedicamento,
                eliminarMedicamento,
                actualizarMedicamento
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};

export default InventoryContext;