import React, { useState } from "react";
import NavBar from "../ui/NavBar"; 

type LegajoArticulosProps = {
  data: {
    legajoArticulos?: Array<{
      codigo?: string;
      cantidad?: string | number;
    }>;
  } | null;
};

const LegajoArticulos: React.FC<LegajoArticulosProps> = ({ data }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const filteredArticulos = Array.isArray(data?.legajoArticulos)
    ? data.legajoArticulos.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      )
    : [];

  return (
    <>
      <NavBar onSearchChange={handleSearchChange} />

      <div className="overflow-y-auto max-h-[60vh] w-[500px] bg-formulario font-header text-sm text-gray-800 grid grid-cols-[1fr_1fr] box-border">
        {/* Header */}
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Código
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Cantidad
        </div>

        {/* Data */}
        {filteredArticulos.length > 0 ? (
          filteredArticulos.map((item, index) => (
            <React.Fragment key={index}>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.codigo ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.cantidad ?? ""}
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-2 text-center text-gray-500 py-10">
            No hay artículos disponibles.
          </div>
        )}
      </div>
    </>
  );
};

export default LegajoArticulos;
