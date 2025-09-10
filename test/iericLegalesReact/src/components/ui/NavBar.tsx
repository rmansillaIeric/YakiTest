import React, { useState } from 'react';


interface Props {
  onSearchChange?: (value: string) => void;
}

const NavBar: React.FC<Props> = ({ onSearchChange }) => {
  const [showSearch, setShowSearch] = useState(true);
  const [searchText, setSearchText] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearchChange?.(value);
  };

  return (
    <div className="bg-[#f0f0f0] border-b border-[#ccc] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* <span className="material-icons">menu</span>
        <h2>Legajos</h2> */}
      </div>
      <div className="flex items-center gap-2">
        {showSearch ? (
          <>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={handleInputChange}
              className="px-[10px] py-[6px] border border-[#ccc] rounded-md text-sm max-w-[220px]"

            />
            <span className="material-icons cursor-pointer" onClick={() => setShowSearch(false)}>close</span>
          </>
        ) : (
          <span className="material-icons cursor-pointer" onClick={() => setShowSearch(true)}>search</span>
        )}
      </div>
    </div>
  );
};

export default NavBar;
