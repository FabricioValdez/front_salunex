import Button from "../../ui/Button";

function UsuarioInfoCard({ form, setForm, roles, onSubmit, loading, error, success }) {
    return (
        <div className="usuario-info-card">
            <h3>Información básica</h3>

            {error && (
                <div className="alert alert-danger py-2 text-center mb-3">{error}</div>
            )}
            {success && (
                <div className="alert alert-success py-2 text-center mb-3">
                    ✅ Cambios guardados correctamente
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Contraseña
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>
                        (vacío = no cambiar)
                    </span>
                </label>
                <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Rol</label>
                <select
                    className="form-select"
                    value={form.idrol}
                    onChange={(e) => setForm({ ...form, idrol: e.target.value })}
                >
                    <option value="">Selecciona un rol</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                </select>
            </div>

            <Button
                variant="primary"
                onClick={onSubmit}
                disabled={loading}
                className="w-100"
            >
                {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
        </div>
    );
}

export default UsuarioInfoCard;