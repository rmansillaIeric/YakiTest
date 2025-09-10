import { useState } from 'react';
import FilterDropdown from './FilterDropdown';
import DateFilterDropdown from './DateFilterDropDown';
import type { GiroLegal } from '../../utils/types';


type filter = {
  type: string;
  value: string;
  FechaDesde?: string;
  FechaHasta?: string;
  fechaId?: string;
};
type FilterBarProps = {
  onOpenFilterModal?: () => void;
  onAttachFiles?: () => void;
  onFiltrarPorIeric?: (ieric: string) => void;
  onFiltrarPorCuit?: (cuit: string) => void;
  onFiltrarPorNumeroLegajo?: (legajo: string) => void;
  onFiltrarPorEstado?: (estado: string) => void;
  onFiltrarPorGiro?: (giro: string) => void;
  onActualizarGrilla?: (data: any[]) => void;
  onBuscarTexto?: (texto: string) => void;
  onFiltrarPorFecha?: (FechaDesde: string, FechaHasta: string, FechaId: string) => void;
  searchText: string;
  onSearchTextChange: (texto: string) => void;
  girosLegales?: GiroLegal[];
  onResultadoFiltroFecha?: (resultadoVacio: boolean) => void;
};

const FilterBar: React.FC<FilterBarProps> = ({
  onAttachFiles,
  onFiltrarPorIeric,
  onFiltrarPorCuit,
  onFiltrarPorNumeroLegajo,
  onFiltrarPorEstado,
  onFiltrarPorGiro,
  onActualizarGrilla,
  onBuscarTexto,
  onFiltrarPorFecha,
  searchText,
  onSearchTextChange,
  girosLegales,
}) => {
  const [appliedFilters, setAppliedFilters] = useState<filter[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => setShowSearch(!showSearch);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showToastVisible, setShowToastVisible] = useState(false);

  const handleFiltrarPorFechas = (newFilters: filter[]) => {
    setAppliedFilters((prev) => {
      const sinFecha = prev.filter((f) => f.type !== 'Fecha');
      return [...sinFecha, ...newFilters];
    });
    if (onFiltrarPorFecha) {
      newFilters.forEach((f) => {
        console.log(`Ejecutando onFiltrarPorFecha con FechaDesde=${f.FechaDesde} y FechaHasta=${f.FechaHasta}`);
        onFiltrarPorFecha(f.FechaDesde || '', f.FechaHasta || '', f.fechaId?.toString() || '');
      });
    }
  };

  // si el string esta vacio  o contiene solo espacios, la funcion se detiene
  const handleFiltrarPorIeric = (ieric: string) => {
    if (!ieric.trim()) return;

    // aseguramos tener un filtro de tipo IERIC
    setAppliedFilters((prev: filter[]) => {
      const sinIeric = prev.filter((f) => f.type !== 'IERIC');
      return [...sinIeric, { type: 'IERIC', value: `IERIC: ${ieric}` }];
    });

    // Llamado al callback para filtrar la grilla con de valor ieric
    if (onFiltrarPorIeric) {
      onFiltrarPorIeric(ieric);
    }
  };
  const handleFiltrarPorCUIT = (cuit: string) => {
    if (!cuit.trim()) return;
    // aseguramos tener un filtro de tipo CUIT
    setAppliedFilters((prev: filter[]) => {
      const sinCuit = prev.filter((f) => f.type !== 'CUIT');
      return [...sinCuit, { type: 'CUIT', value: `CUIT: ${cuit}` }];
    });
    // Llamado al callback para filtrar la grilla con de valor ieric
    if (onFiltrarPorCuit) {
      onFiltrarPorCuit(cuit);
    }
  };
  const handleFiltrarPorNumeroLegajo = (legajo: string) => {
    if (!legajo.trim()) return;

    //Aseguramos tener un filtro de tipo Legajo
    setAppliedFilters((prev: filter[]) => {
      const sinLegajo = prev.filter((f) => f.type !== 'Legajo');
      return [...sinLegajo, { type: 'Legajo', value: `Legajo: ${legajo}` }];
    });

    //Llamado al callback para filtrar la grilla 
    if (onFiltrarPorNumeroLegajo) {
      onFiltrarPorNumeroLegajo(legajo);
    }
  };

  const handleFiltrarPorEstado = (estado: string) => {
    if (!estado.trim() || estado === 'Todos') return;

    setAppliedFilters((prev: filter[]) => {
      const sinEstado = prev.filter((f) => f.type !== 'Estado');
      return [...sinEstado, { type: 'Estado', value: `Estado: ${estado}` }];
    });

    if (onFiltrarPorEstado) {
      onFiltrarPorEstado(estado);
    }
  };

  const handleFiltrarPorGiro = async (giro: string) => {
    if (!giro.trim() || giro === 'Todos') return;
    //Actualizamos el estado del filtro aplicado
    setAppliedFilters((prev: filter[]) => {
      const sinGiro = prev.filter((f) => f.type !== 'Giro');
      //Obtenemos el Id de giro 
      const [idGiro] = giro.split('-');
      //Buscamos la descripcion del giro
      const descripcionGiro = girosLegales?.find((g) => g.id === idGiro)?.descripcion || 'Giro desconocido';
      return [...sinGiro, { type: 'Giro', value: `Giro: ${descripcionGiro}` }];
    });

    if (onFiltrarPorGiro) {
      onFiltrarPorGiro(giro);
    }
    try {
      const [ubicacion, representacion] = giro.split('-');

      let url = `https://localhost:44372/v1/legajos/Filtrar?Ubicacion=${ubicacion}`;
      if (representacion) url += `&Representacion=${representacion}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener datos filtrados');

      const data = await response.json();

      // Este callback notifica al componente padre
      onActualizarGrilla?.(data);
    } catch (error) {
      console.error('Error al filtrar por giro:', error);
    }
  };
  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setAppliedFilters([]);
    // Avisamos al componente padre para remover el filtro de la grilla

  // Función  para ejecutar callbacks si existen
  const limpiarFiltro = (callback?: (arg: string) => void) => {
    if (callback) callback('');
  };

  limpiarFiltro(onFiltrarPorIeric);
  limpiarFiltro(onFiltrarPorCuit);
  limpiarFiltro(onFiltrarPorNumeroLegajo);
  limpiarFiltro(onFiltrarPorEstado);
  limpiarFiltro(onFiltrarPorGiro);
  };  
  return (
    <div className="flex flex-col space-y-2 mb-0 py-3 px-2 bg-white">
      {/* Mensaje de Filtro sin resultados */}
      {showToastVisible && (
        <div
          id="toast-container"
          className="fixed top-4 right-4 z-50"
        >
          <div className="flex items-center gap-3 p-4 rounded-lg shadow-lg text-white bg-yellow-500 transform transition-transform duration-300">
            <span className="material-icons text-xl">warning</span>
            <span className="font-medium">No se encontraron registros en el rango seleccionado.</span>
            <button
              className="ml-auto text-white hover:text-gray-200"
              onClick={() => setShowToastVisible(false)}
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mb-4">
        <div className="nav-controls">
          {showSearch ? (
            <>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <span className="material-icons cursor-pointer ml-2" onClick={toggleSearch}>close</span>
            </>
          ) : (
            <span className="material-icons cursor-pointer" onClick={toggleSearch}>search</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6 overflow-x-visible">
        <FilterDropdown
          onFiltrarPorIeric={handleFiltrarPorIeric}
          onFiltrarPorCuit={handleFiltrarPorCUIT}
          onFiltrarPorNumeroLegajo={handleFiltrarPorNumeroLegajo}
          onFiltrarPorEstado={handleFiltrarPorEstado}
          onFiltrarPorGiro={handleFiltrarPorGiro}
          onLimpiarFiltros={limpiarFiltros}
          girosLegales={girosLegales}
        />
        <div className="h-10 border-l border-gray-300"></div>
        <div className="relative">
          {/* Botón para mostrar/ocultar el DateFilterDropdown */}
          <button
            onClick={() => setShowDateDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <span>Fecha</span>
            <span className="material-icons text-lg">expand_more</span>
          </button>

          {/* Dropdown Date */}
          {showDateDropdown && (
            <div className="absolute z-20 mt-2 w-[30rem] bg-white border border-gray-300 rounded-md shadow-lg p-4">
              <DateFilterDropdown
                onApply={(newFilters) => {
                  setAppliedFilters((prev) => {
                    const sinFecha = prev.filter((f) => f.type !== 'Fecha');
                    return [...sinFecha, ...newFilters];
                  });
                  handleFiltrarPorFechas(newFilters);
                  
                  setShowDateDropdown(false);
                }}
                onCancel={() => setShowDateDropdown(false)}
              />
            </div>
          )}
        </div>
        <div className="h-10 border-l border-gray-300"></div>
        <div className="relative group">
          <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="py-1" role="menu">
              <button
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-100 w-full text-left"
                role="menuitem"
                onClick={onAttachFiles}
              >
                <span className="material-icons text-lg">attach_file</span>
                <span>Adjuntar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*Filtros aplicados y boton limpiar */}
      {appliedFilters.length > 0 && (
        <div className="flex items-center space-x-4 text-sm text-gray-700">
          <span className="font-semibold">Filtros aplicados:</span>
          {appliedFilters.map((filter, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
            >
               {filter.value} 
            </span>
          ))}
          <button
            onClick={limpiarFiltros}
            className="ml-auto text-blue-600 hover:underline text-sm font-medium"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
