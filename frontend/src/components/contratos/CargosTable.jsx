import { useEffect, useState } from "react";
import { listarCargos } from "../../services/cargosService";

export default function CargosTable({
  cargos,
  onSelectCargo,
  onCriarCargo,
  onImportarCargo,
  loading
}) {

  // =========================
  // EMPTY STATE (CRÍTICO)
  // =========================

  if (!loading && (!cargos || cargos.length === 0)) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center">

        <p className="text-slate-500 mb-4">
          Nenhum cargo cadastrado para este contrato
        </p>

        <div className="flex justify-center gap-2">

          <button
            onClick={() => onCriarCargo?.()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Criar cargo
          </button>

          <button
            onClick={() => onImportarCargo?.()}
            className="px-4 py-2 border rounded-lg"
          >
            Importar cargos
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // TABLE
  // =========================

  return (
    <div className="bg-white rounded-xl border overflow-hidden">

      <table className="w-full">

        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            <th className="p-3 text-left">Cargo</th>
            <th className="p-3 text-left">Quantidade</th>
            <th className="p-3 text-left">Salário</th>
            <th className="p-3 text-left">Total</th>
          </tr>
        </thead>

        <tbody>

          {cargos.map((c) => {
            const total = (c.quantidade || 0) * (c.valor_unitario || 0);

            return (
              <tr
                key={c.id}
                onClick={() => onSelectCargo?.(c)}
                className="cursor-pointer hover:bg-blue-50"
              >

                <td className="p-3">{c.nome}</td>

                <td className="p-3">{c.quantidade}</td>

                <td className="p-3">
                  R$ {Number(c.valor_unitario || 0).toLocaleString("pt-BR")}
                </td>

                <td className="p-3 font-medium">
                  R$ {Number(total).toLocaleString("pt-BR")}
                </td>

              </tr>
            );

          })}

        </tbody>

      </table>

    </div>
  );
}