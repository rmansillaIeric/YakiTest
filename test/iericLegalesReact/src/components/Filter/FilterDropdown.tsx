import React, { useState, useRef, useEffect } from 'react';
import type { GiroLegal } from '../../utils/types';

type FilterDropDownProps = {
    onFiltrarPorIeric?: (ieric: string) => void;
    onFiltrarPorCuit?: (cuit: string) => void;
    onFiltrarPorEstado?: (estado: string) => void;
    onFiltrarPorNumeroLegajo?: (codigoLegajo: string) => void;
    onFiltrarPorGiro?: (giro: string) => void;
    onLimpiarFiltros?: () => void;
    girosLegales?: GiroLegal[];

}

const FilterDropdown: React.FC<FilterDropDownProps> = ({ onFiltrarPorIeric, onFiltrarPorCuit, onFiltrarPorEstado, onFiltrarPorGiro, onFiltrarPorNumeroLegajo, onLimpiarFiltros, girosLegales = [] }) => {
    const [open, setOpen] = useState(false);
    const [cuit, setCuit] = useState('');
    const [ieric, setIeric] = useState('');
    const [legajo, setLegajo] = useState('');
    const [estado, setEstado] = useState('Todos');
    const [giro, setGiro] = useState('Todos');
    const ref = useRef<HTMLDivElement>(null);
    const [estadosFiltro, setEstadosFiltro] = useState<{ id: string; nombre: string }[]>([]);
    //const [girosFiltro, setGirosFiltro] = useState<{ id: string; descripcion: string }[]>([]);
    const [seleccionarGiro, setSeleccionarGiro] = useState<string>('Todos');
    //Estados de representacion
    const [mostrarSelectRepresentacion, setMostrarSelectRepresentacion] = useState(false);
    const [representaciones, setRepresentaciones] = useState<{ id: string; nombre: string }[]>([]);
    const [representacionSeleccionada, setRepresentacionSeleccionada] = useState('');

    //Cuando el usuario cambia la selección en el dropdown
    const handleGiroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectId = e.target.value;
        setSeleccionarGiro(selectId);

        const giroSeleccionado = girosLegales.find(g => g.id === selectId);
        const descripcion = giroSeleccionado?.descripcion || '';
        setMostrarSelectRepresentacion(descripcion === 'Representación');

        if (descripcion !== 'Representación') {
            setRepresentacionSeleccionada('');
        }

    };
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                const res = await fetch("https://localhost:44372/v1/legajos/GetEstados");
                if (!res.ok) throw new Error("Error al cargar estados");
                const json = await res.json();
                setEstadosFiltro(json);
            } catch (error) {
                console.error("Error cargando estados:", error);
            }
        };

        fetchEstados();
    }, []);

    useEffect(() => {
        if (!mostrarSelectRepresentacion) return;

        const fetchRepresentaciones = async () => {
            try {
                const res = await fetch('https://localhost:44372/v1/Representacion/get-representaciones');
                if (!res.ok) throw new Error('Error al cargar representaciones');
                const json = await res.json();
                const datos = json.map((r: any) => ({
                    id: String(r.id),
                    nombre: r.nombre,
                }));
                setRepresentaciones(datos);
            } catch (error) {
                console.error(error);
            }
        };

        fetchRepresentaciones();
    }, [mostrarSelectRepresentacion]);

    // Cerrar desplegable
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    //Validaciones
    const limpiarNumeros = (valor: string): string => {
        return valor.replace(/\D/g, '');
    };
    const validarCUIT = (cuit: string): string | null => {
        if (!cuit || cuit.trim() === '') {
            return 'Debe ingresar un numero valido para CUIT.';
        }
        const limpio = limpiarNumeros(cuit);
        if (limpio.length !== 11) {
            return 'Formato incorrecto para CUIT. Debe tener exactamente 11 numeros.';
        }
        return null;
    };
    const validarIERIC = (ieric: string): string | null => {
        if (!ieric || ieric.trim() === '') {
            return 'Debe ingresar un numero valido para IERIC.';
        }
        const limpio = limpiarNumeros(ieric);
        if (limpio.length === 0) {
            return 'Formato incorrecto para IERIC. Solo se permiten numeros.';
        }
        return null;
    };

    const validarNumeroLegajo = (codigoLegajo: string): string | null => {
        if (!codigoLegajo || codigoLegajo.trim() === '') {
            return 'Debe ingresar un numero valido para IERIC.';
        }
        const limpio = limpiarNumeros(codigoLegajo);
        if (limpio.length === 0) {
            return 'Formato incorrecto para IERIC. Solo se permiten numeros.';
        }
        return null;
    };

    // limpiamos los filtros
    const clearFilters = () => {
        setCuit('');
        setIeric('');
        setLegajo('');
        setEstado('');
        setSeleccionarGiro('');
        setGiro('');
        setMostrarSelectRepresentacion(false);
        //notificamos al componente padre
        if (onLimpiarFiltros) {
            onLimpiarFiltros();
        }
    };

    const applyFilters = () => {
        if (cuit.trim()) {
            const errorCuit = validarCUIT(cuit);
            if (errorCuit) {
                alert(errorCuit);
                return;
            }
        }

        if (ieric.trim()) {
            const errorIeric = validarIERIC(ieric);
            if (errorIeric) {
                alert(errorIeric);
                return;
            }
        }

        if (legajo.trim()) {
            const errorIeric = validarNumeroLegajo(legajo);
            if (errorIeric) {
                alert(errorIeric);
                return;
            }
        }

        if (mostrarSelectRepresentacion && (!representacionSeleccionada || representacionSeleccionada === '')) {
            alert("Debe seleccionar una representación");
            return;
        }

        const filters: { type: string; value: string }[] = [];

        if (cuit.trim()) filters.push({ type: 'Filtro', value: `CUIT: ${cuit.trim()}` });
        if (ieric.trim()) filters.push({ type: 'Filtro', value: `IERIC: ${ieric.trim()}` });
        if (legajo.trim()) filters.push({ type: 'Filtro', value: `Legajo: ${legajo.trim()}` });
        if (estado !== 'Todos') filters.push({ type: 'Filtro', value: `Estado: ${estado}` });
        if (giro !== 'Todos') filters.push({ type: 'Filtro', value: `Giro: ${giro}` });
        setOpen(false);
        if (onFiltrarPorIeric && ieric.trim()) {
            onFiltrarPorIeric(ieric.trim());
        }
        if (onFiltrarPorCuit && cuit.trim()) {
            onFiltrarPorCuit(cuit.trim());
        }

        if (onFiltrarPorNumeroLegajo && legajo.trim()) {
            onFiltrarPorNumeroLegajo(legajo.trim());
        }
        if (onFiltrarPorEstado && estado.trim()) {
            onFiltrarPorEstado(estado);
        }



        setOpen(false);

        console.log("Giro seleccionado:", seleccionarGiro);

        if (onFiltrarPorGiro && seleccionarGiro && seleccionarGiro !== 'Todos') {
            let valor = seleccionarGiro;
            if (mostrarSelectRepresentacion && representacionSeleccionada) {
                valor += `-${representacionSeleccionada}`;
            }
            onFiltrarPorGiro(valor);
        }

    };

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                aria-haspopup="true"
                aria-expanded={open}
                type="button"
                className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <span className="material-icons mr-2">filter_list</span>
                Filtro
                <span className="material-icons ml-2 transition-transform">expand_more</span>
            </button>
            {open && (
                <div
                    className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    tabIndex={-1}
                >
                    <div className="p-4 space-y-4">
                        {/* CUIT */}
                        <div>
                            <label
                                htmlFor="cuit"
                                className="block text-sm font-medium text-gray-700"
                            >
                                CUIT
                            </label>
                            <input
                                id="cuit"
                                type="text"
                                placeholder="Ingrese CUIT"
                                value={cuit}
                                onChange={(e) => setCuit(e.target.value.replace(/\D/g, ''))} // Solo numeros
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* IERIC */}
                        <div>
                            <label
                                htmlFor="ieric"
                                className="block text-sm font-medium text-gray-700"
                            >
                                IERIC
                            </label>
                            <input
                                id="ieric"
                                type="text"
                                placeholder="Ingrese IERIC"
                                value={ieric}
                                onChange={(e) => setIeric(e.target.value.replace(/\D/g, ''))} // Solo numeros
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* Legajo */}
                        <div>
                            <label
                                htmlFor="legajo"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Legajo
                            </label>
                            <input
                                id="legajo"
                                type="text"
                                placeholder="Ingrese número de legajo"
                                value={legajo}
                                onChange={(e) => setLegajo(e.target.value.replace(/\D/g, ''))} // Solo numeros
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* Estado */}
                        <div>
                            <label
                                htmlFor="estado"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Estado
                            </label>
                            <select
                                id="estado"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="Todos">Selecciona estado</option>
                                {estadosFiltro.map((estado) => (
                                    <option key={estado.id} value={estado.id} >
                                        {estado.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Giro */}
                        <div>
                            <label htmlFor="giro" className="block text-sm font-medium text-gray-700">
                                Giro
                            </label>
                            <select
                                id="giro"
                                value={seleccionarGiro}
                                onChange={handleGiroChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="Todos">Selecciona giro</option>
                                {girosLegales?.map((giro) => (
                                    <option key={giro.id} value={giro.id} >
                                        {giro.descripcion}
                                    </option>
                                ))}
                            </select>
                            {/* Representacion */}
                            {mostrarSelectRepresentacion && (
                                <div>
                                    <label
                                        htmlFor="representacion"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Representación
                                    </label>
                                    <select
                                        id="representacion"
                                        value={representacionSeleccionada}
                                        onChange={(e) => setRepresentacionSeleccionada(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="">Seleccione representación</option>
                                        {representaciones.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}





                        </div>

                    </div>
                    {/* Botones */}
                    <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Limpiar
                        </button>
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
