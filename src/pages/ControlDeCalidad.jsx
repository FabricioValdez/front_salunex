import "../styles/ControlCalidad.css";

import { Trash2, AlertCircle, Clock, DollarSign } from "lucide-react";

import PageContainer from "../components/ui/PageContainer";
import DataCard from "../components/ui/DataCard";
import Button from "../components/ui/Button";
import SummaryCard from "../components/ui/SummaryCard";

import { useContext, useMemo } from "react";

import InventoryContext from "../context/InventoryContext";

const ControlCalidad = () => {

  const { inventario } = useContext(InventoryContext);

  const hoy = new Date();

  const { expirados, proximos } = useMemo(() => {

    const expirados = [];
    const proximos = [];

    inventario.forEach((med) => {

      const fecha = new Date(med.fechaExp);

      const diff = Math.ceil(
        (fecha - hoy) / (1000 * 60 * 60 * 24)
      );

      if (diff < 0) {

        expirados.push({
          ...med,
          dias: diff
        });

      }

      if (diff >= 0 && diff <= 90) {

        proximos.push({
          ...med,
          dias: diff
        });

      }

    });

    return { expirados, proximos };

  }, [inventario]);



  /* =========================
     NIVEL DE RIESGO
  ========================= */

  const getRisk = (dias) => {

    if (dias <= 15) return "alto";
    if (dias <= 45) return "medio";
    return "bajo";

  };



  return (
    <PageContainer>

      {/* HEADER */}

      <div className="dashboard-title">
        <h1>Control de calidad y caducidad</h1>

        <p>
          Revisar los lotes marcados, gestionar la fecha de vencimiento e inspeccionar
          el estado del empaque para garantizar el cumplimiento.
        </p>
      </div>



      {/* RESUMEN */}

      <div className="summary-cards">

        <SummaryCard
          title="Total expirados"
          value={`${expirados.length} artículos`}
          icon={<AlertCircle size={26} />}
          variant="red"
        />

        <SummaryCard
          title="Pronto a expirar"
          value={`${proximos.length} artículos`}
          icon={<Clock size={26} />}
          variant="yellow"
        />

        <SummaryCard
          title="Pérdida potencial"
          value={`$${expirados.length * 2500}`}
          icon={<DollarSign size={26} />}
          variant="blue"
        />

      </div>

      {/* EXPIRADOS */}

      <DataCard className="danger-section">

        <div className="section-header">

          <div className="title">
            <AlertCircle size={18} color="#ef4444" />
            <h3>Medicamentos expirados (Crítico)</h3>
          </div>

          <Button variant="danger" icon={Trash2}>
            Retirar y desechar
          </Button>

        </div>



        <table>

          <thead>

            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Lote</th>
              <th>Fecha caducidad</th>
              <th>Estatus</th>
              <th>Acción</th>
            </tr>

          </thead>

          <tbody>

            {expirados.map((med) => (

              <tr key={med.id}>

                <td>
                  <input type="checkbox" />
                </td>

                <td>
                  <strong>{med.nombre}</strong>
                  <span>{med.ubicacion}</span>
                </td>

                <td>#{med.lote}</td>

                <td>{med.fechaExp}</td>

                <td className="expired">
                  Expirado ({Math.abs(med.dias)} días)
                </td>

                <td>
                  <Trash2 size={16} />
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </DataCard>



      {/* PROXIMOS */}

      <DataCard className="warning-section">

        <div className="section-header">

          <div className="title">
            <Clock size={18} color="#f59e0b" />
            <h3>Próximos a expirar (Sig 30-90 días)</h3>
          </div>

          <Button variant="warning" icon={Trash2}>
            Retirar del almacén
          </Button>

        </div>



        <table>

          <thead>

            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Lote</th>
              <th>Días restantes</th>
              <th>Nivel de riesgo</th>
              <th>Acción</th>
            </tr>

          </thead>

          <tbody>

            {proximos.map((med) => {

              const riesgo = getRisk(med.dias);

              return (

                <tr key={med.id}>

                  <td>
                    <input type="checkbox" />
                  </td>

                  <td>
                    <strong>{med.nombre}</strong>
                    <span>{med.ubicacion}</span>
                  </td>

                  <td>#{med.lote}</td>

                  <td className="days">
                    {med.dias} días restantes
                  </td>

                  <td>

                    <span className={`badge ${riesgo}`}>
                      Riesgo {riesgo}
                    </span>

                  </td>

                  <td>
                    <Trash2 size={16} />
                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </DataCard>

    </PageContainer>
  );
};

export default ControlDeCalidad;
