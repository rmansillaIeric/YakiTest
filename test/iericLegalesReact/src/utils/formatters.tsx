
export function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('es-AR');
  }
  return '';
}

export function formatearCuit(cuit: string): string {
  if (cuit.length === 11) {
    return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
  }
  return cuit;
}