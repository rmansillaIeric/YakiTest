import React, { useState } from 'react';


//Tipado del Legajo
type Legajo = {
  id: string,
  legajo: number;
  ieric: string;
  cuit: string;
  razon: string;
  asignacion: string;
  inicio: string;
  fin: string;
  fiscalizacion: string;
  estado: string;
  resultado: string;
  fechaEstado: string;
  inspector: string;
  fechaGirado: string;
  representacion: string;
  imr?: string;
};
//Tipado de los props que recibe el componente
type DataTableProps = {
  grid: Legajo[];
  seleccionarFila: (item: Legajo) => void;

};
//Componente principal de la tabla
const FiscalizacionDataTable: React.FC<DataTableProps> = ({
  grid,
  seleccionarFila,
}) => {
  //Estado para obtener el id de la fila seleccionada
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-black text-sm bg-white">
        <thead>
          <tr className="bg-[#084477] text-white">
            <th className="px-4 py-2 border">Nro de Legajo</th>
            <th className="px-4 py-2 border">IERIC</th>
            <th className="px-4 py-2 border">CUIT</th>
            <th className="px-4 py-2 border">Razón Social</th>
            <th className="px-4 py-2 border">Fecha de Inicio</th>
            <th className="px-4 py-2 border">Fecha Asignado</th>
            <th className="px-4 py-2 border">Fecha de Fin</th>
            <th className="px-4 py-2 border">Estado</th>

          </tr>
        </thead>
        <tbody>
          {grid.map((row) => (
            <tr
              key={row.legajo}
              onClick={() => {
                seleccionarFila(row);
                setSelectedRowId(row.id);
              }}
              className={`cursor-pointer hover:bg-blue-100 ${selectedRowId === row.id ? 'bg-blue-200' : ''}`}
            >
              <td className="px-4 py-2 border text-center">{row.legajo}</td>
              <td className="px-4 py-2 border text-center">{row.ieric}</td>
              <td className="px-4 py-2 border text-center whitespace-nowrap">{row.cuit}</td>
              <td className="px-4 py-2 border text-center whitespace-nowrap">{row.razon}</td>
              <td className="px-4 py-2 border text-center">{row.asignacion}</td>
              <td className="px-4 py-2 border text-center">{row.inicio}</td>
              <td className="px-4 py-2 border text-center">{row.fin}</td>
              <td className="px-4 py-2 border text-center">
                <span className={`inline-block font-bold px-2 py-1 rounded
              ${row.estado === 'Iniciado' ? 'bg-green-100 text-green-800' : ''}
              ${row.estado === 'Cerrado' ? 'bg-gray-200 text-gray-700' : ''}
              ${row.estado === 'Ingresado' ? 'bg-blue-100 text-blue-800' : ''}
              ${row.estado === 'Resuelto' ? 'bg-purple-100 text-purple-800' : ''}
            `}>
                {row.estado}
                </span>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default FiscalizacionDataTable;
