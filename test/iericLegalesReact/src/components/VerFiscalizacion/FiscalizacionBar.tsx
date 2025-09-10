import { useState } from 'react';
type FilterBarProps = {
    onOpenFilterModal?: () => void;
    onAttachFiles?: () => void;
    onActualizarGrilla?: (data: any[]) => void;
    onBuscarTexto?: (texto: string) => void;
    searchText: string;
    onSearchTextChange: (texto: string) => void;
};

const FiscalizacionBar: React.FC<FilterBarProps> = ({
    onAttachFiles,
    onBuscarTexto,
    searchText,
    onSearchTextChange,
}) => {
    const [showSearch, setShowSearch] = useState(false);
    const toggleSearch = () => setShowSearch(!showSearch);
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchText.trim()) {
            if (onBuscarTexto) {
                onBuscarTexto(searchText.trim());
            }
        }
    };
    return (
        <div className="flex flex-col space-y-2 mb-0 py-3 px-2 bg-white">

            <div className="flex items-center justify-end mb-4">
                <div className="nav-controls">
                    {showSearch ? (
                        <>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchText}
                                onChange={(e) => onSearchTextChange(e.target.value)}
                                className="border rounded px-2 py-1"
                            />
                            <span className="material-icons cursor-pointer ml-2" onClick={toggleSearch}>close</span>
                        </>
                    ) : (
                        <span className="material-icons cursor-pointer" onClick={toggleSearch}>search</span>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-6 overflow-x-visible">

                <div className="h-10 border-l border-gray-300"></div>
                <div className="relative">
                </div>
                <div className="h-10 border-l border-gray-300"></div>
                <div className="relative group">
                    <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div className="py-1" role="menu">
                            <button
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-100 w-full text-left"
                                role="menuitem"
                                onClick={onAttachFiles}
                            >
                                <span className="material-icons text-lg">attach_file</span>
                                <span>Adjuntar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiscalizacionBar;
