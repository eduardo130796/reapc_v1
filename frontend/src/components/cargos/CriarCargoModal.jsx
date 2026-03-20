import { useState } from "react";

export default function CriarCargoModal({ onClose }) {

  const [nome, setNome] = useState("");
  const [salario, setSalario] = useState("");

  const handleSalvar = () => {
    console.log("Cargo:", nome, salario);
    onClose();
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px]">

        <h2 className="text-lg font-semibold mb-4">
          Criar Cargo
        </h2>

        <div className="mb-4">

          <label className="block text-sm mb-1">
            Nome do cargo
          </label>

          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

        </div>

        <div className="mb-6">

          <label className="block text-sm mb-1">
            Salário base
          </label>

          <input
            type="number"
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />

        </div>

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="border border-slate-300 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Salvar
          </button>

        </div>

      </div>

    </div>
  );
}