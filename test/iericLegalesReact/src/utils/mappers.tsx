import { formatearFecha, formatearCuit } from './formatters';
import type { Legajo } from './types';

export function mapToLegajo(data: any): Legajo {
  return {
    id: data.id,
    legajo: Number(data.codigoLegajo),
    ieric: data.nroieric,
    cuit: formatearCuit(data.cuit),
    razon: data.razonSocial,
    imr: data.razonSocialIMR,
    asignacion: formatearFecha(data.fechaAsignacion),
    inicio: formatearFecha(data.fechaInicio),
    fin: formatearFecha(data.fechaFin),
    fiscalizacion: formatearFecha(data.fechaIngreso),
    estado: data.estadoDescripcion,
    estadoId: data.estado?.id,
    resultado: data.resultadoDescripcion,
    fechaEstado: formatearFecha(data.fechaEstado),
    inspector: data.inspectorNombre,
    giro: data.giro,
    fechaGirado: formatearFecha(data.fechaGirado),
    representacion: data.representacion,
    representacionId: data.representacionId,
  };
}
