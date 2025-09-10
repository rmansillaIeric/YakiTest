import React, { useState } from 'react';
import Checkbox from '../ui/Checkbox';


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
  modificar: () => void;
  giro: () => void;
  filtrar: () => void;
  detalle: () => void;
  historial: () => void;
  selectedId: Set<string>;
  setSelectId: React.Dispatch<React.SetStateAction<Set<string>>>;

};
//Componente principal de la tabla
const DataTable: React.FC<DataTableProps> = ({
  grid,
  seleccionarFila,
  modificar,
  giro,
  detalle,
  historial,
  selectedId,
  setSelectId,
}) => {
  //Estado para obtener el id de la fila seleccionada
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  //const [selectedId, setSelectedId] = useState<Set<string>>(new Set());

  const allSelected = grid.length > 0 && grid.every(row => selectedId.has(row.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(grid.map(row => row.id));
      setSelectId(allIds);
    } else {
      setSelectId(new Set());
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelectedId = new Set(selectedId);
    if (checked) {
      newSelectedId.add(id);
    } else {
      newSelectedId.delete(id);
    }
    setSelectId(newSelectedId);
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-black text-sm bg-white">
        <thead>
          <tr className="bg-[#084477] text-white">
            <th className="px-2 py-2 border w-10 text.center">
              <Checkbox checked={allSelected} onChange={handleSelectAll} />
            </th>
            <th className="px-4 py-2 border">Nro de Legajo</th>
            <th className="px-4 py-2 border">IERIC</th>
            <th className="px-4 py-2 border">CUIT</th>
            <th className="px-4 py-2 border">Razón Social</th>
            <th className="px-4 py-2 border">Fecha de Inicio</th>
            <th className="px-4 py-2 border">Fecha Asignado</th>
            <th className="px-4 py-2 border">Fecha de Fin</th>
            <th className="px-4 py-2 border">Estado</th>
            <th className="px-4 py-2 border min-w-[120px] text-center">Acciones</th>
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
              <td className="px-2 py-2 border text-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedId.has(row.id)}
                  onChange={(checked) => handleCheckboxChange(row.id, checked)}
                />
              </td>
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
              <td className="px-2 py-2 border text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2 text-gray-400 hover:text-blue-600">
                  <button onClick={async () => {
                    await seleccionarFila(row);
                    modificar();
                  }}
                    title="Cambio de estado"
                  >
                    <span className="material-icons">sync_alt</span>
                  </button>
                  <button onClick={async () => {
                    await seleccionarFila(row);
                    giro();
                  }}
                    title="Girado"
                  >
                    <span className="material-icons">send</span>
                  </button>
                  <button onClick={async () => {
                    await seleccionarFila(row);
                    detalle();
                  }}
                    title="Visualización"
                  >
                    <span className="material-icons">visibility</span>
                  </button>

                  <button onClick={async () => {
                    await seleccionarFila(row);
                    historial();
                  }}
                    title="Historial"
                  >
                    <span className="material-icons">history</span>
                  </button>
                </div>
              </td>
              <td className="border"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default DataTable;
