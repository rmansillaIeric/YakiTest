import { useState } from 'react';
import logo from './assets/logo.png';
import Fiscalizacion from './components/Fiscalizacion';
import FiscalizacionInicio from './components/FiscalizacionInicio/FiscalizacionInicio';
import VerFiscalizacion from './components/VerFiscalizacion/VerFiscalizacion';
function InitialScreen() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <nav className={`bg-[#084477] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-52'} flex-shrink-0 flex flex-col`}>
          <div className="p-4 font-bold text-lg border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Logo IERIC"
                className={`transition-all duration-300 ${collapsed ? 'h-6' : 'h-8'}`}
              />
              {!collapsed && <span>IERIC</span>}
            </div>
            <button
              className="focus:outline-none"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="material-icons text-white">
                {collapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div
              className="flex items-center p-4 hover:bg-blue-200/30 cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="material-icons">home</span>
              {!collapsed && <span className="ml-2">Inicio</span>}
            </div>
            <div
              className="flex items-center p-4 hover:bg-blue-200/30 cursor-pointer"
              onClick={() => setActiveView('fiscalizacion')}
            >
              <span className="material-icons">dashboard</span>
              {!collapsed && <span className="ml-2">Fiscalización</span>}
            </div>
            <div className="flex items-center p-4 hover:bg-blue-200/30 cursor-pointer">
              <span className="material-icons">folder</span>
              {!collapsed && <span className="ml-2">Legales</span>}
            </div>
            <div className="flex items-center p-4 hover:bg-blue-200/30 cursor-pointer">
              <span className="material-icons">assignment</span>
              {!collapsed && <span className="ml-2">Cobranzas</span>}
            </div>
            <div className="flex items-center p-4 hover:bg-blue-200/30 cursor-pointer">
              <span className="material-icons">assignment</span>
              {!collapsed && <span className="ml-2">Auditoría</span>}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white shadow px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeView === 'fiscalizacion' ? 'Gestión de Documento' : ''}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="material-icons cursor-pointer">notifications</span>
              <span className="material-icons cursor-pointer">person</span>
              <span className="material-icons cursor-pointer">settings</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-50 p-6">
            {activeView === 'fiscalizacion' ? (
              <FiscalizacionInicio
                Fiscalizacion={<Fiscalizacion />}
                VerFiscalizacion={<VerFiscalizacion />}
                initialTab="fiscalizacion"
              />
            ) : (
              <div className="text-center text-gray-400 text-lg">
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="bg-[var(--primary)] text-white py-4 w-full">
            <div className="px-6 text-center">
              <p className="text-sm font-medium">© IERIC 2025. Todos los derechos reservados.</p>
            </div>
          </footer>

        </div>
      </div>

    </>

  );
}

export default InitialScreen;
