import { useState, useContext } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";
import { useCatalogos } from "../../context/CatalogosContext";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/admin/Catalogos.css";

function ProductoForm({ form, setForm, categoriasProducto, clasificacionesProducto, presentacionesProducto, viasAdministracion, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="row">
                {/* COLUMNA IZQUIERDA */}
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" className="form-control" value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Nombre del producto" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Código interno</label>
                        <input type="text" className="form-control" value={form.codigo_interno}
                            onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })}
                            placeholder="Código interno" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Precio (MXN)</label>
                        <input type="number" className="form-control" value={form.precio}
                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                            placeholder="0.00" />
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label">Cant. concentración</label>
                            <input type="number" className="form-control" value={form.cantidad_concentracion}
                                onChange={(e) => setForm({ ...form, cantidad_concentracion: e.target.value })}
                                placeholder="Ej. 500" />
                        </div>
                        <div className="col">
                            <label className="form-label">Unidad</label>
                            <input type="text" className="form-control" value={form.unidad_concentracion}
                                onChange={(e) => setForm({ ...form, unidad_concentracion: e.target.value })}
                                placeholder="Ej. mg, ml..." />
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA (Catálogos) */}
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Categoría</label>
                        <select className="form-select" value={form.id_categoria_producto}
                            onChange={(e) => setForm({ ...form, id_categoria_producto: e.target.value })}>
                            <option value="">Selecciona una categoría</option>
                            {categoriasProducto.map((c) => <option key={c.id} value={c.id}>{c.categoria}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Clasificación</label>
                        <select className="form-select" value={form.id_clasificacion_producto}
                            onChange={(e) => setForm({ ...form, id_clasificacion_producto: e.target.value })}>
                            <option value="">Selecciona una clasificación</option>
                            {clasificacionesProducto.map((c) => <option key={c.id} value={c.id}>{c.clasificacion}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Presentación</label>
                        <select className="form-select" value={form.id_presentacion_producto}
                            onChange={(e) => setForm({ ...form, id_presentacion_producto: e.target.value })}>
                            <option value="">Selecciona una presentación</option>
                            {presentacionesProducto.map((p) => <option key={p.id} value={p.id}>{p.presentacion}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Vía de administración</label>
                        <select className="form-select" value={form.id_via_administracion}
                            onChange={(e) => setForm({ ...form, id_via_administracion: e.target.value })}>
                            <option value="">Selecciona una vía</option>
                            {viasAdministracion.map((v) => <option key={v.id} value={v.id}>{v.administracion}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* FILA COMPLETA PARA DESCRIPCIÓN */}
            <div className="row mt-2">
                <div className="col-12">
                    <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-control" value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Descripción o indicaciones del producto..." rows={2} />
                    </div>
                </div>
            </div>

            <div className="form-actions mt-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </>
    );
}

function DeleteModal({ isOpen, onClose, onConfirm, loading, item }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar producto">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar el producto <strong>{item?.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="form-actions">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Eliminando..." : "Eliminar"}
                </Button>
            </div>
        </Modal>
    );
}

// Ya no enviamos id_empresa en el formVacio, el backend lo maneja solo
const formVacio = {
    nombre: "", codigo_interno: "", precio: "", descripcion: "",
    cantidad_concentracion: "", unidad_concentracion: "",
    id_categoria_producto: "", id_clasificacion_producto: "",
    id_presentacion_producto: "", id_via_administracion: "",
};

function Productos() {
    const { user } = useContext(AuthContext);

    // Ya no extraemos 'empresas' de useCatalogos porque no lo necesitamos en el select
    const { productos, categoriasProducto, clasificacionesProducto,
        presentacionesProducto, viasAdministracion, refreshCatalogo } = useCatalogos();

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Validación de permisos de escritura
    const canManage = user?.permisos?.includes("GPER") || ['Empresa', 'Super Administrador'].includes(user?.rol);

    const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo_interno?.toLowerCase().includes(search.toLowerCase()) ||
        p.empresa_nombre?.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm(formVacio);
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({
            nombre: item.nombre || "",
            codigo_interno: item.codigo_interno || "",
            precio: item.precio || "",
            descripcion: item.descripcion || "",
            cantidad_concentracion: item.cantidad_concentracion || "",
            unidad_concentracion: item.unidad_concentracion || "",
            id_categoria_producto: item.id_categoria_producto || "",
            id_clasificacion_producto: item.id_clasificacion_producto || "",
            id_presentacion_producto: item.id_presentacion_producto || "",
            id_via_administracion: item.id_via_administracion || "",
        });
        setIsEdit(true);
        setEditId(item.id);
        setError("");
        setModalOpen(true);
    };

    const handleEliminar = (item) => {
        setDeleteTarget(item);
        setDeleteOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/productos/${editId}`, form);
                refreshCatalogo('productos', productos.map((p) =>
                    p.id === editId ? { ...p, ...form } : p
                ));
            } else {
                const res = await api.post('/productos', form);
                // El backend devuelve el producto con todo, pero recargamos o agregamos a la lista
                refreshCatalogo('productos', [...productos, res.data.producto]);
            }
            setModalOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/productos/${deleteTarget.id}`);
            refreshCatalogo('productos', productos.filter((p) => p.id !== deleteTarget.id));
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Columnas condicionales
    const columns = canManage
        ? ["#", "Nombre", "Código", "Precio", "Categoría", "Empresa", "Acciones"]
        : ["#", "Nombre", "Código", "Precio", "Categoría", "Empresa"];

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar placeholder="Buscar por nombre o código..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                {/* Ocultamos el botón a los empleados */}
                {canManage && (
                    <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                        Nuevo producto
                    </Button>
                )}
            </div>

            <div className="dashboard-title">
                <h1>Gestión de Productos</h1>
                <p>Administra los productos registrados en el sistema.</p>
            </div>

            <DataCard>
                <Table
                    columns={columns}
                    data={filtrados}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td><strong>{item.nombre}</strong></td>
                            <td>{item.codigo_interno}</td>
                            <td>${item.precio}</td>
                            <td>{item.categoria_producto_nombre}</td>
                            <td>{item.empresa_nombre}</td>
                            {/* Ocultamos los íconos de acción a los empleados */}
                            {canManage && (
                                <td>
                                    <div className="table-actions">
                                        <button className="action-btn" onClick={() => handleEditar(item)}>
                                            <Pencil size={16} color="#3b82f6" />
                                        </button>
                                        <button className="action-btn" onClick={() => handleEliminar(item)}>
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    )}
                />
            </DataCard>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar producto" : "Nuevo producto"}
                className="modal-lg">
                <ProductoForm
                    form={form} setForm={setForm}
                    categoriasProducto={categoriasProducto}
                    clasificacionesProducto={clasificacionesProducto}
                    presentacionesProducto={presentacionesProducto}
                    viasAdministracion={viasAdministracion}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOpen(false)}
                    loading={loading} error={error} />
            </Modal>

            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete} loading={loading} item={deleteTarget} />
        </PageContainer>
    );
}

export default Productos;