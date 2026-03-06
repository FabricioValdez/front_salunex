import { useState, useContext } from "react";
import InventoryContext from "../context/InventoryContext";

import "../styles/Inventario.css";

import SearchBar from "../components/ui/SearchBar";
import PageContainer from "../components/ui/PageContainer";
import DataCard from "../components/ui/DataCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

import Table from "../components/ui/Table/Table";

import InventarioForm from "../components/features/inventario/InventarioForm";
import InventarioRow from "../components/features/inventario/InventarioRow";

function Inventario() {

  const {
    inventario,
    agregarMedicamento,
    eliminarMedicamento,
    actualizarMedicamento
  } = useContext(InventoryContext);

  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");

  const [editData, setEditData] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    "Nombre",
    "Lote",
    "Fecha Exp.",
    "Cantidad",
    "Ubicación",
    "Acciones"
  ];

  // AGREGAR / EDITAR
  const handleAddMedicamento = (medicamento) => {

    if (editData) {

      actualizarMedicamento({
        ...editData,
        ...medicamento
      });

      setEditData(null);

    } else {

      agregarMedicamento(medicamento);

    }

    setOpenModal(false);
  };

  // EDITAR
  const handleEdit = (item) => {

    setEditData(item);
    setOpenModal(true);

  };

  // CLICK ELIMINAR
  const handleDeleteClick = (item) => {

    setDeleteId(item.id);
    setConfirmDelete(true);

  };

  // CONFIRMAR ELIMINACIÓN
  const confirmDeleteMedicamento = () => {

    eliminarMedicamento(deleteId);

    setConfirmDelete(false);
    setDeleteId(null);
  };

  // BUSCADOR
  const filteredInventario = inventario.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.lote.toLowerCase().includes(search.toLowerCase()) ||
    item.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  const medicamentoEliminar = inventario.find(
    (m) => m.id === deleteId
  );

  return (
    <PageContainer>

      {/* HEADER */}
      <div className="page-header">
        <h1>Mercancía e inventario diario</h1>
        <p>
          Gestione las entradas diarias de existencias, haga seguimiento
          de fechas de vencimiento y monitoree niveles en tiempo real.
        </p>
      </div>

      {/* ACCIONES */}
      <div className="page-actions">

        <SearchBar
          placeholder="Buscar medicamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="actions-right">

          <Button variant="secondary">
            Exportar
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setEditData(null);
              setOpenModal(true);
            }}
          >
            + Agregar medicamento
          </Button>

        </div>

      </div>

      {/* TABLA */}
      <DataCard>

        <Table
          columns={columns}
          data={filteredInventario}
          renderRow={(item) => (

            <InventarioRow
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />

          )}
        />

      </DataCard>

      {/* MODAL AGREGAR / EDITAR */}
      <Modal
        isOpen={openModal}
        title={editData ? "Editar medicamento" : "Agregar medicamento"}
        onClose={() => setOpenModal(false)}
      >

        <InventarioForm
          onSubmit={handleAddMedicamento}
          initialData={editData}
        />

      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal
        isOpen={confirmDelete}
        title="Eliminar medicamento"
        onClose={() => setConfirmDelete(false)}
      >

        <p>
          Se eliminará el medicamento
          <strong> {medicamentoEliminar?.nombre} </strong>
          del inventario.
        </p>

        <p style={{ marginTop: "8px" }}>
          ¿Estás seguro de que deseas eliminarlo?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px"
          }}
        >

          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={confirmDeleteMedicamento}
          >
            Eliminar
          </Button>

        </div>

      </Modal>

    </PageContainer>
  );
}

export default Inventario;