import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-white">
      <h1 className="text-2xl m-0">Fiscalización</h1>
      <div className="flex space-x-3">
        <span className="material-icons cursor-pointer">notifications</span>
        <span className="material-icons cursor-pointer">person</span>
        <span className="material-icons cursor-pointer">settings</span>
      </div>
    </div>
  );
};

export default TopBar;

