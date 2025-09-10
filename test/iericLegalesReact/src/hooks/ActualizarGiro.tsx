import { useCallback } from 'react';
import type { LegajoExtendido, GiroHistorial } from '../utils/types';

interface Props {
    setLegajos: React.Dispatch<React.SetStateAction<any[]>>;
    setLegajoSeleccionado: React.Dispatch<React.SetStateAction<LegajoExtendido | null>>;
    legajoSeleccionado: LegajoExtendido | null;
}

export const ActualizarGiro = ({
    setLegajos,
    setLegajoSeleccionado,
    legajoSeleccionado
}: Props) => {

    const onGiroActualizado = useCallback((nuevoData: any) => {
        console.log("Datos recibidos en onGiroActualizado", nuevoData);
        const giroLista = ['IMR', 'Fiscalización', 'Legales'];
        const giroFiscalizacion = giroLista.includes(nuevoData.giro);
        const usuarioGiro = legajoSeleccionado?.historialGiro?.[0]?.usuario ?? 'Desconocido';

        const nuevoHistorialGiro: GiroHistorial = {
            ubicacionAnterior: legajoSeleccionado?.giro ?? '',
            ubicacionActual: nuevoData.giro,
            fecha: nuevoData.fechaGiro,
            usuario: usuarioGiro,
        };

        setLegajos(prevLegajos =>
            prevLegajos.map(l =>
                l.id === nuevoData.id
                    ? {
                        ...l,
                        giro: nuevoData.giro,
                        fechaGirado: nuevoData.fechaGiro,
                        representacion: giroFiscalizacion ? 'Central' : nuevoData.representacionNombre ?? '',
                        representacionId: giroFiscalizacion ? undefined : nuevoData.representacionId ?? '',
                    }
                    : l
            )
        );

        setLegajoSeleccionado(prev => {
            if (!prev) return null;
            if (prev.id === nuevoData.id) {
                return {
                    ...prev,
                    giro: nuevoData.giro,
                    fechaGirado: nuevoData.fechaGiro,
                    representacion: nuevoData.representacionNombre ?? prev.representacion,
                    representacionId: nuevoData.representacionId ?? prev.representacionId,
                    historialGiros: [nuevoHistorialGiro, ...(prev.historialGiros ?? [])],
                };
            }
            return prev;
        });
    }, [legajoSeleccionado, setLegajos, setLegajoSeleccionado]);

    return { onGiroActualizado };
};
