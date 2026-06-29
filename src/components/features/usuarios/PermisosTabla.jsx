import ModuloRow from "./ModuloRow";

const MODULOS = [
    { id: "usuarios",   label: "Usuarios" },
    { id: "empresas",   label: "Empresas" },
    { id: "farmacias",  label: "Farmacias" },
    { id: "almacenes",  label: "Almacenes" },
    { id: "productos",  label: "Productos" },
    { id: "inventario", label: "Inventario" },
    { id: "ordenes",    label: "Órdenes de compra" },
    { id: "recepcion",  label: "Recepción de almacén" },
    { id: "control",    label: "Control de calidad" },
    { id: "dashboard",  label: "Dashboard" },
];

const PERMISOS = ["lectura", "escritura", "eliminacion"];

function PermisosTabla({ permisos, onChange }) {
    const todosSeleccionados = MODULOS.every((m) =>
        PERMISOS.every((p) => permisos[m.id][p])
    );
    const algunoSeleccionado = MODULOS.some((m) =>
        PERMISOS.some((p) => permisos[m.id][p])
    );

    const handleTodosTodo = (checked) => {
        const nuevos = MODULOS.reduce((acc, m) => ({
            ...acc,
            [m.id]: { lectura: checked, escritura: checked, eliminacion: checked }
        }), {});
        onChange(nuevos);
    };

    return (
        <div className="permisos-card">
            <div className="permisos-card-header">
                <h3>Permisos por módulo</h3>
                <p>Define qué acciones puede realizar este usuario en cada módulo.</p>
            </div>

            <table className="permisos-tabla">
                <thead>
                    <tr>
                        <th>Módulo</th>
                        <th className="center">
                            <div className="th-todo">
                                <input
                                    type="checkbox"
                                    className="permiso-checkbox"
                                    checked={todosSeleccionados}
                                    ref={(el) => { if (el) el.indeterminate = algunoSeleccionado && !todosSeleccionados; }}
                                    onChange={(e) => handleTodosTodo(e.target.checked)}
                                />
                                <span>Todo</span>
                            </div>
                        </th>
                        <th className="center">Lectura</th>
                        <th className="center">Escritura</th>
                        <th className="center">Eliminación</th>
                    </tr>
                </thead>
                <tbody>
                    {MODULOS.map((modulo) => (
                        <ModuloRow
                            key={modulo.id}
                            modulo={modulo}
                            permisos={permisos[modulo.id]}
                            onChange={(id, nuevosPermisos) =>
                                onChange({ ...permisos, [id]: nuevosPermisos })
                            }
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PermisosTabla;