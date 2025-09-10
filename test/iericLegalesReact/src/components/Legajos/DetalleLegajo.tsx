import React from 'react';

type DetalleLegajoProps = {
  open: boolean;
  data: any;
  onClose: () => void;
  onActas: () => void;
  onArticulos: () => void;
};

const DetalleLegajo: React.FC<DetalleLegajoProps> = ({
  open,
  data,
}) => {
  if (!open) return null;
  return (  
     <div className="p-4">
      <div className="grid grid-cols-4 gap-x-6 gap-y-3 text-sm max-h-[500px] overflow-y-auto">

        <div className="col-span-1 font-semibold text-gray-700">Razón Social:</div>
        <div className="col-span-3 font-semibold text-gray-900 truncate">{data.razon}</div>

        <div className="col-span-1 font-semibold text-gray-700">Razón Social IMR:</div>
        <div className="col-span-3 font-semibold text-gray-700 truncate">{data.imr}</div>

        <div className="col-span-1 font-semibold text-gray-700">Nro de Legajo:</div>
        <div className="col-span-1">{data.legajo}</div>

        <div className="col-span-1 font-semibold text-gray-700">IERIC:</div>
        <div className="col-span-1">{data.ieric}</div>

        <div className="col-span-1 font-semibold text-gray-700">CUIT:</div>
        <div className="col-span-1">{data.cuit}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha de Inicio:</div>
        <div className="col-span-1">{data.inicio}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha Asignado:</div>
        <div className="col-span-1">{data.asignacion}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha de Fin:</div>
        <div className="col-span-1">{data.fin}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha de Fiscalización:</div>
        <div className="col-span-1">{data.fiscalizacion}</div>

        <div className="col-span-1 font-semibold text-gray-700">Resultado:</div>
        <div className="col-span-1">{data.resultado ?? '-'}</div>

        <div className="col-span-1 font-semibold text-gray-700">Estado:</div>
        <div className="col-span-1">{data.estado}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha de Estado:</div>
        <div className="col-span-1">{data.fechaEstado}</div>

        <div className="col-span-1 font-semibold text-gray-700">Girado:</div>
        <div className="col-span-1">{data.giro ?? '-'}</div>

        <div className="col-span-1 font-semibold text-gray-700">Fecha de Girado:</div>
        <div className="col-span-1">{data.fechaGirado ?? '-'}</div>

        <div className="col-span-1 font-semibold text-gray-700">Inspector:</div>
        <div className="col-span-1">{data.inspector ?? '-'}</div>

        <div className="col-span-1 font-semibold text-gray-700">Representación:</div>
        <div className="col-span-1">{data.representacion}</div>
      </div>
  </div>
  );
};

export default DetalleLegajo;
