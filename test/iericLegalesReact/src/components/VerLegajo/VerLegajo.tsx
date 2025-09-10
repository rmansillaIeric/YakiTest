import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type VerLegajoProps = {
  DetalleLegajo: ReactNode;
  LegajoActas: ReactNode;
  LegajoArticulos: ReactNode;
  onClose: () => void;
  initialTab?: "detalle" | "actas" | "articulos"; // prop para el tab inicial
  legajoNumero?: number; 

};

const VerLegajo: React.FC<VerLegajoProps> = ({
  DetalleLegajo,
  LegajoActas,
  LegajoArticulos,
  onClose,
  initialTab = "detalle",
  legajoNumero,
}) => {
  const [activeTab, setActiveTab] = useState<'detalle' | 'actas' | 'articulos'>('detalle');

  useEffect(() => {
    setActiveTab(initialTab);

  }, [initialTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Contenido del modal */}
      <div className="bg-white w-[90%] max-w-3xl max-h-[90vh] flex flex-col rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Legajo N° { legajoNumero ?? 'Desconocido'} </h2>
          <button
            className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
            onClick={onClose}
            title="Cerrar"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-4 pt-4 -mb-px">
          <div className="flex space-x-1">
            {['detalle', 'actas', 'articulos'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 ${activeTab === tab
                    ? 'bg-white text-[var(--primary)]'
                    : 'bg-gray-200 text-[var(--text-secondary)] hover:bg-gray-300'
                  }`}
                onClick={() => setActiveTab(tab as any)}
              >
                <span className="material-icons">
                  {tab === 'detalle' ? 'folder_open' : 'folder'}
                </span>
                {tab === 'detalle' && 'Detalle de Legajo'}
                {tab === 'actas' && 'Actas de Obra'}
                {tab === 'articulos' && 'Artículos'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 border-t border-gray-200 ">
            <div className="w-full max-w-4xl mx-auto">

            {activeTab === 'detalle' && DetalleLegajo}
            {activeTab === 'actas' && LegajoActas}
             {activeTab === 'articulos' && LegajoArticulos}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-white rounded-b-lg space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-[var(--text-secondary)] rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-800 flex items-center gap-2">
            <span className="material-icons text-sm">print</span> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerLegajo;
