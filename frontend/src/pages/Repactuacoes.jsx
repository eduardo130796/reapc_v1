import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { listarContratos } from "../services/contratosService";
import { listarCargos } from "../services/cargosService";
import { buscarPCFP } from "../services/pcfpService";
import NovaRepactuacao from "../components/contratos/repactuacoes/NovaRepactuacao";
import { 
  FolderOpenIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";

export default function Repactuacoes() {
  const [contratos, setContratos] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(true);
  const [busca, setBusca] = useState("");
  
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const [pcfp, setPcfp] = useState(null);
  const [loadingPcfp, setLoadingPcfp] = useState(false);

  // 1. CARREGAR CONTRATOS
  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarContratos();
        setContratos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContratos(false);
      }
    }
    carregar();
  }, []);

  // 2. FILTRAR CONTRATOS
  const contratosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return contratos.filter(c => 
      c.numero?.toLowerCase().includes(termo) || 
      c.fornecedor_nome?.toLowerCase().includes(termo)
    );
  }, [contratos, busca]);

  // 3. SELECIONAR CONTRATO -> CARREGAR CARGOS
  const handleSelectContrato = async (contrato) => {
    setContratoSelecionado(contrato);
    setLoadingCargos(true);
    try {
      const data = await listarCargos(contrato.id);
      setCargos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCargos(false);
    }
  };

  // 4. SELECIONAR CARGO -> CARREGAR PCFP BASE
  const handleSelectCargo = async (cargo) => {
    setCargoSelecionado(cargo);
    setLoadingPcfp(true);
    try {
      const data = await buscarPCFP(cargo.id);
      setPcfp(data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPcfp(false);
    }
  };

  return (
    <MainLayout title="Central de Repactuações">
      
      {/* NAVEGAÇÃO / BREADCRUMB SIMULADO */}
      <div className="mb-6 flex items-center gap-3">
        {contratoSelecionado && (
          <button 
            onClick={() => {
              setContratoSelecionado(null);
              setCargoSelecionado(null);
              setCargos([]);
            }}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {cargoSelecionado ? `Repactuando: ${cargoSelecionado.nome}` : 
             contratoSelecionado ? `Cargos do Contrato: ${contratoSelecionado.numero}` : 
             "Selecione um Contrato"}
          </h1>
          <p className="text-sm text-slate-500">
            {cargoSelecionado ? "Ajuste os valores para gerar uma nova versão de cálculo." :
             contratoSelecionado ? "Escolha o cargo que deseja reajustar." :
             "Escolha o contrato para listar os cargos disponíveis para repactuação."}
          </p>
        </div>
      </div>

      {/* ETAPA 1: SELECIONAR CONTRATO */}
      {!contratoSelecionado && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              placeholder="Buscar por número ou fornecedor..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-shadow"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {loadingContratos ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
             </div>
          ) : contratosFiltrados.length === 0 ? (
             <div className="bg-white border-2 border-dashed rounded-2xl p-12 text-center text-slate-400">
                Nenhum contrato encontrado com esses filtros.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contratosFiltrados.map(c => (
                <div 
                  key={c.id}
                  onClick={() => handleSelectContrato(c)}
                  className="bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FolderOpenIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contrato</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                    {c.numero || "Sem Número"}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{c.fornecedor_nome}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 2: SELECIONAR CARGO */}
      {contratoSelecionado && !cargoSelecionado && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
          {loadingCargos ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : cargos.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
              Este contrato não possui cargos cadastrados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cargos.map(cargo => (
                <div 
                  key={cargo.id}
                  onClick={() => handleSelectCargo(cargo)}
                  className="bg-white border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-sky-300 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-sky-50 rounded-lg text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase">Cargo Administrativo</span>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">
                        {cargo.nome}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-sm">
                    <span className="text-slate-400">Qtd: {cargo.quantidade}</span>
                    <span className="font-mono font-bold text-slate-700">R$ {Number(cargo.valor_unitario).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 3: REPACTUAÇÃO */}
      {cargoSelecionado && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {!pcfp ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              {loadingPcfp ? "Carregando estrutura do cargo..." : (
                <div className="flex flex-col items-center">
                  <DocumentDuplicateIcon className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500">Este cargo ainda não possui uma estrutura base (PCFP) configurada pelo administrador.</p>
                </div>
              )}
            </div>
          ) : (
            <NovaRepactuacao 
              cargoId={cargoSelecionado.id}
              basePcfp={pcfp}
              onCancel={() => setCargoSelecionado(null)}
              onSuccess={() => {
                setCargoSelecionado(null);
                setContratoSelecionado(null);
                // Feedback visual ou redirect opcional
              }}
            />
          )}
        </div>
      )}

    </MainLayout>
  );
}
