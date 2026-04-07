import { useState } from "react";
import { criarCargo } from "../../services/cargosService";

export default function CriarCargoModal({ contratoId, onClose, onSuccess }) {

  const [form, setForm] = useState({
    nome: "",
    quantidade: "",
    salario: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {

      const payload = {
        contrato_id: contratoId,
        nome: form.nome.trim(),
        quantidade: Number(form.quantidade),
        salario: Number(form.salario)
      };

      await criarCargo(payload);

      onSuccess?.();
      onClose?.();

    } catch (err) {
      console.error(err);
      alert("Erro ao criar cargo");
    } finally {
      setLoading(false);
    }
    
  }
  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[400px]">

        <h2 className="text-lg font-semibold mb-4">
          Novo cargo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} />

          <Input label="Quantidade" name="quantidade" type="number" value={form.quantidade} onChange={handleChange} />

          <Input label="Salário" name="salario" type="number" value={form.salario} onChange={handleChange} />

          <div className="flex justify-end gap-2 pt-4">

            <button type="button" onClick={onClose} className="border px-3 py-2 rounded">
              Cancelar
            </button>

            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">
              {loading ? "Salvando..." : "Salvar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function Input({ label, value, ...props }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        {...props}
        value={value ?? ""}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}