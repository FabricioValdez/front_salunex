import { SlidersHorizontal } from "lucide-react";
import "./FilterButton.css";

const FilterButton = ({ onClick }) => {
  return (
    <button className="filter-btn" onClick={onClick}>
      <SlidersHorizontal size={16} />
      Filtrar
    </button>
  );
};

export default FilterButton;
