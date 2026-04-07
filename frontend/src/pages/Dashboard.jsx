import MainLayout from "../layouts/MainLayout";
import { 
  ArrowRightIcon, 
  DocumentDuplicateIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  UsersIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const features = [
  {
    title: "Modelos PCFP",
    description: "Gerencie e organize modelos de planilha de forma eficiente.",
    icon: DocumentDuplicateIcon,
    to: "/modelos",
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "Contratos",
    description: "Centralize e controle contratos com facilidade.",
    icon: DocumentTextIcon,
    to: "/contratos",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    title: "Repactuações",
    description: "Central de reajustes (CCT/IPCA) de cargos e contratos.",
    icon: CalculatorIcon,
    to: "/repactuacoes",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    title: "Usuários",
    description: "Gerencie usuários e acessos do sistema.",
    icon: UsersIcon,
    to: "/usuarios",
    color: "bg-violet-500",
    shadow: "shadow-violet-500/20",
  },
  {
    title: "Permissões",
    description: "Configure permissões e níveis de acesso.",
    icon: ShieldCheckIcon,
    to: "/roles",
    color: "bg-rose-500",
    shadow: "shadow-rose-500/20",
  },
];

function StatCard({ title, value, icon: Icon, trend, color }) {
  return (
    <div className="card-modern p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-current`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h4 className="text-2xl font-bold mt-1 text-foreground">{value}</h4>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "tecnico";
  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isTecnico = role === "tecnico";

  const filteredFeatures = features.filter(f => {
    if (isAdmin) return true;
    if (isGestor) return ["Modelos PCFP", "Contratos", "Repactuações"].includes(f.title);
    if (isTecnico) return ["Repactuações"].includes(f.title);
    return false;
  });

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8 pb-10">
        
        {/* HERO SECTION - Forced Dark Theme for high visibility */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 md:p-8 text-white shadow-2xl transition-all ring-1 ring-white/10">
          {/* Main Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-blue-600/30" />
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 animate-in fade-in slide-in-from-left-4 duration-500 text-white">
              Bem-vindo de volta, <br className="sm:hidden" />
              <span className="text-blue-200 drop-shadow-sm brightness-110">{user?.nome || "Usuário"}</span>! 👋
            </h2>
            <p className="text-slate-200/90 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
              {isAdmin 
                ? "Sua central estratégica para gestão de contratos e repactuações está pronta."
                : "Acompanhe seus contratos ativos e realize novas repactuações com facilidade."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate("/repactuacoes")}
                className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                Nova Repactuação
                <ArrowUpRightIcon className="w-4 h-4 text-indigo-600" />
              </button>
              {isAdmin && (
                <button 
                  onClick={() => navigate("/usuarios")}
                  className="px-6 py-2.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 active:scale-95"
                >
                  Gerenciar Acessos
                </button>
              )}
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 -mr-40 -mb-40 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl opacity-30" />
          <ChartBarIcon className="absolute right-10 bottom-10 w-64 h-64 text-white/5 opacity-10 pointer-events-none" />
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Contratos Ativos" 
            value="24" 
            icon={DocumentTextIcon} 
            trend={12} 
            color="text-emerald-500" 
          />
          <StatCard 
            title="Repactuações/Mês" 
            value="156" 
            icon={CalculatorIcon} 
            trend={5} 
            color="text-blue-500" 
          />
          <StatCard 
            title="Modelos Disponíveis" 
            value="12" 
            icon={DocumentDuplicateIcon} 
            color="text-amber-500" 
          />
          <StatCard 
            title="Acessos Hoje" 
            value="89" 
            icon={UsersIcon} 
            trend={-2} 
            color="text-indigo-500" 
          />
        </div>

        {/* FEATURE TOOLS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              Ferramentas de Gestão
            </h3>
            <p className="text-sm text-muted-foreground hidden sm:block">Acessos rápidos para sua rotina</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((f) => (
              <div
                key={f.title}
                onClick={() => f.to && navigate(f.to)}
                className="group card-modern p-6 cursor-pointer relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${f.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.1] transition-opacity`} />
                <div className={`absolute left-0 top-0 w-1 h-full ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-start justify-between mb-6">
                  <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${f.color} text-white shadow-xl ${f.shadow} group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {f.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY MOCK */}
        <div className="card-modern p-6">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                Atividade Recente
              </h3>
              <button className="text-sm text-primary font-semibold hover:underline">Ver tudo</button>
           </div>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-default">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate capitalize">Nova repactuação aprovada - Contrato #{1024 + i}</p>
                    <p className="text-xs text-muted-foreground">Há {i * 2} horas por Sistema</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg">Sucesso</span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </MainLayout>
  );
}