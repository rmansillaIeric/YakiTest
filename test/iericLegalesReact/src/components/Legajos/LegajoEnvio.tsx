import React from "react";

type LegajoEnvioProps = {
  selectId: string[];
  onClose: () => void;
  onConfirm: () => void;
};

const LegajoEnvio: React.FC<LegajoEnvioProps> = ({
  selectId,
  onClose,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 pb-3 border-b">
          <span className="material-icons text-[var(--secondary)] text-2xl">send</span>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Confirmar envío
          </h3>
        </div>
        <div className="py-4 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            ¿Está seguro de enviar estos legajos?
          </p>

      {/*     <div>
            <label
              className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
              htmlFor="destino"
            >
              Destino
            </label>
            <select
              className="form-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
              id="destino"
              name="destino"
            >
           </select>
          </div>     */}

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="material-icons text-[var(--secondary)] text-lg">info</span>
            <span>{selectId.length} legajos seleccionados</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            className="px-4 py-2 bg-gray-200 text-[var(--text-secondary)] rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-800 transition-colors"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegajoEnvio;
