import { useEffect, useState } from 'react';
import '.././styles/globals.css';
import '.././styles/Fiscalizacion.css';
import DataTable from './Legajos/DataTable';
import DetalleLegajo from './Legajos/DetalleLegajo';
import LegajoGiro from './Legajos/LegajoGiro';
import FilterBar from './Filter/FilterBar';
import VerLegajo from './VerLegajo/VerLegajo';
import LegajoActas from './VerLegajo/LegajoActas';
import LegajoArticulos from './VerLegajo/LegajoArticulos';
import VerHistorial from './VerHistorial/VerHistorial';
import HistorialEstado from './VerHistorial/HistorialEstado';
import HistorialGiro from './VerHistorial/HistorialGiro';
import type { GiroLegal } from '../utils/types';
import type { Legajo, FiltroLegajo } from '../utils/types';
import type { Filter } from './Filter/DateFilterDropDown';
import DateFilterDropdown from './Filter/DateFilterDropDown';
import LegajoEnvio from './Legajos/LegajoEnvio';
import ShowToast from './ui/ShowToast';
import { mapToLegajo } from '../utils/mappers';
import { useSeleccionarFila } from '../hooks/SeleccionarFila';
import { ActualizarGiro } from '../hooks/ActualizarGiro';
import EstadoLegajoModal from './Legajos/LegajoEstadoHistorial';

type ToastType = 'info' | 'success' | 'warning' | 'error';

function Fiscalizacion() {
  // Funciones
  const {
    legajoSeleccionado,
    setLegajoSeleccionado,
    seleccionarFila,
  } = useSeleccionarFila();

  const legajoFiltro = async (params: URLSearchParams) => {
    const url = `https://localhost:44372/v1/legajos/Filtrar?${params.toString()}`;
    console.log("URL generada:", url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener legajos');

      const data: Legajo[] = await response.json();
      const legajosFormateados = data.map(mapToLegajo);

      setLegajos(legajosFormateados);

    } catch (error) {
      console.error('Error al obtener legajos:', error);
    }
  };
  const handleEnviar = () => {
    if (selectedId.size === 0) return;
    setMostrarEnvio(true);
  }
  const handleEnviarLegajo = async () => {
    try {
      const response = await fetch('https://localhost:44372/v1/legajos/GirarMasivoALegales', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legajosId: Array.from(selectedId) }),
      });
      showToast(`Enviando ${selectedId.size} legajo${selectedId.size > 1 ? 's' : ''} a ${destino}...`, 'info');
      console.log("Respuesta del fetch:", response);
      if (response.ok) {
        const destinoDisplay = destino === 'Legales' ? 'Legales' : destino;
        setTimeout(() => {
          showToast(`¡Se enviaron ${selectedId.size} legajo${selectedId.size > 0 ? 's' : ''} a ${destinoDisplay} exitosamente!`, 'success');
        }, 2000);
        //limpiamos el checkbox
        limpiarSeleccion();
      } else {
        showToast('Error al enviar los legajos.', 'error');
      }
    } catch (error) {
      showToast('Error de conexión al enviar los legajos.', 'error');
    }
  };

  //Funcion para recibir el objeto filtro 
  const filtrarLegajos = async (filtro: FiltroLegajo) => {

    //instancia de URLSearchParams para crear cadenas de strings  
    const params = new URLSearchParams();
    //iteracion sobre las propiedades(key) y sus valores(value) del objeto filtro
    for (const [key, value] of Object.entries(filtro)) {
      //verifica que value no sea undefined, null 
      if (typeof value === 'string' && value.trim() !== '') {
        params.append(key, value);
      }
    }
    await legajoFiltro(params);
  };
  const filtrarPorFechas = async (filters: Filter[]) => {
    if (!filters || filters.length === 0) {
      console.log('No hay filtros de fechas para aplicar');
      return;
    }
    const { fechaId, FechaDesde, FechaHasta } = filters[0];
    if (!fechaId || !FechaDesde || !FechaHasta) return;

    const params = new URLSearchParams();
    params.set('FechaDesde', `${FechaDesde}T00:00:00`);
    params.set('FechaHasta', `${FechaHasta}T23:59:59`);
    params.set('FechaId', fechaId);

    if (legajos.length === 0) {
      setMostrarToast(true);
      setTimeout(() => setMostrarToastFecha(false), 2500);
      return;
    }
    setFiltrado(true);

    await legajoFiltro(params);
  };
  //Mostramos el modal para el cambio de estado
  const modificar = () => {
    setMostrarEstado(true);
  };
  const filtrar = () => console.log('Filtrar');
  //Funcion para abrir el detalle del legajo
  const detalle = () => {
    setMostrarDetalle(true);
  };
  const historial = () => {
    setMostrarHistorial(true);
  };
  // Estados
  const [searchText, setSearchText] = useState('');
  const [legajos, setLegajos] = useState<Legajo[]>([]);
  //const [legajoSeleccionado, setLegajoSeleccionado] = useState<LegajoExtendido | null>(null);
  const [mostrarEstado, setMostrarEstado] = useState(false);
  const [mostrarGiro, setMostrarGiro] = useState(false);
  const [mostrarFiltroFecha, setMostrarFiltroFecha] = useState(false);
  const [Filtrado, setFiltrado] = useState(false);
  const [selectedId, setSelectedId] = useState<Set<string>>(new Set());
  const [mostrarEnvio, setMostrarEnvio] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<string>('info');
  const [mostrarToastFecha, setMostrarToastFecha] = useState(false);
  const destino = 'Legales';
  const { onGiroActualizado } = ActualizarGiro({
    setLegajos,
    setLegajoSeleccionado,
    legajoSeleccionado
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setMostrarToast(true);
  };

  const girosLegales: GiroLegal[] = [
    //Listado de giros posibles  
    { id: "2", descripcion: "IMR" },
    { id: "3", descripcion: "Fiscalización" },
    { id: "4", descripcion: "Legales" },
    { id: "5", descripcion: "Representación" },
  ];

  const limpiarSeleccion = () => {
    setSelectedId(new Set());
    setMostrarEnvio(false);
  };
  //Carga de datos
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    //Obtenemos los legajos 
    fetch('https://localhost:44372/v1/legajos/GetAll')
      .then((response) => {
        if (!response.ok) throw new Error('Error en la data');
        return response.json();
      })
      .then((data) => {
        const legajosFormateados = data.map(mapToLegajo);
        setLegajos(legajosFormateados);
      })
      .catch((error) => {
        console.error('Error al obtener los legajos:', error);
      });
  }, []);

  useEffect(() => {
    // Mostramos el toast
    if (legajos.length === 0 && Filtrado) {
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 2500);
      setFiltrado(false);
    }
  }, [legajos]);

  const abrirGiro = () => {
    setMostrarGiro(true);
  }
  //Filtro de busqueda
  const filteredData = legajos.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="layout">
      <div className="main-content w-[1282px] h-[719px] flex flex-col bg-white">
        <FilterBar
          searchText={searchText}
          onSearchTextChange={(text) => setSearchText(text)}
          onBuscarTexto={(texto) => {
            setSearchText(texto);
          }}
          onOpenFilterModal={() => console.log('Abrir filtro')}
          onAttachFiles={() => console.log('Adjuntar archivos')}
          onFiltrarPorIeric={(ieric) => filtrarLegajos({ NroIeric: ieric })}
          onFiltrarPorCuit={(cuit) => filtrarLegajos({ CUIT: cuit })}
          onFiltrarPorEstado={(estado) => filtrarLegajos({ EstadoId: estado })}
          onFiltrarPorNumeroLegajo={(codigo) => filtrarLegajos({ CodigoLegajo: codigo })}
          onFiltrarPorFecha={(desde, hasta, fechaId) =>
            filtrarPorFechas([{
              id: Number(fechaId),
              type: 'Fecha',
              value: `Desde: ${desde} Hasta: ${hasta}`,
              FechaDesde: desde,
              FechaHasta: hasta,
              fechaId: fechaId,
            }])
          }
          onResultadoFiltroFecha={(vacio) => {
            if (vacio) {
              setMostrarToast(true);
              setTimeout(() => setMostrarToast(false), 2500);
            }
          }}
          onActualizarGrilla={(data) => {
            const legajosFormateados = data.map(mapToLegajo);
            setLegajos(legajosFormateados);
          }}
          girosLegales={girosLegales}
        />
        {mostrarFiltroFecha && (
          <DateFilterDropdown
            onApply={(filters) => {
              filtrarPorFechas(filters);
              setMostrarFiltroFecha(false);
            }}
            onCancel={() => setMostrarFiltroFecha(false)}
          />
        )
        }
        <DataTable
          grid={filteredData.slice(0, 7)}
          seleccionarFila={seleccionarFila}
          modificar={modificar}
          giro={abrirGiro}
          filtrar={filtrar}
          detalle={detalle}
          historial={historial}
          selectedId={selectedId}
          setSelectId={setSelectedId}
        />
        {mostrarDetalle && (
          <VerLegajo
            onClose={() => setMostrarDetalle(false)}
            initialTab='detalle'
            legajoNumero={legajoSeleccionado?.legajo}
            DetalleLegajo={
              <DetalleLegajo
                open={mostrarDetalle}
                data={legajoSeleccionado}
                onClose={() => setMostrarDetalle(false)}
                onActas={() => console.log('Ver Actas')}
                onArticulos={() => console.log('Ver Artículos')}
              />
            }
            LegajoActas={
              <LegajoActas
                data={legajoSeleccionado}
              />
            }
            LegajoArticulos={
              <LegajoArticulos
                data={legajoSeleccionado}
              />
            }
          />
        )}
        {/* Mostrar Historial */}
        {mostrarHistorial && (
          <VerHistorial
            onClose={() => setMostrarHistorial(false)}
            initialTab='estados'
            legajoNumero={legajoSeleccionado?.legajo}
            HistorialEstado={<HistorialEstado
              data={legajoSeleccionado} />}
            HistorialGiro={<HistorialGiro
              data={legajoSeleccionado} />}
          />
        )}
   

        {mostrarEstado && (
          <EstadoLegajoModal
            legajoSeleccionado={legajoSeleccionado}
            setMostrarEstado={setMostrarEstado}
            setLegajos={setLegajos}
            setLegajoSeleccionado={setLegajoSeleccionado}
          />
        )}


        {mostrarGiro && (() => {
          const giroLegalEncontrado = girosLegales.find(
            g => g.descripcion === legajoSeleccionado?.giro
          );
          return (
            <LegajoGiro
              open={mostrarGiro}
              data={{
                id: legajoSeleccionado?.id,
                legajo: legajoSeleccionado?.legajo,
                idGiro: giroLegalEncontrado?.id,
                giro: legajoSeleccionado?.giro,
                representacionId: legajoSeleccionado?.representacionId,
                representacionNombre: legajoSeleccionado?.representacion,
              }}
              onClose={() => setMostrarGiro(false)}
              onGiroActualizado={onGiroActualizado}
              girosLegales={girosLegales}
            />
          );
        })()}
        {mostrarEnvio && (
          <LegajoEnvio
            selectId={Array.from(selectedId)}
            onClose={limpiarSeleccion}
            onConfirm={async () => {
              await handleEnviarLegajo();
              console.log("Confirmar envío de legajos:", Array.from(selectedId));
              setMostrarEnvio(false);
            }}
          />
        )}

        <div className="flex items-center gap-4 mt-4 ml-4">
          <button
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedId.size === 0}
            id="sendButton"
            onClick={handleEnviar}
          >
            Enviar
          </button>

          <span className="text-sm text-[var(--text-secondary)]">
            Mostrando 1 a 5 de {filteredData.length} resultados
          </span>
        </div>
      </div>

      {mostrarToast && (
        <ShowToast
          message={toastMessage}
          type={toastType as ToastType}
          onClose={() => setMostrarToast(false)}
        />
      )}

      {mostrarToastFecha && (
        <ShowToast
          message={
            <div className="flex items-center gap-2">
              <span className="material-icons text-xl">warning</span>
              <span className="font-medium">No se encontraron registros en el rango seleccionado.</span>
            </div>
          }
          type="warning"
          onClose={() => setMostrarToastFecha(false)}
        />
      )}
    </div>
  );

}
export default Fiscalizacion;


