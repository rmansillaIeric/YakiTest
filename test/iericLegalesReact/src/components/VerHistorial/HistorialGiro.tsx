import React, { useState } from "react";
import NavBar from "../ui/NavBar";

type LegajoGirosProps = {
  data: {
    historialGiros?: Array<{
      ubicacionAnterior: string;
      ubicacionActual: string;
      fecha: string;
      usuario: string;
    }>;
  } | null;
};

const HistorialGiro: React.FC<LegajoGirosProps> = ({ data }) => {
  const [searchText, setSearchText] = useState("");
  const filtered = (data?.historialGiros ?? []).filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <>
      <NavBar onSearchChange={setSearchText} />

      <div className="overflow-y-auto max-h-[60vh] w-[full] bg-formulario font-header text-sm text-gray-800 grid grid-cols-[1fr_1fr_1fr_1fr] box-border">
        {/* Cabezal */}
        {["Anterior", "Nuevo", "Fecha", "Usuario"].map(title => (
          <div key={title} className="text-center font-semibold border-b border-gray-300 py-2">
            {title}
          </div>
        ))}

        {/* Filas */}
        {filtered.length > 0 ? (
          filtered.map((item, index) => (
            <React.Fragment key={index}>
              <div className="text-center py-1 border-b">{item.ubicacionAnterior}</div>
              <div className="text-center py-1 border-b">{item.ubicacionActual}</div>
              <div className="text-center py-1 border-b">{item.fecha}</div>
              <div className="text-center py-1 border-b">{item.usuario}</div>
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-4 text-center text-gray-500 py-10">
            Sin historial disponible.
          </div>
        )}
      </div>
    </>
  );
};

export default HistorialGiro;
