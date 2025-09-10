import React, { useEffect, useState } from "react";
import AlertModal from "../ui/AlertModal";

//Tipado para estado de legajo
type EstadoLegajo = {
  id: string;
  nombre: string;
};

//Tipado de los props que recibe el componente
type LegajoEstadoProps = {
  open: boolean;
  data: {
    legajoId?: string;
    legajo?: number;
    estadoId?: string;
    estadoDescripcion?: string;
  };
  onClose: () => void;
  //Funcion que notifica al padre que se actualizo el estado
  onEstadoActualizado: (detalle: {
    legajoId: string;
    legajo: number;
    nuevoEstadoId: string;
    nuevoEstadoDescripcion: string;
    fechaUltimoEstado: string;
  }) => void;
};

const LegajoEstado: React.FC<LegajoEstadoProps> = ({
  open,
  data,
  onClose,
  onEstadoActualizado,
}) => {
  //Estados
  const [estadosLegajo, setEstadosLegajo] = useState<EstadoLegajo[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("");
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);
  const [estadoActualId, setEstadoActualId] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    const fetchEstados = async () => {
      try {
        const res = await fetch("https://localhost:44372/v1/legajos/GetEstados");
        if (!res.ok) throw new Error("Error al cargar estados");
        const json = await res.json();
        setEstadosLegajo(json);
      } catch (error) {
        console.error("Error fetching estados:", error);
      }
    };

    fetchEstados();
  }, [open]);
  //Efecto para actualizar el estado actual del legajo seleccionado
  useEffect(() => {

    if (open && data.estadoId && estadosLegajo.length > 0) {
      console.log("Seteando estadoActualId", data.estadoId);
      setEstadoActualId(data.estadoId);
      setEstadoSeleccionado("");
    }
  }, [open, data.estadoId]);

  const handleCancelar = () => {
    onClose();
    setEstadoSeleccionado("");
  };
  //Validamos y enviamos el nuevo estado
  const handleAceptar = async () => {

    if (!data.legajoId) {
      setMensajeAlerta("El ID del legajo es obligatorio.");
      return;
    }
    //validacion: estado no seleccionado
    if (!estadoSeleccionado) {
      setMensajeAlerta("Debe seleccionar un estado.");
      return;
    }

    const estadoValido = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(estadoSeleccionado);
    if (!estadoValido) {
      setMensajeAlerta("El estado seleccionado no es válido.");
      return;
    }

    const estadoSeleccionadoNombre = estadosLegajo.find(e => e.id === estadoSeleccionado)?.nombre.trim().toLowerCase();
    //quitamos espacios en blanco
    const estadoActualNombreLower = data.estadoDescripcion?.trim().toLowerCase();
    //validacion: que no sea el mismo estado
    if (
      estadoSeleccionado === estadoActualId ||
      estadoSeleccionadoNombre === estadoActualNombreLower
    ) {
      setMensajeAlerta("Debe seleccionar un estado diferente al actual.");
      return;
    }

    const estadoExiste = estadosLegajo.some((e) => e.id === estadoSeleccionado);
    if (!estadoExiste) {
      setMensajeAlerta("El estado seleccionado no está disponible.");
      return;
    }
    // si todo esta validado, realizamos el cambio  de estado
    try {
      const response = await fetch("https://localhost:44372/v1/legajos/CambiarEstado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legajoId: data.legajoId,
          nuevoEstadoId: estadoSeleccionado,
          fechaCambioEstado: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setEstadoActualId(estadoSeleccionado)
        const estadoNombre =
          estadosLegajo.find((e) => e.id === estadoSeleccionado)?.nombre || "";
        onEstadoActualizado({
          legajoId: data.legajoId || "",
          legajo: data.legajo || 0,
          nuevoEstadoId: estadoSeleccionado,
          nuevoEstadoDescripcion: estadoNombre,
          fechaUltimoEstado: new Date().toLocaleDateString("es-AR"),
        });
        setMensajeAlerta("estado actualizado correctamente.");
        //onClose();
        setTimeout(() => {
          setMensajeAlerta(null);
          onClose();
        }, 1500);

      } else {
        const text = await response.text();
        console.error("Error del servidor:", text);
        setMensajeAlerta("Error al actualizar estado.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      setMensajeAlerta("No se pudo conectar con el servidor.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[360px]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Cambio de Estado</h3>
          <button
            onClick={handleCancelar}
            className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
            aria-label="Cerrar"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="py-4 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Seleccione el nuevo estado para el legajo{" "}
            <span className="font-bold">{data.legajo || "Sin Legajo"}</span>.
          </p>
          <div>
            <label
              htmlFor="estadoSelect"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Nuevo Estado
            </label>
            <select
              id="estadoSelect"
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="form-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
            >
              <option value="" disabled>
                Seleccionar estado
              </option>
              {estadosLegajo.length ? (
                estadosLegajo.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))
              ) : (
                <option disabled>Cargando...</option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="motivo"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Motivo del cambio
            </label>
            <textarea
              id="motivo"
              name="motivo"
              placeholder="Escriba un breve motivo..."
              rows={3}
              className="form-textarea w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end pt-3 border-t space-x-2">
          <button
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-200 text-[var(--text-secondary)] rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleAceptar}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-800"
          >
            Aceptar
          </button>
        </div>
      </div>

      {mensajeAlerta && (
        <AlertModal mensaje={mensajeAlerta} onCerrar={() => setMensajeAlerta(null)} />
      )}

    </div>
  );
};

export default LegajoEstado;
