import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <nav className="w-[240px] bg-[#E3F2FD] text-[#333] flex flex-col py-4">
      <h2 className="text-[18px] px-6 mb-6 m-0">ieric</h2>

      <div className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-[#03488E] hover:text-[#f5f5f5]">
        <span className="material-icons mr-3 text-[20px]">dashboard</span> Fiscalización
      </div>

      <div className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-[#03488E] hover:text-[#f5f5f5]">
        <span className="material-icons mr-3 text-[20px]">folder</span> Legales
      </div>

      <div className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-[#03488E] hover:text-[#f5f5f5]">
        <span className="material-icons mr-3 text-[20px]">assignment</span> Cobranza
      </div>

      <div className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-[#03488E] hover:text-[#f5f5f5]">
        <span className="material-icons mr-3 text-[20px]">assignment</span> Auditoria
      </div>
    </nav>
  );
};

export default Sidebar;
