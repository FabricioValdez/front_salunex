import { Search } from "lucide-react";
import "../ui/SearchBar.css";

function SearchBar({ 
  placeholder = "Buscar...", 
  value, 
  onChange,
  className = ""
}) {
  return (
    <div className={`search-box ${className}`}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar;
