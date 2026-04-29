import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
    buscarCCT,
    listarItens,
    adicionarItem,
    listarValores,
    adicionarValor
} from "../services/cctService";
import CCTHeader from "../components/cct/CCTHeader";
import CCTItensTable from "../components/cct/CCTItensTable";
import CCTItemModal from "../components/cct/CCTItemModal";
import CCTValoresTable from "../components/cct/CCTValoresTable";
import CCTValorModal from "../components/cct/CCTValorModal";
import {
    ArrowPathIcon,
    ChevronLeftIcon,
    ListBulletIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CCT() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cct, setCct] = useState(null);
    const [itens, setItens] = useState([]);
    const [valores, setValores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("itens"); // "itens" | "valores"

    // Modals
    const [modalItemOpen, setModalItemOpen] = useState(false);
    const [modalValorOpen, setModalValorOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const carregarDados = useCallback(async () => {
        if (!id) return; // 🔥 ESSENCIAL

        setLoading(true);
        try {
            const [cctData, itensData, valoresData] = await Promise.all([
                buscarCCT(id),
                listarItens(id),
                listarValores(id)
            ]);

            setCct(cctData?.data || null);
            setItens(itensData?.data || []);
            setValores(valoresData?.data || []);
        } catch (err) {
            toast.error("Erro ao carregar dados da CCT");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const handleAddItem = async (payload) => {
        setSubmitting(true);
        try {
            await adicionarItem(id, payload);
            toast.success("Item adicionado!");
            setModalItemOpen(false);
            carregarDados();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : "Erro ao adicionar item");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddValor = async (payload) => {
        setSubmitting(true);
        try {
            await adicionarValor(id, payload);
            toast.success("Valor vinculado!");
            setModalValorOpen(false);
            carregarDados();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : "Erro ao vincular valor");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !cct) {
        return (
            <MainLayout title="Carregando...">
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <ArrowPathIcon className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-black text-slate-400">Sincronizando dados da CCT...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={`CCT: ${cct?.numero_registro || cct?.sindicato?.nome || cct?.sindicato_cnpj}`}>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">

                {/* VOLTAR */}
                <button
                    onClick={() => navigate("/ccts")}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest group"
                >
                    <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Biblioteca
                </button>

                {/* HEADER */}
                <CCTHeader cct={cct} />

                {/* TABS */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl w-fit shadow-inner">
                        <button
                            onClick={() => setActiveTab("itens")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all
                                ${activeTab === "itens" ? "bg-card text-primary shadow-lg ring-1 ring-border" : "text-slate-400 hover:text-foreground"}`}
                        >
                            <ListBulletIcon className="w-5 h-5" />
                            Itens de Cálculo
                        </button>
                        <button
                            onClick={() => setActiveTab("valores")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all
                                ${activeTab === "valores" ? "bg-card text-primary shadow-lg ring-1 ring-border" : "text-slate-400 hover:text-foreground"}`}
                        >
                            <CurrencyDollarIcon className="w-5 h-5" />
                            Valores por Cargo
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === "itens" ? (
                            <CCTItensTable
                                itens={itens}
                                onAdd={() => setModalItemOpen(true)}
                            />
                        ) : (
                            <CCTValoresTable
                                valores={valores}
                                itens={itens}
                                onAdd={() => setModalValorOpen(true)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <CCTItemModal
                open={modalItemOpen}
                onClose={() => setModalItemOpen(false)}
                onSave={handleAddItem}
                loading={submitting}
                itensExistentes={itens}
            />

            <CCTValorModal
                open={modalValorOpen}
                onClose={() => setModalValorOpen(false)}
                onSave={handleAddValor}
                loading={submitting}
                itens={itens}
            />
        </MainLayout>
    );
}
