import { useState } from 'react';
import AlertModal from '../ui/AlertModal';

export type Filter = {
  id: number;
  fechaId: string;
  type: string;
  FechaDesde: string;
  FechaHasta: string;
  value: string;
};
//Props que recibe el componente
type Props = {
  onApply: (filters: Filter[]) => void;
  onCancel?: () => void;
};

let nextId = 0;
const DateFilterDropdown: React.FC<Props> = ({ onApply, onCancel }) => {
  //Estado para manejar errores
  const [error, setError] = useState<string | null>(null);
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);

  //Validaciones
  const validarFiltro = (filtro: typeof filters[0]): string | null => {

    const desde = new Date(filtro.FechaDesde);
    const hasta = new Date(filtro.FechaHasta);
    const diferenciaMeses = hasta.getTime() - desde.getTime();
    const diferenciaDias = diferenciaMeses / (1000 * 60 * 60 * 24);

    if (filtro.fechaId === '0') {
      return "Debe seleccionar un tipo de fecha";
    }
    if (!filtro.FechaDesde || !filtro.FechaHasta) {
      return "Debe completar ambas fechas Desde y Hasta";
    }
    if (new Date(filtro.FechaDesde) > new Date(filtro.FechaHasta)) {
      return "La fecha Desde no debe ser mayor a la fecha Hasta";
    }
    const hoy = new Date().toISOString().split("T")[0];
    if (filtro.FechaHasta > hoy) {
      return "La fecha Hasta no debe ser mayor a la fecha Actual";
    }
    if (filtro.FechaDesde > hoy) {
      return "La fecha Desde no debe ser mayor a la fecha Actual";
    }

    if (diferenciaDias > 90) {
      return "El rango de fechas no puede superar los 90 días";
    }
    return null;
  };

  const [filters, setFilters] = useState([
    { id: nextId++, fechaId: '0', type: '', FechaDesde: '', FechaHasta: '' },
  ]);
  const addFilter = () => {
    setFilters([
      ...filters,
      { id: nextId++, fechaId: '', type: '', FechaDesde: '', FechaHasta: '' },
    ]);
  };

  const removeFilter = (id: number) => {
    setFilters(filters.filter((f) => f.id !== id));
  };
  //funcion para actualizar
  const updateFilter = (
    id: number,
    field: 'fechaId' | 'type' | 'FechaDesde' | 'FechaHasta',
    value: string
  ) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      )
    );
  };
  //Mapa para asociar la FechaId 
  const fechaMap: Record<string, string> = {
    "1": "Fecha de fiscalizacion",
    "2": "Fecha de giro",
    "3": "Fecha de estado",
  };
  //Aplicamos el filtro si es valido
  const handleApply = () => {
    for (const filtro of filters) {
      const errorMsg = validarFiltro(filtro);
      if (errorMsg) {
        setMensajeAlerta(errorMsg);
        return;
      }
    }
    setError(null);


    const validFilters = filters
      .filter((f) => f.fechaId && f.FechaDesde && f.FechaHasta)
      .map((f) => ({
        id: f.id,
        fechaId: f.fechaId,
        type: 'Fecha',
        FechaDesde: f.FechaDesde,
        FechaHasta: f.FechaHasta,
        value: `${fechaMap[f.fechaId]}: ${f.FechaDesde} a ${f.FechaHasta}`,
      }));
    console.log("Filtros a aplicar (con fechaId):", validFilters);
    if (validFilters.length > 0) {
      onApply(validFilters);
    }
  };

  return (
    <div className="w-[28rem] bg-white rounded-md space-y-4 z-20">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center space-x-2">
          <select
            className="block w-1/3 pl-3 pr-10 py-2 text-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={filter.fechaId}
            onChange={(e) => updateFilter(filter.id, 'fechaId', e.target.value)}
          >
            <option value="0">Selecciona</option>
            <option value="1">Fecha de fiscalizacion</option>
            <option value="2">Fecha de giro</option>
            <option value="3">Fecha de estado</option>
          </select>
          {/* input para seleccionar la fecha desde */}
          <input
            type="date"
            className="w-1/3 text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            value={filter.FechaDesde}
            onChange={(e) => updateFilter(filter.id, 'FechaDesde', e.target.value)}
          />
          {/* input para seleccionar la fecha hasta */}
          <input
            type="date"
            className="w-1/3 text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            value={filter.FechaHasta}
            onChange={(e) => updateFilter(filter.id, 'FechaHasta', e.target.value)}
          />
          {filters.length > 1 && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => removeFilter(filter.id)}
            >
              <span className="material-icons text-base">close</span>
            </button>
          )}
        </div>
      ))}
      {error && (
        <div className="text-red-600 text-sm pt-2">
          {error}
        </div>
      )}

      {/* filtro */}
      <button
        type="button"
        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        onClick={addFilter}
      >
      </button>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-1.5 rounded text-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
      {mensajeAlerta && (
        <AlertModal mensaje={mensajeAlerta} onCerrar={() => setMensajeAlerta(null)} />
      )}
    </div>
  );
};

export default DateFilterDropdown;
