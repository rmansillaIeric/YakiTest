
import { useEffect, useState } from 'react';
import type { Legajo, LegajoExtendido } from '../../utils/types';
import ShowToast from '.././ui/ShowToast';
import { mapToLegajo } from '../../utils/mappers';
import FiscalizacionBar from './FiscalizacionBar';
import FiscalizacionDataTable from './FiscalizacionDataTable';

type ToastType = 'info' | 'success' | 'warning' | 'error';
function VerFiscalizacion() {
  // Funciones
 
  const seleccionarFila = async (item: Legajo) => {
    console.log('Seleccionar fila', item);

    try {

      //Solicitamos Actas
      const response = await fetch(`https://localhost:44372/v1/Acta/PorLegajo/${item.id}`);
      //Solicitamos Articulos 
      const responseArticulos = await fetch(`https://localhost:44372/v1/LegajoArticulo/ById/${item.id}`);

      //Si ya tenemos actas cargadas, no la volvemos a pedir
      if (item.actas && Array.isArray(item.actas)) {
        setLegajoSeleccionado(item);
        return;
      }
      if (response.status === 404) {
        //no tenemos actas para este legajo
        setLegajoSeleccionado({ ...item, actas: [] });
        return;
      }
      if (!response.ok) throw new Error('No se pudieron obtener actas');

      const actaData = await response.json();
      console.log('Dato obtenido Acta:', actaData);

      const articuloData = await responseArticulos.json();
      console.log('Dato obtenido Articulo:', articuloData);
      const legajoConActa = {
        ...item,
        nroActa: actaData[0]?.nroActa ?? null,
        articulo: actaData[0]?.articulo ?? null,
        actas: Array.isArray(actaData) ? actaData : [],
        legajoArticulos: Array.isArray(articuloData) ? articuloData : [],
        fechaEstado: item.fechaEstado,
        fechaGirado: item.fechaGirado,
      };

      setLegajoSeleccionado(legajoConActa);
    } catch (error) {
      console.error('Error al obtener acta del legajo:', error);
      setLegajoSeleccionado(item);
    }
  };



  // Estados
  const [searchText, setSearchText] = useState('');
  const [legajos, setLegajos] = useState<Legajo[]>([]);
  const [legajoSeleccionado, setLegajoSeleccionado] = useState<LegajoExtendido | null>(null);
  const [Filtrado, setFiltrado] = useState(false);
  const [selectedId, setSelectedId] = useState<Set<string>>(new Set());
  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<string>('');

  const showToast = (message: string, type: ToastType = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setMostrarToast(true);
  };


  //Carga de datos
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    //Obtenemos los legajos 
    fetch('https://localhost:44372/v1/legajos/GetAll?fisca=2')
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
  //Filtro de busqueda
  const filteredData = legajos.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="layout">
      <div className="main-content w-[1282px] h-[719px] flex flex-col bg-white">
        <FiscalizacionBar
          searchText={searchText}
          onSearchTextChange={(text) => setSearchText(text)}
          onBuscarTexto={(texto) => {
            setSearchText(texto);
          }}
          onOpenFilterModal={() => console.log('Abrir filtro')}
          onAttachFiles={() => console.log('Adjuntar archivos')}
        />
        <FiscalizacionDataTable
          grid={filteredData.slice(0, 7)}
          seleccionarFila={seleccionarFila}
        />        
      </div>
      {mostrarToast && (
        <ShowToast
          message={toastMessage}
          type={toastType as ToastType}
          onClose={() => setMostrarToast(false)}
        />
      )}
      
    </div>
  );

}
export default VerFiscalizacion;


