const PERMISOS = ["lectura", "escritura", "eliminacion"];

function ModuloRow({ modulo, permisos, onChange }) {
    const todos  = PERMISOS.every((p) => permisos[p]);
    const alguno = PERMISOS.some((p) => permisos[p]);

    const handleTodo = (checked) => {
        onChange(modulo.id, {
            lectura:     checked,
            escritura:   checked,
            eliminacion: checked,
        });
    };

    const handlePermiso = (permiso, checked) => {
        onChange(modulo.id, { ...permisos, [permiso]: checked });
    };

    return (
        <tr>
            <td>{modulo.label}</td>
            <td className="center">
                <input
                    type="checkbox"
                    className="permiso-checkbox"
                    checked={todos}
                    ref={(el) => { if (el) el.indeterminate = alguno && !todos; }}
                    onChange={(e) => handleTodo(e.target.checked)}
                />
            </td>
            {PERMISOS.map((permiso) => (
                <td key={permiso} className="center">
                    <input
                        type="checkbox"
                        className="permiso-checkbox"
                        checked={permisos[permiso]}
                        onChange={(e) => handlePermiso(permiso, e.target.checked)}
                    />
                </td>
            ))}
        </tr>
    );
}

export default ModuloRow;