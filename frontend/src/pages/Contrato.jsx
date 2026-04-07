import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import CargoDetalhe from "../components/contratos/CargoDetalhe";
import MainLayout from "../layouts/MainLayout"
import CriarCargoModal from "../components/contratos/CriarCargoModal";
import ContratoHeader from "../components/contratos/ContratoHeader"
import ContratoTabs from "../components/contratos/ContratoTabs"
import CargosTable from "../components/contratos/CargosTable";
import ContratoResumo from "../components/contratos/ContratoResumo";
import { buscarContrato } from "../services/contratosService"
import { listarCargos } from "../services/cargosService";
import { useAuth } from "../contexts/AuthContext";

export default function Contrato() {

  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.permissions?.includes("*");

  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const [showCriarCargo, setShowCriarCargo] = useState(false);
  const [cargos, setCargos] = useState([]);

  // =========================
  // CARREGAR CONTRATO
  // =========================

  useEffect(() => {

    async function carregarContrato() {
      if (!id) return;

      try {
        const data = await buscarContrato(id);
        setContrato(data || null);
      } catch (e) {
        console.error("Erro ao carregar contrato:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarContrato();

  }, [id]);

  // =========================
  // CARREGAR CARGOS
  // =========================

  const carregarCargos = async () => {
    if (!contrato?.id) return;

    try {
      const data = await listarCargos(contrato.id);
      setCargos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarCargos();
  }, [contrato]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-slate-500">
          Carregando contrato...
        </div>
      </MainLayout>
    );
  }

  if (!contrato) {
    return (
      <MainLayout>
        <div className="p-10 text-slate-500">
          Contrato não encontrado
        </div>
      </MainLayout>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <MainLayout>

      <ContratoResumo contrato={contrato} />

      {/* HEADER DE CARGOS (sempre aparece) */}
      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold text-slate-800">
          Cargos
        </h2>

        {/* BOTÃO SUTIL (quando já tem cargos) */}
        {isAdmin && cargos.length > 0 && (
          <button
            onClick={() => setShowCriarCargo(true)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg"
          >
            + Novo cargo
          </button>
        )}

      </div>

      {/* EMPTY STATE (BONITO E CENTRAL) */}
      {(cargos.length === 0 && !loading) ? (
        <div className="bg-white border rounded-xl p-12 text-center">

          <p className="text-slate-500 mb-4">
            Nenhum cargo cadastrado para este contrato
          </p>

          {isAdmin && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowCriarCargo(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                Criar primeiro cargo
              </button>

              <button
                className="px-5 py-2 border rounded-lg"
              >
                Importar
              </button>
            </div>
          )}

        </div>
      ) : (

        <CargosTable
          cargos={cargos}
          onSelectCargo={setCargoSelecionado}
          loading={loading}
        />

      )}

      {/* DETALHE DO CARGO */}
      {cargoSelecionado && (
        <CargoDetalhe cargo={cargoSelecionado} />
      )}

      {/* MODAL */}
      {showCriarCargo && (
        <CriarCargoModal
          contratoId={contrato.id}
          onClose={() => setShowCriarCargo(false)}
          onSuccess={carregarCargos}
        />
      )}

    </MainLayout>
  );
}