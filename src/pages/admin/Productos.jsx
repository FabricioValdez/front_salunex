import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

function ProductoForm({ form, setForm, empresas, categoriasProducto, clasificacionesProducto, presentacionesProducto, viasAdministracion, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}

            <div className="row">
                {/* ── Columna izquierda ── */}
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Nombre del producto"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Código interno</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.codigo_interno}
                            onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })}
                            placeholder="Código interno"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Precio</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.precio}
                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="form-control"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Descripción del producto"
                            rows={4}
                        />
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label">Cantidad concentración</label>
                            <input
                                type="number"
                                className="form-control"
                                value={form.cantidad_concentracion}
                                onChange={(e) => setForm({ ...form, cantidad_concentracion: e.target.value })}
                                placeholder="Ej. 500"
                            />
                        </div>
                        <div className="col">
                            <label className="form-label">Unidad</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.unidad_concentracion}
                                onChange={(e) => setForm({ ...form, unidad_concentracion: e.target.value })}
                                placeholder="Ej. mg, ml..."
                            />
                        </div>
                    </div>
                </div>

                {/* ── Columna derecha ── */}
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Empresa</label>
                        <select
                            className="form-select"
                            value={form.id_empresa}
                            onChange={(e) => setForm({ ...form, id_empresa: e.target.value })}
                        >
                            <option value="">Selecciona una empresa</option>
                            {empresas.map((e) => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Categoría</label>
                        <select
                            className="form-select"
                            value={form.id_categoria_producto}
                            onChange={(e) => setForm({ ...form, id_categoria_producto: e.target.value })}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categoriasProducto.map((c) => (
                                <option key={c.id} value={c.id}>{c.categoria}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Clasificación</label>
                        <select
                            className="form-select"
                            value={form.id_clasificacion_producto}
                            onChange={(e) => setForm({ ...form, id_clasificacion_producto: e.target.value })}
                        >
                            <option value="">Selecciona una clasificación</option>
                            {clasificacionesProducto.map((c) => (
                                <option key={c.id} value={c.id}>{c.clasificacion}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Presentación</label>
                        <select
                            className="form-select"
                            value={form.id_presentacion_producto}
                            onChange={(e) => setForm({ ...form, id_presentacion_producto: e.target.value })}
                        >
                            <option value="">Selecciona una presentación</option>
                            {presentacionesProducto.map((p) => (
                                <option key={p.id} value={p.id}>{p.presentacion}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Vía de administración</label>
                        <select
                            className="form-select"
                            value={form.id_via_administracion}
                            onChange={(e) => setForm({ ...form, id_via_administracion: e.target.value })}
                        >
                            <option value="">Selecciona una vía</option>
                            {viasAdministracion.map((v) => (
                                <option key={v.id} value={v.id}>{v.administracion}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Botones ── */}
            <div className="d-flex gap-2 justify-content-end mt-3">
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
            <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Eliminando..." : "Eliminar"}
                </Button>
            </div>
        </Modal>
    );
}

const formVacio = {
    nombre: "",
    codigo_interno: "",
    precio: "",
    descripcion: "",
    cantidad_concentracion: "",
    unidad_concentracion: "",
    id_empresa: "",
    id_categoria_producto: "",
    id_clasificacion_producto: "",
    id_presentacion_producto: "",
    id_via_administracion: "",
};

function Productos() {
    const {
        productos,
        empresas,
        categoriasProducto,
        clasificacionesProducto,
        presentacionesProducto,
        viasAdministracion,
        refreshCatalogo,
    } = useCatalogos();

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

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
            nombre: item.nombre,
            codigo_interno: item.codigo_interno,
            precio: item.precio,
            descripcion: item.descripcion,
            cantidad_concentracion: item.cantidad_concentracion,
            unidad_concentracion: item.unidad_concentracion,
            id_empresa: item.id_empresa,
            id_categoria_producto: item.id_categoria_producto,
            id_clasificacion_producto: item.id_clasificacion_producto,
            id_presentacion_producto: item.id_presentacion_producto,
            id_via_administracion: item.id_via_administracion,
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
                const actualizados = productos.map((p) =>
                    p.id === editId ? { ...p, ...form } : p
                );
                refreshCatalogo('productos', actualizados);
            } else {
                const res = await api.post('/productos', form);
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
            const actualizados = productos.filter((p) => p.id !== deleteTarget.id);
            refreshCatalogo('productos', actualizados);
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const columns = ["#", "Nombre", "Código", "Precio", "Categoría", "Empresa", "Acciones"];

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar
                    placeholder="Buscar por nombre, código o empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Nuevo producto
                </Button>
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
                        </tr>
                    )}
                />
            </DataCard>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar producto" : "Nuevo producto"}
                className="modal-lg"
            >
                <ProductoForm
                    form={form}
                    setForm={setForm}
                    empresas={empresas}
                    categoriasProducto={categoriasProducto}
                    clasificacionesProducto={clasificacionesProducto}
                    presentacionesProducto={presentacionesProducto}
                    viasAdministracion={viasAdministracion}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOpen(false)}
                    loading={loading}
                    error={error}
                />
            </Modal>

            <DeleteModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                item={deleteTarget}
            />
        </PageContainer>
    );
}

export default Productos;