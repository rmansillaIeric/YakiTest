export type Legajo = {
  id: string;
  legajo: number;
  ieric: string;
  cuit: string;
  razon: string;
  imr?: string;
  asignacion: string;
  inicio: string;
  fin: string;
  fiscalizacion: string;
  estado: string;
  estadoId?: string,
  resultado: string;
  fechaEstado: string;
  inspector: string;
  fechaGirado: string;
  representacion: string;
  representacionId?: string;
  giro?: string;
  nroActa?: string;
  articulo?: string;
  actas?: Acta[];
  historialEstados?: EstadoHistorial[];
  historialGiros?: GiroHistorial[];
};

export type FiltroLegajo = {
  NroIeric?: string;
  CUIT?: string;
  CodigoLegajo?: string;
  giro?: string;
  EstadoId?: string;
}
export type LegajoExtendido = Legajo & {
  nroActa?: string,
  articulo?: Articulo,
  actas?: Acta[];
  legajoArticulos?: Articulo[];
  historialEstados?: EstadoHistorial[];
  historialGiros?: GiroHistorial[];
};


export type EstadoHistorial = {
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: string;
  usuario: string;
}
export type GiroHistorial = {
  ubicacionAnterior: string;
      ubicacionActual: string;
      fecha: string;
      usuario: string;
}

export type GiroLegal = {
  id: string;
  descripcion: string;
}

export type Acta = {
  id:string;
  nroActa: string;
  domicilioObra: string;
  fechaControl: string;
  localidadObra: string;
  obrerosDeclarados:string;
  obrerosNoDeclarados:string;
};

export type Articulo = {
  articuloId: number,
  codigo: string,
  cantidad: string;
};