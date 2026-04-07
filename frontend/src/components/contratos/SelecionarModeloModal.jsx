import { useEffect, useState } from "react";
import { listarModelos } from "../../services/modelosService";
import { aplicarModelo } from "../../services/cargosService";

export default function SelecionarModeloModal({ cargo, onClose, onSuccess }) {

  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionandoId, setSelecionandoId] = useState(null);

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    async function load() {
      try {
        const data = await listarModelos();
        setModelos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =========================
  // SELECT
  // =========================

  async function selecionar(modelo) {
    try {
      setSelecionandoId(modelo.id);

      await aplicarModelo(cargo.id, modelo.id);

      onSuccess?.();
      onClose?.();

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao aplicar modelo");
    } finally {
      setSelecionandoId(null);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[600px] max-h-[80vh] flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b p-4">

          <h2 className="text-lg font-semibold">
            Selecionar modelo
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>

        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto">

          {loading ? (

            <div className="text-center text-slate-500 py-10">
              Carregando modelos...
            </div>

          ) : modelos.length === 0 ? (

            <div className="text-center text-slate-500 py-10">
              Nenhum modelo disponível
            </div>

          ) : (

            <div className="space-y-3">

              {modelos.map((m) => {

                const selecionando = selecionandoId === m.id;

                return (
                  <div
                    key={m.id}
                    className="border rounded-lg p-4 flex justify-between items-center hover:bg-slate-50"
                  >

                    <div>
                      <p className="font-medium">{m.nome}</p>
                      <p className="text-sm text-slate-500">
                        Versão {m.versao}
                      </p>
                    </div>

                    <button
                      onClick={() => selecionar(m)}
                      disabled={selecionando}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      {selecionando ? "Aplicando..." : "Selecionar"}
                    </button>

                  </div>
                );

              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}