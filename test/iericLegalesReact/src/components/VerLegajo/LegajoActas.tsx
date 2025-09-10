import React, { useState } from "react";
import NavBar from "../ui/NavBar"; 

type LegajoActasProps = {
  data: {
    actas?: Array<{
      nroActa?: string;
      domicilioObra?: string;
      localidadObra?: string;
      obrerosTotales?: number | string;
      obrerosDeclarados?: number | string;
      obrerosNoDeclarados?: number | string;
    }>;
  } | null;
};

const LegajoActas: React.FC<LegajoActasProps> = ({ data }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const filteredActas = Array.isArray(data?.actas)
    ? data.actas.filter((acta) =>
        Object.values(acta).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      )
    : [];

  return (
    <>
      <NavBar onSearchChange={handleSearchChange} />

      <div className="overflow-y-auto max-h-[60vh] w-[1100px] bg-formulario font-header text-sm text-gray-800 grid grid-cols-[4.7rem_6.5rem_5.5rem_9.3rem_9.5rem_12rem] box-border">
        {/* Header */}
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          N° Acta
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Domicilio
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Localidad
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Obreros totales
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Obreros declarados
        </div>
        <div className="text-center font-semibold border-b border-gray-300 py-2 cursor-default">
          Obreros no declarados
        </div>

    
        {filteredActas.length > 0 ? (
          filteredActas.map((item, index) => (
            <React.Fragment key={index}>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.nroActa ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.domicilioObra ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.localidadObra ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.obrerosTotales ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.obrerosDeclarados ?? ""}
              </div>
              <div className="text-center py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                {item.obrerosNoDeclarados ?? ""}
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-6 text-center text-gray-500 py-10">
            No hay actas disponibles.
          </div>
        )}
      </div>
    </>
  );
};

export default LegajoActas;
