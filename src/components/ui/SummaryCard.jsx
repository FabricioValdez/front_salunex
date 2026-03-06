import "./SummaryCard.css";

const SummaryCard = ({ title, value, icon, variant = "blue" }) => {
  return (
    <div className={`summary-card ${variant}`}>
      
      <div className="card-info">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

      <div className="card-icon">
        {icon}
      </div>

    </div>
  );
};

export default SummaryCard;