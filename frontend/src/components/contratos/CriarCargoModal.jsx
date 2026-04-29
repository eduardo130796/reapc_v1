import { useState, useEffect } from "react";
import { criarCargo } from "../../services/cargosService";
import cargosBaseService from "../../services/cargosBaseService";
import { listarSindicatos } from "../../services/sindicatosService";
import Modal from "../ui/Modal";
import {
  UserPlusIcon,
  HashtagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CriarCargoModal({ contratoId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    cargo_id: "",
    quantidade: "",
    sindicato_id: ""
  });
  const [loading, setLoading] = useState(false);

  const [cargosBase, setCargosBase] = useState([]);
  const [sindicatos, setSindicatos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [loadingSindicatos, setLoadingSindicatos] = useState(false);
  const [novoCargoMode, setNovoCargoMode] = useState(false);
  const [novoCargoNome, setNovoCargoNome] = useState("");
  const [criandoCargo, setCriandoCargo] = useState(false);

  useEffect(() => {
    loadCargos();
    loadSindicatos();
  }, []);

  const loadSindicatos = async () => {
    setLoadingSindicatos(true);

    try {
      const resp = await listarSindicatos();

      // 🔥 suporta ambos padrões (definitivo)
      const lista = Array.isArray(resp)
        ? resp
        : resp?.data || [];

      setSindicatos(lista);

    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar sindicatos.");
    } finally {
      setLoadingSindicatos(false);
    }
  };

  const loadCargos = async () => {
    setLoadingCargos(true);
    try {
      const resp = await cargosBaseService.listar();
      setCargosBase(resp?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar catálogo.");
    } finally {
      setLoadingCargos(false);
    }
  };

  const handleCriarCargoRapido = async () => {
    if (!novoCargoNome.trim()) return;
    setCriandoCargo(true);
    try {
      const novoCargo = await cargosBaseService.criar(novoCargoNome);
      setCargosBase(prev => [...prev, novoCargo]);
      setForm(prev => ({ ...prev, cargo_id: novoCargo.id }));
      setNovoCargoMode(false);
      setNovoCargoNome("");
      toast.success("Catálogo atualizado com novo cargo!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar cargo no catálogo.");
    } finally {
      setCriandoCargo(false);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!form.cargo_id || !form.quantidade) {
      return toast.error("Preencha todos os campos obrigatórios");
    }

    setLoading(true);
    try {
      const payload = {
        contrato_id: contratoId,
        cargo_id: form.cargo_id,
        quantidade: Number(form.quantidade),
        sindicato_id: form.sindicato_id || null
      };
      await criarCargo(payload);
      toast.success("Cargo criado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar cargo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Novo Cargo"
      footer={(
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-foreground transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
            Criar Cargo
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Catálogo de Cargos</label>
          <div className="relative">
            {!novoCargoMode ? (
              <>
                <UserPlusIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={form.cargo_id}
                  onChange={e => {
                    if (e.target.value === "NOVO_CARGO") {
                      setNovoCargoMode(true);
                      setForm({ ...form, cargo_id: "" });
                    } else {
                      setForm({ ...form, cargo_id: e.target.value });
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                >
                  <option value="">Selecione o cargo do catálogo...</option>
                  {loadingCargos && <option disabled>Carregando...</option>}
                  {cargosBase.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                  <option value="NOVO_CARGO" className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20">
                    + Adicionar Novo ao Catálogo
                  </option>
                </select>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={novoCargoNome}
                  onChange={e => setNovoCargoNome(e.target.value)}
                  placeholder="NOME DO NOVO CARGO"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-black text-sm uppercase"
                />
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCriarCargoRapido}
                    disabled={criandoCargo}
                    className="px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {criandoCargo ? "..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoCargoMode(false)}
                    className="px-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Sindicato Responsável</label>
          <div className="relative">
            <BuildingOfficeIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              name="sindicato_id"
              value={form.sindicato_id}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
            >
              <option value="">Selecione o sindicato...</option>

              {loadingSindicatos && (
                <option disabled>Carregando sindicatos...</option>
              )}

              {!loadingSindicatos && sindicatos.length === 0 && (
                <option disabled>Nenhum sindicato encontrado</option>
              )}

              {sindicatos.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sigla ? `${s.sigla} - ${s.nome}` : s.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Quantidade de Postos"
            name="quantidade"
            type="number"
            placeholder="0"
            value={form.quantidade}
            onChange={handleChange}
            icon={<HashtagIcon className="w-5 h-5" />}
          />
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">
            Dica: Após criar o cargo, você poderá configurar os percentuais e módulos específicos na tela de detalhes.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function Input({ label, icon, value, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          {...props}
          value={value ?? ""}
          className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
        />
      </div>
    </div>
  );
}