import "./DataCard.css";

function DataCard({ children }) {
  return (
    <div className="data-card">
      {children}
    </div>
  );
}

export default DataCard;