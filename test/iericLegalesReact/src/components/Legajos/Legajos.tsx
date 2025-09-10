import React, { useMemo } from 'react';

import '../styles/globals.css';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

interface Legajo {
  codigoLegajo: string;
  nroieric: string;
  cuit: number;
  razonSocial: string;
  fechaInicio: string;
  fechaAsignacion: string;
  fechaFin: string;
  estadoDescripcion: string;
  tieneActas?: boolean;
}

interface Props {
  grid: Legajo[];
  seleccionarFila: (item: Legajo) => void;
  refrescar: () => void;
  modificar: () => void;
  giro: () => void;
  filtrar: () => void;
  documentos: () => void;
  detalle: () => void;
  excel: () => void;
}

const Legajos: React.FC<Props> = ({ grid, seleccionarFila }) => {
  const data = useMemo(() => grid, [grid]);

  const formatDateCell = (value: unknown) => {
    if (typeof value === 'string' || value instanceof Date) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy');
      }
    }
    return '';
  };

  const columns = useMemo<ColumnDef<Legajo>[]>(() => [
    { accessorKey: 'codigoLegajo', header: 'Nro de Legajo' },
    { accessorKey: 'nroieric', header: 'Ieric' },
    {
      accessorKey: 'cuit',
      header: 'CUIT',
      cell: info => {
        const val = String(info.getValue<number>());
        return `${val.slice(0, 2)}-${val.slice(2, 10)}-${val.slice(10)}`;
      },
    },
    { accessorKey: 'razonSocial', header: 'Razón Social' },
    {
      accessorKey: 'fechaInicio',
      header: 'Fecha de Inicio',
      cell: info => formatDateCell(info.getValue()),
    },
    {
      accessorKey: 'fechaAsignacion',
      header: 'Fecha Asignado',
      cell: info => formatDateCell(info.getValue()),
    },
    {
      accessorKey: 'fechaFin',
      header: 'Fecha de Fin',
      cell: info => formatDateCell(info.getValue()),
    },
    { accessorKey: 'estadoDescripcion', header: 'Estado' },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              onClick={() => seleccionarFila(row.original)}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Legajos;
