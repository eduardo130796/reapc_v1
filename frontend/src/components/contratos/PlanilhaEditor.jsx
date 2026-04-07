import { useState } from "react";
import { salvarPlanilha } from "../../services/cargosService";

export default function PlanilhaEditor({ cargo, onSave }) {

  const [dados, setDados] = useState(cargo.planilha || {});

  function handleChange(key, value) {
    setDados(prev => ({
      ...prev,
      [key]: value
    }));
  }

  async function salvar() {
    await salvarPlanilha(cargo.id, dados);
    onSave?.();
  }

  return (
    <div className="bg-white border rounded-xl p-6">

      <h3 className="font-semibold mb-4">Editar planilha</h3>

      {/* EXEMPLO DINÂMICO */}
      {Object.keys(dados).map((key) => (
        <div key={key} className="mb-3">
          <label className="text-sm">{key}</label>
          <input
            value={dados[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      ))}

      <button
        onClick={salvar}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Salvar e bloquear
      </button>

    </div>
  );
}