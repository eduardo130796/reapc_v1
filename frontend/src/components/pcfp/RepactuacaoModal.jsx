import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import NovaRepactuacao from "../contratos/repactuacoes/NovaRepactuacao";
import { buscarPCFP } from "../../services/pcfpService";
import { ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function RepactuacaoModal({ cargo, onClose, onSuccess }) {
  const [pcfp, setPcfp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await buscarPCFP(cargo.id);
        setPcfp(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cargo.id]);

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Nova Repactuação: ${cargo.cargos_base?.nome || cargo.nome}`}
      maxWidth="max-w-6xl"
    >
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando dados base...</p>
          </div>
        ) : !pcfp || !pcfp.estrutura ? (
          <div className="flex flex-col items-center justify-center py-20 bg-rose-50 dark:bg-rose-500/10 rounded-[40px] border-2 border-dashed border-rose-200 text-center px-10">
             <ExclamationCircleIcon className="w-16 h-16 text-rose-500 mb-4" />
             <h3 className="text-xl font-black text-rose-900 dark:text-rose-400">Cargo sem Estrutura Definida</h3>
             <p className="max-w-md text-sm font-bold text-rose-600 mt-2">
                Não é possível criar uma repactuação para um cargo que ainda não possui uma versão base configurada. Configure a PCFP primeiro.
             </p>
          </div>
        ) : (
          <NovaRepactuacao 
            cargoId={cargo.id}
            basePcfp={pcfp}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
}
