import React, { useEffect, useState, useCallback, memo } from "react";
import { extrairParametrosAgrupados } from "../../services/parametrosService";
import { calcularPCFP } from "../../services/pcfpService";

// =========================
// INPUT (FORA DO COMPONENTE)
// =========================
const InputParametro = memo(function InputParametro({ item, valor, onChange }) {

  const isPercent = item.chave.startsWith("perc_");

  return (
    <div className="flex flex-col">

      <label className="text-xs text-slate-500 mb-1">
        {item.nome}
      </label>

      <div className="relative">

        <input
          type="number"
          value={valor ?? ""}
          onChange={(e) => onChange(item.chave, e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {isPercent && (
          <span className="absolute right-2 top-2 text-sm text-slate-400">
            %
          </span>
        )}

      </div>

    </div>
  );
});

// =========================
// COMPONENTE PRINCIPAL
// =========================
export default function ParametrosDinamicos({ pcfp, onCalculo, cargoId }) {

  const STORAGE_KEY = `pcfp_rascunho_${cargoId}`;

  const [grupos, setGrupos] = useState([]);
  const [valores, setValores] = useState({});
  const [loading, setLoading] = useState(false);

  // LOAD PARAMETROS
  useEffect(() => {
    if (!pcfp?.estrutura) return;
    setGrupos(extrairParametrosAgrupados(pcfp.estrutura));
  }, [pcfp]);

  // LOAD RASCUNHO
  useEffect(() => {
    if (!cargoId) return;

    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      setValores(salvo ? JSON.parse(salvo) : {});
    } catch {
      setValores({});
    }
  }, [cargoId]);

  // AUTO SAVE
  useEffect(() => {
    if (!cargoId) return;

    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valores));
    }, 200);

    return () => clearTimeout(id);
  }, [valores, cargoId]);

  // NORMALIZAÇÃO
  const normalizarParaEnvio = useCallback((vals) => {

    const normalizado = {};

    for (const [chave, valor] of Object.entries(vals)) {

      const numero = Number(valor);

      if (isNaN(numero)) {
        normalizado[chave] = 0;
        continue;
      }

      normalizado[chave] = chave.startsWith("perc_")
        ? numero / 100
        : numero;
    }

    return normalizado;

  }, []);

  // CHANGE
  const handleChange = useCallback((chave, valor) => {

    setValores(prev => {
      if (prev[chave] === valor) return prev;
      return { ...prev, [chave]: valor };
    });

  }, []);

  // VALIDAR
  const validar = useCallback(() => {

    const faltando = [];

    grupos.forEach(modulo => {

      modulo.itens?.forEach(i => {
        if (valores[i.chave] === undefined || valores[i.chave] === "") {
          faltando.push(i.nome);
        }
      });

      modulo.submodulos?.forEach(sub => {
        sub.itens?.forEach(i => {
          if (valores[i.chave] === undefined || valores[i.chave] === "") {
            faltando.push(i.nome);
          }
        });
      });

    });

    return faltando;

  }, [grupos, valores]);

  // CALCULAR
  async function handleCalcular() {

    const faltando = validar();

    if (faltando.length) {
      alert("Preencha todos os parâmetros obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const payload = normalizarParaEnvio(valores);

      const resultado = await calcularPCFP(
        cargoId,
        pcfp.estrutura,
        payload
      );

      onCalculo?.(resultado);

    } catch (err) {
      console.error(err);
      alert("Erro ao calcular");
    } finally {
      setLoading(false);
    }
  }

  // LIMPAR
  const limparRascunho = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setValores({});
  }, [STORAGE_KEY]);

  // =========================
  // UI
  // =========================
  return (

    <div className="space-y-6">

      {grupos.map((modulo, i) => (

        <div key={`mod_${i}_${modulo.nome}`} className="border rounded-xl overflow-hidden">

          <div className="bg-slate-100 px-4 py-2 font-semibold text-sm">
            {modulo.nome}
          </div>

          <div className="p-4 space-y-6">

            {modulo.itens?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {modulo.itens.map((item, idx) => (
                  <InputParametro
                    key={`item_${item.chave}_${i}_${idx}`}
                    item={item}
                    valor={valores[item.chave]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            )}

            {modulo.submodulos?.map((sub, sIdx) => (

              sub.itens?.length > 0 && (

                <div key={`sub_${sub.nome}_${sIdx}`} className="border rounded-lg p-3">

                  <div className="text-sm font-medium mb-3 text-slate-700">
                    {sub.nome}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {sub.itens.map((item, idx) => (
                      <InputParametro
                        key={`subitem_${item.chave}_${sub.nome}_${sIdx}_${idx}`}
                        item={item}
                        valor={valores[item.chave]}
                        onChange={handleChange}
                      />
                    ))}

                  </div>

                </div>

              )

            ))}

          </div>

        </div>

      ))}

      <div className="flex justify-between items-center pt-4">

        <button
          onClick={limparRascunho}
          className="text-sm text-red-500 hover:underline"
        >
          Limpar rascunho
        </button>

        <button
          onClick={handleCalcular}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>

      </div>

    </div>
  );
}