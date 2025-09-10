import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type FiscalizacionInicioProps = {
    Fiscalizacion: ReactNode;
    VerFiscalizacion: ReactNode;
    initialTab?: "fiscalizacion" | "verfiscalizacion"; // prop para el tab inicial
};

const FiscalizacionInicio: React.FC<FiscalizacionInicioProps> = ({
    Fiscalizacion,
    VerFiscalizacion,
    initialTab = "fiscalizacion",
}) => {
    const [activeTab, setActiveTab] = useState<'fiscalizacion' | 'verfiscalizacion'>('fiscalizacion');

    useEffect(() => {
        setActiveTab(initialTab);

    }, [initialTab]);

    return (
        <div className=" fixed top-[84px] left-[233px] z-50 flex justify-center ">

            {/* Contenido del modal */}
            <div className="bg-white w-[1680px] max-h-[760px] flex flex-col rounded-lg shadow-lg overflow-hidden">
                <h1 className="text-xl font-bold ml-8">Fiscalización</h1>

                {/* Tabs */}
                <div className="flex-shrink-0 px-4 pt-4 -mb-px">
                    <div className="flex space-x-1">
                        {['fiscalizacion', 'verfiscalizacion'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 ${activeTab === tab
                                    ? 'bg-white text-[var(--primary)]'
                                    : 'bg-gray-200 text-[var(--text-secondary)] hover:bg-gray-300'
                                    }`}
                                onClick={() => setActiveTab(tab as any)}
                            >
                                <span className="material-icons">
                                    {tab === 'fiscalizacion' ? 'folder_open' : 'folder'}
                                </span>
                                {tab === 'fiscalizacion' && 'Legajos'}
                                {tab === 'verfiscalizacion' && 'Legajos Enviados'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-4 border-t border-gray-200 ">
                    <div className="w-full ">
                        <div
                            className={`transition-opacity duration-500 ease-in-out ${activeTab === 'fiscalizacion' ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute'
                                }`}
                        >
                            {Fiscalizacion}
                        </div>
                        <div
                            className={`transition-opacity duration-500 ease-in-out ${activeTab === 'verfiscalizacion' ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute'
                                }`}
                        >
                            {VerFiscalizacion}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiscalizacionInicio;
