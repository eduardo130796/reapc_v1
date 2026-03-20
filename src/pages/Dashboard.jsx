import MainLayout from "../layouts/MainLayout";
import { ArrowRightIcon, DocumentDuplicateIcon, DocumentTextIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Modelos PCFP",
    description: "Gerencie e organize modelos de planilha de forma eficiente.",
    icon: DocumentDuplicateIcon,
    to: "/modelos",
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Contratos",
    description: "Centralize e controle contratos com facilidade.",
    icon: DocumentTextIcon,
    to: "/contratos",
    color: "from-green-500 to-green-700",
  },
  {
    title: "Repactuações",
    description: "Calcule e visualize repactuações com praticidade.",
    icon: CalculatorIcon,
    to: "/repactuacoes",
    color: "from-purple-500 to-purple-700",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Painel Principal">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-[#22243a] mb-1 tracking-tight">
            Painel Principal
          </h1>
          <span className="text-blue-700/90 text-lg mt-1 block font-medium">
            Bem-vindo! Visualize resumos e acesse rapidamente os principais módulos do sistema.
          </span>
        </div>
        {/* Espaço para ações futuras: notificações, user menu, etc */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={f.title}
            onClick={() => f.to && navigate(f.to)}
            className={`
              group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br ${f.color}
              p-1.5 rounded-2xl overflow-hidden shadow-lg relative
              duration-200
            `}
          >
            <div className="bg-white rounded-2xl h-full w-full p-7 flex flex-col gap-5 relative z-10">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-tr from-white via-[#f6f8fd] to-[#ecf1fa] shadow-inner mb-2">
                <f.icon className="h-9 w-9 text-blue-600 group-hover:text-blue-800 transition" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#252a44] mb-0.5">{f.title}</h2>
                <p className="text-[#8ba5d2] text-[15.5px] mb-2">{f.description}</p>
              </div>
              <div className="flex items-center gap-1 text-blue-700 font-medium text-sm mt-auto">
                <span>Acessar</span>
                <ArrowRightIcon className="w-5 h-5 text-blue-700 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div
              className={`absolute opacity-10 blur-2xl rounded-full -right-10 top-8 w-56 h-40 pointer-events-none`}
              style={{ background: "linear-gradient(135deg, #93c5fd 20%, #2563eb 100%)" }}
            />
          </div>
        ))}
      </div>

      {/* Exemplo de cards secundários/resumo (total de usuários, etc.) */}
      {/* <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl shadow p-5 flex flex-col items-center">
          <span className="text-2xl font-semibold text-blue-700">8</span>
          <span className="text-[#6271a8] text-sm font-medium mt-1">Modelos cadastrados</span>
        </div>
        ...
      </div> */}
    </MainLayout>
  );
}