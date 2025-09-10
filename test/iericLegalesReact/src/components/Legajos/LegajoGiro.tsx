import React, { useEffect, useState } from "react";
import AlertModal from "../ui/AlertModal";

//Tipado para una representacion
type Representacion = {
  id: string;
  nombre: string;
};

type GiroLegal = {
  id: string;
  descripcion: string;
};
//Props que recibe el componente LegajoGiro
type LegajoGiroProps = {
  open: boolean;
  data: {
    id?: string;
    idGiro?: string;
    giro?: string;
    representacionId?: string;
    representacionNombre?: string;
    legajo?: number;
  };
  onClose: () => void;
  onGiroActualizado: (nuevoData: any) => void; //Notifica al padre el nuevo giro
  girosLegales: GiroLegal[]; //Listado de giros disponibles
};
//Componente principal
const LegajoGiro: React.FC<LegajoGiroProps> = ({
  open,
  data,
  onClose,
  onGiroActualizado,
  girosLegales,
}) => {
  const [hidden, setHidden] = useState(!open);
  const [idGiroOriginal, setIdGiroOriginal] = useState<string | undefined>(data.idGiro);
  const [repOriginal, setRepOriginal] = useState<string>(data.representacionId || "");
  const [giroSeleccionado, setGiroSeleccionado] = useState<string>(data.idGiro || "");
  const [mostrarSelectRepresentacion, setMostrarSelectRepresentacion] = useState(false);
  const [datosRepresentaciones, setDatosRepresentaciones] = useState<Representacion[]>([]);
  const [representacionSeleccionada, setRepresentacionSeleccionada] = useState<string>(data.representacionId || "");
  const [ultimoGiroSeleccionado, setUltimoGiroSeleccionado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);


  // Sincronizar giro con prop
  useEffect(() => {
    setHidden(!open);
    if (open) {
      //buscamos la descripcion del giro
      const descripcion = girosLegales.find(g => g.id === data.idGiro)?.descripcion || "";

      setGiroSeleccionado("");
      setIdGiroOriginal(data.idGiro);
      setRepOriginal(data.representacionId || "");
      setRepresentacionSeleccionada(data.representacionId || "");
      setMostrarSelectRepresentacion(descripcion === "Representación");
      setMostrarSelectRepresentacion(false);
      setMensaje(null);
      setUltimoGiroSeleccionado(null);
      //setGiroModificado(false);
      console.log("Giro Actual", data.idGiro);
      console.log("Descripcion giro:", descripcion);
      console.log("Mostrar Select Representacion:", descripcion === "Representación");

    }
  }, [open, data]);

  //Cargamos las representaciones
  useEffect(() => {
    if (!mostrarSelectRepresentacion) return;

    const fetchRepresentaciones = async () => {
      try {
        const res = await fetch("https://localhost:44372/v1/Representacion/get-representaciones");
        if (!res.ok) throw new Error("Error al cargar representaciones");
        const json = await res.json();
        const representaciones = json.map((r: any) => ({
          id: String(r.id),
          nombre: r.nombre
        }))
        setDatosRepresentaciones(representaciones);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRepresentaciones();
  }, [mostrarSelectRepresentacion]);
  //Handler para cambio de giro
  const handleGiroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoId = e.target.value;
    setGiroSeleccionado(nuevoId);

    if (ultimoGiroSeleccionado && ultimoGiroSeleccionado !== nuevoId) {
      setUltimoGiroSeleccionado(nuevoId);
    }

    const giro = girosLegales.find(g => g.id === nuevoId);
    const descripcion = giro?.descripcion || "";
    //Mostramos el select de representacion si el giro es "Representacion"
    setMostrarSelectRepresentacion(descripcion === "Representación");

    if (descripcion !== "Representación") {
      setRepresentacionSeleccionada("");
    }
  };
  //Handler del cambio de representación
  const handleRepresentacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaRep = e.target.value;
    setRepresentacionSeleccionada(nuevaRep);

    const giroRepresentacion = girosLegales.find(g => g.descripcion === "Representación");
    if (giroRepresentacion) {
      setGiroSeleccionado(giroRepresentacion.id);
    }

  };

  const handleCancelar = () => {
    onClose();
  };

  const handleAceptar = async () => {
    const giroOriginal = idGiroOriginal || "";
    const nuevoGiroId = giroSeleccionado || "";
    const repSeleccionada = representacionSeleccionada || "";
    const cambioGiro = nuevoGiroId !== giroOriginal;
    const cambioRepresentacion = repSeleccionada !== repOriginal;

    console.log({
      giroOriginal,
      nuevoGiroId,
      repOriginal,
      repSeleccionada,
      cambioGiro,
      cambioRepresentacion,
    });

    if (!nuevoGiroId) {
      setMensajeAlerta("Debe seleccionar un giro");
      return;
    }

    if (nuevoGiroId === giroOriginal &&
      (nuevoGiroId !== "5" || repSeleccionada === repOriginal)
    ) {
      setMensajeAlerta("Ingrese un giro diferente");
      return;
    }

    if (!cambioGiro && !cambioRepresentacion) {
      setMensajeAlerta("Debe seleccionar un giro");
      return;
    }

    if (mostrarSelectRepresentacion && (!repSeleccionada || repSeleccionada === "0")) {
      setMensajeAlerta("Debe seleccionar una representación");
      return;
    }

    console.log("giroOriginal", giroOriginal, "nuevoGiroId", nuevoGiroId);

    try {
      const response = await fetch("https://localhost:44372/v1/legajos/Girar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legajoId: data.id,
          etapa: giroSeleccionado,
          representacionId: representacionSeleccionada || "0",
        }),
      });

      if (response.ok) {
        const giro = girosLegales.find(g => g.id === giroSeleccionado);
        const descripcionGiro = giro?.descripcion || "";
        const nuevaData = {
          ...data,
          giro: descripcionGiro,
          fechaGiro: new Date().toLocaleDateString("es-AR"),
          representacionNombre: datosRepresentaciones.find(r => r.id === representacionSeleccionada)?.nombre || "",
          idGiro: giroSeleccionado,
          representacionId: representacionSeleccionada,
        };

        onGiroActualizado(nuevaData);
        setMensajeAlerta("Giro Actualizado.");
        setTimeout(() => {
          setMensajeAlerta(null);
          onClose();
        }, 1500);

      } else {
        const errorText = await response.text();
        setMensajeAlerta("Error al actualizar giro: " + errorText);
      }
    } catch (error) {
      setMensajeAlerta("No se pudo conectar con el servidor.");
    }
  };

  if (hidden) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[360px]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Girar Legajo</h3>
          <button
            onClick={handleCancelar}
            className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
            aria-label="Cerrar"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Girar el legajo <span className="font-bold">{data.legajo || "Sin Legajo"}</span> a un nuevo
            departamento o área.
          </p>

          {/* Select Giro */}
          <div>
            <label
              htmlFor="selectGiro"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Girar a
            </label>
            <select
              id="selectGiro"
              value={giroSeleccionado}
              onChange={handleGiroChange}
              className="form-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
            >
              <option value="">Selecciona giro</option>
              {girosLegales.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Select Representación */}
          {mostrarSelectRepresentacion && (
            <div>
              <label
                htmlFor="selectRepresentacion"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
              >
                Representación
              </label>
              <select
                id="selectRepresentacion"
                value={representacionSeleccionada}
                onChange={handleRepresentacionChange}
                className="form-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
              >
                <option value="0">Seleccione</option>
                {datosRepresentaciones.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Textarea motivo del giro */}
          <div>
            <label
              htmlFor="motivo-giro"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Motivo del giro
            </label>
            <textarea
              id="motivo-giro"
              name="motivo-giro"
              placeholder="Escriba un breve motivo..."
              rows={3}
              className="form-textarea w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent transition"
            />
          </div>

          {/* Mensaje de validación */}
          {mensaje && <div className="text-red-600 text-sm">{mensaje}</div>}
        </div>

        {/* Footer */}
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
            Confirmar Giro
          </button>
        </div>
      </div>

      {mensajeAlerta && (
        <AlertModal mensaje={mensajeAlerta} onCerrar={() => setMensajeAlerta(null)} />
      )}
    </div>
  );
};

export default LegajoGiro;
