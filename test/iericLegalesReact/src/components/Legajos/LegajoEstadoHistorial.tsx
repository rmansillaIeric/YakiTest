import LegajoEstado from './LegajoEstado';
import type { LegajoExtendido, EstadoHistorial, Legajo } from '../../utils/types';

interface LegajoEstadoHistorialProps {
  legajoSeleccionado: LegajoExtendido | null;
  setMostrarEstado: (v: boolean) => void;
  setLegajos: React.Dispatch<React.SetStateAction<Legajo[]>>;
  setLegajoSeleccionado: React.Dispatch<React.SetStateAction<LegajoExtendido | null>>;
}

export default function LegajoEstadoHistorial({
  legajoSeleccionado,
  setMostrarEstado,
  setLegajos,
  setLegajoSeleccionado
}: LegajoEstadoHistorialProps) {
  if (!legajoSeleccionado) return null;

  return (
    <LegajoEstado
      open={true}
      data={{
        legajoId: legajoSeleccionado.id,
        legajo: legajoSeleccionado.legajo,
        estadoId: legajoSeleccionado.estadoId,
        estadoDescripcion: legajoSeleccionado.estado,
      }}
      onClose={() => setMostrarEstado(false)}
      onEstadoActualizado={(updatedData) => {
        const usuarioActual = legajoSeleccionado?.historialEstados?.[0]?.usuario ?? 'Desconocido';

        const nuevoHistorial: EstadoHistorial = {
          estadoAnterior: legajoSeleccionado.estado ?? '',
          estadoNuevo: updatedData.nuevoEstadoDescripcion,
          fecha: updatedData.fechaUltimoEstado,
          usuario: usuarioActual,
        };

        setLegajos(prev =>
          prev.map(l =>
            l.id === updatedData.legajoId
              ? {
                  ...l,
                  estado: updatedData.nuevoEstadoDescripcion,
                  estadoId: updatedData.nuevoEstadoId,
                  fechaEstado: updatedData.fechaUltimoEstado,
                }
              : l
          )
        );

        setLegajoSeleccionado(prev => {
          if (!prev || prev.id !== updatedData.legajoId) return prev;

          return {
            ...prev,
            estado: updatedData.nuevoEstadoDescripcion,
            estadoId: updatedData.nuevoEstadoId,
            fechaEstado: updatedData.fechaUltimoEstado,
            historialEstados: [nuevoHistorial, ...(prev.historialEstados ?? [])],
          };
        });
      }}
    />
  );
}
