import { useEffect, useState } from "react";
import { buscarPCFP } from "../../services/pcfpService";
import { useAuth } from "../../contexts/AuthContext";

import EstruturaPCFP from "./EstruturaPCFP";
import RepactuacaoLista from "./repactuacoes/RepactuacaoLista";

export default function CargoDetalhe({ cargo }) {
  const { user } = useAuth();
  const role = user?.role || "tecnico";
  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isTecnico = role === "tecnico";

  const [aba, setAba] = useState(isTecnico ? "repactuacoes" : "estrutura");
  const [pcfp, setPcfp] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    try {
      const data = await buscarPCFP(cargo.id);
      setPcfp(data || null);
    } catch {
      setPcfp(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [cargo.id]);

  const temEstrutura = !!pcfp?.estrutura;
  const calculado = !!pcfp?.bloqueado;

  return (
    <div className="mt-6 bg-white border rounded-xl p-6">

      {/* HEADER PROFISSIONAL */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h3 className="text-lg font-semibold">{cargo.nome}</h3>
          <p className="text-sm text-slate-500">
            { !temEstrutura && "Não configurado" }
            { temEstrutura && !calculado && "Configurado (editável)" }
            { calculado && "Calculado e bloqueado" }
          </p>
        </div>

        {calculado && (
          <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
            Bloqueado
          </span>
        )}

      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        {[
          !isTecnico && { key: "estrutura", label: "Estrutura" },
          { key: "repactuacoes", label: "Repactuações", disabled: !temEstrutura }
        ].filter(Boolean).map(tab => (
          <button
            key={tab.key}
            disabled={tab.disabled}
            onClick={() => setAba(tab.key)}
            className={`pb-2 text-sm font-medium transition-colors ${
              aba === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}

      {loading && <div>Carregando...</div>}

      {!loading && aba === "estrutura" && !isTecnico && (
        <EstruturaPCFP
          structure={pcfp?.estrutura}
          onSave={async (novaEstrutura) => {
            const { salvarEstruturaPCFP } = await import("../../services/pcfpService");
            await salvarEstruturaPCFP({
              cargo_id: cargo?.id,
              estrutura: novaEstrutura
            });
            carregar();
          }}
          readOnly={isGestor && calculado}
        />
      )}

      {aba === "repactuacoes" && (
        <RepactuacaoLista
           cargoId={cargo.id}
           basePcfp={pcfp}
        />
      )}

    </div>
  );
}