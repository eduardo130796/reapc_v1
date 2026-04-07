import { useState, useEffect } from "react";
import { atualizarContrato } from "../../services/contratosService";
import { mapContratoToAPI } from "../../services/mappers/contratoMapper";

export default function EditarContratoModal({ contrato, onClose, onSuccess }) {

  const [form, setForm] = useState({
    numero: "",
    fornecedor_nome: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    valor_global: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contrato) {
        setForm({
        numero: contrato.numero ?? "",
        objeto: contrato.objeto ?? "",
        fornecedor_nome: contrato.fornecedor ?? "",
        vigencia_inicio: contrato.data_inicio
            ? contrato.data_inicio.slice(0, 10)
            : "",
        vigencia_fim: contrato.data_fim
            ? contrato.data_fim.slice(0, 10)
            : "",
        valor_global:
            contrato.valor_anual !== undefined && contrato.valor_anual !== null
            ? String(contrato.valor_anual)
            : ""
        });
    }
    }, [contrato]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {

        const payload = mapContratoToAPI(form);

        console.log("PAYLOAD:", payload);

        await atualizarContrato(contrato.id, payload);

        onSuccess?.();
        onClose?.();

    } catch (err) {
        console.error(err);
        alert(err || "Erro ao atualizar contrato");
    } finally {
        setLoading(false);
    }
    }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[500px]">

        <h2 className="text-lg font-semibold mb-4">
          Editar contrato
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <Input label="Número" name="numero" value={form.numero} onChange={handleChange} />
          <Input label="Fornecedor" name="fornecedor_nome" value={form.fornecedor_nome} onChange={handleChange} />
            <Input
            label="Objeto"
            name="objeto"
            value={form.objeto}
            onChange={handleChange}
            />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Início" name="vigencia_inicio" value={form.vigencia_inicio} onChange={handleChange} />
            <Input label="Fim" name="vigencia_fim" value={form.vigencia_fim} onChange={handleChange} />
          </div>

          <Input label="Valor Global" name="valor_global" value={form.valor_global} onChange={handleChange} />

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

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input {...props} className="w-full border rounded px-3 py-2" />
    </div>
  );
}