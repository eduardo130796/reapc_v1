import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarRepactuacoesCargo } from "../../services/repactuacoesService";
import { excluirCargo } from "../../services/cargosService";
import { toast } from "react-hot-toast";
import {
  UserCircleIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  PlusCircleIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

import PCFPModal from "../pcfp/PCFPModal";
import RepactuacaoModal from "../pcfp/RepactuacaoModal";

export default function CargosTable({
  cargos,
  onCriarCargo,
  loading,
  isAdmin,
  onRefresh
}) {

  // =========================
  // EMPTY STATE
  // =========================
  if (!loading && (!cargos || cargos.length === 0)) {
    return (
      <div className="bg-card border-2 border-dashed border-border rounded-[40px] p-20 text-center group hover:border-primary/30 transition-all duration-500">
        <div className="relative mb-8 inline-block">
          <UserGroupIcon className="w-24 h-24 text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-border">
              <ShoppingBagIcon className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-black text-foreground mb-2">Sem cargos definidos</h3>
        <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto mb-8">
          Este contrato ainda não possui cargos vinculados. Comece adicionando o primeiro cargo para iniciar os cálculos.
        </p>
        <button
          onClick={() => onCriarCargo?.()}
          className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-sm inline-flex items-center gap-2"
        >
          <UserCircleIcon className="w-5 h-5" />
          Configurar Primeiro Cargo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Labels (Desktop only) */}
      <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
        <div className="col-span-5">Cargo / Identificação</div>
        <div className="col-span-2 text-center">Qtde</div>
        <div className="col-span-2 text-center">Vlr. Unitário</div>
        <div className="col-span-2 text-right">Total Mensal</div>
        <div className="col-span-1"></div>
      </div>

      <div className="space-y-3">
        {cargos.map((c) => (
          <CargoRow
            key={c.id}
            cargo={c}
            isAdmin={isAdmin}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {/* TOTAL FOOTER */}
      {cargos.length > 0 && (
        <div className="flex justify-end pt-4 border-t-2 border-border">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Mensal (todos os cargos)</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {cargos.reduce((acc, c) => acc + (Number(c.quantidade || 0) * Number(c.valor_unitario || 0)), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// CARGO ROW COM ACCORDION
// ================================
function CargoRow({ cargo: c, isAdmin, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [repactuacoes, setRepactuacoes] = useState([]);
  const [loadingRep, setLoadingRep] = useState(false);
  const navigate = useNavigate();
  const [showPCFP, setShowPCFP] = useState(false);
  const [showRepactuacao, setShowRepactuacao] = useState(false);

  const total = (c.quantidade || 0) * (c.valor_unitario || 0);

  async function toggleOpen() {
    const nowOpen = !open;
    setOpen(nowOpen);

    if (nowOpen && repactuacoes.length === 0) {
      setLoadingRep(true);
      try {
        const res = await listarRepactuacoesCargo(c.id);
        setRepactuacoes(res?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRep(false);
      }
    }
  }

  async function handleExcluir(e) {
    e.stopPropagation();
    if (!confirm(`Excluir o cargo "${c.cargos_base?.nome || c.nome}"?`)) return;
    try {
      await excluirCargo(c.id);
      toast.success("Cargo removido");
      onRefresh?.();
    } catch (err) {
      toast.error("Erro ao excluir cargo");
    }
  }

  return (<>
    <div className={`
      bg-card border-2 rounded-3xl transition-all duration-300 overflow-hidden
      ${open ? "border-primary/40 shadow-2xl shadow-primary/5" : "border-border shadow-xl shadow-black/5"}
    `}>
      {/* HEADER DO CARGO (clicável) */}
      <div
        onClick={toggleOpen}
        className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-5 cursor-pointer group"
      >
        {/* Info Principal */}
        <div className="col-span-12 md:col-span-5 flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-colors shrink-0 ${open ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"}`}>
            <UserCircleIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-black text-foreground truncate tracking-tight uppercase">{c.cargos_base?.nome || c.nome}</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
              ID: {c.id?.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Quantidade */}
        <div className="col-span-4 md:col-span-2 text-left md:text-center">
          <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Quantidade</div>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-black text-xs border border-border">
            {c.quantidade} postos
          </span>
        </div>

        {/* Valor Unitário */}
        <div className="col-span-4 md:col-span-2 text-left md:text-center">
          <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Unitário</div>
          <span className="text-sm font-bold text-foreground">
            R$ {Number(c.valor_unitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Total */}
        <div className="col-span-4 md:col-span-2 text-right">
          <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Total Mensal</div>
          <span className="text-base font-black text-primary tracking-tight">
            R$ {Number(total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Chevron */}
        <div className="hidden md:flex col-span-1 justify-end">
          {open
            ? <ChevronUpIcon className="w-5 h-5 text-primary transition-all" />
            : <ChevronDownIcon className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all" />
          }
        </div>
      </div>

      {/* PAINEL EXPANDIDO */}
      {open && (
        <div className="border-t-2 border-border/50 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

          {/* BOTÕES DE AÇÃO */}
          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={<DocumentTextIcon className="w-4 h-4" />}
              label="Ver PCFP"
              color="slate"
              onClick={(e) => {
                e.stopPropagation();
                setShowPCFP(true);
              }}
            />
            <ActionButton
              icon={<PlusCircleIcon className="w-4 h-4" />}
              label="Nova Repactuação"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowRepactuacao(true);
              }}
            />
            {isAdmin && (
              <ActionButton
                icon={<TrashIcon className="w-4 h-4" />}
                label="Excluir Cargo"
                color="danger"
                onClick={handleExcluir}
              />
            )}
          </div>

          {/* HISTÓRICO DE REPACTUAÇÕES */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-4 h-4 text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Histórico de Repactuações
              </p>
            </div>

            {loadingRep ? (
              <div className="flex items-center gap-2 text-slate-400 py-3">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">Buscando histórico...</span>
              </div>
            ) : repactuacoes.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-border rounded-2xl opacity-50">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-bold text-slate-400">Nenhuma repactuação registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {repactuacoes.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="flex items-center justify-between bg-white dark:bg-slate-800 border border-border rounded-2xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-foreground">
                          {r.data_referencia
                            ? new Date(r.data_referencia).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                            : `Versão ${repactuacoes.length - i}`
                          }
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {r.descricao || "Repactuação registrada"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        R$ {Number(r.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <button
                        onClick={() => navigate(`/repactuacoes/${r.id}`)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        Ver detalhes <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 🔥 MODAL PCFP */}
      {showPCFP && (
        <PCFPModal
          cargo={c}
          onClose={() => setShowPCFP(false)}
          onSuccess={onRefresh}
        />
      )}
      {/* 🔥 MODAL REPACTUAÇÃO */}
      {showRepactuacao && (
        <RepactuacaoModal
          cargo={c}
          onClose={() => setShowRepactuacao(false)}
          onSuccess={() => {
            onRefresh?.();
            setOpen(false); // fecha o accordion para forçar reload do histórico
            setTimeout(toggleOpen, 100);
          }}
        />
      )}
    </div>
  </>
  );
}

function ActionButton({ icon, label, color, onClick }) {
  const colors = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700",
    primary: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border-rose-200 dark:border-rose-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-all active:scale-95 ${colors[color] || colors.slate}`}
    >
      {icon}
      {label}
    </button>
  );
}