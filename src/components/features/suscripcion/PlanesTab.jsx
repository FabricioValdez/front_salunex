import PlanCard from "./PlanCard";

const planes = [
  {
    nombre: "Free",
    precio: 0,
    descripcion: "Prueba gratuita por 20 días",
    features: [
      "Acceso completo por 20 días",
      "Hasta 2 usuarios",
      "Módulos básicos incluidos",
      "Soporte por correo",
    ],
  },
  {
    nombre: "Basic",
    precio: 599,
    descripcion: "Para farmacias pequeñas en crecimiento",
    features: [
      "Todo lo del plan Free",
      "Hasta 5 usuarios",
      "Inventario y Órdenes de compra",
      "Control de calidad",
      "Soporte prioritario",
    ],
  },
  {
    nombre: "Pro",
    precio: 1299,
    descripcion: "Para operaciones farmacéuticas completas",
    features: [
      "Todo lo del plan Basic",
      "Usuarios ilimitados",
      "Todos los módulos incluidos",
      "Dashboard y reportes avanzados",
      "Soporte 24/7",
      "Acceso a nuevos módulos sin costo adicional",
    ],
  },
];

const PlanesTab = () => {
  return (
    <div className="planes-grid">
      {planes.map((plan, i) => (
        <PlanCard
          key={plan.nombre}
          plan={plan}
          recomendado={i === 1}
          esActual={i === 0}
        />
      ))}
    </div>
  );
};

export default PlanesTab;