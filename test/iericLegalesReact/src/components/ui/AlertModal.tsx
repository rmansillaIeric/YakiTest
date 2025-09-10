import React from "react";
//import "../styles/AlertModal.css";


type AlertModalProps = {
  mensaje: string;
  onCerrar: () => void;
};

const AlertModal: React.FC<AlertModalProps> = ({ mensaje, onCerrar }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
      <div className="bg-white px-8 py-6 rounded-lg shadow-lg text-center max-w-md w-full">
        <p className="mb-5 text-base">{mensaje}</p>
        <button
          onClick={onCerrar}
          className="px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default AlertModal;

