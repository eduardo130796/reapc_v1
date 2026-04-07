import CargosTable from "./CargosTable";
import ParametrosTable from "./ParametrosTable";

export default function ContratoTabs({ aba, setAba, contratoId }) {

  return (

    <div>

      {/* MENU */}
      <div className="flex gap-6 border-b mb-6">

        {[
          { key: "cargos", label: "Cargos" },
          { key: "planilha", label: "Planilha" },
          { key: "parametros", label: "Parâmetros" }
        ].map(tab => (

          <button
            key={tab.key}
            onClick={() => setAba(tab.key)}
            className={`
              pb-2
              ${aba === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500"}
            `}
          >
            {tab.label}
          </button>

        ))}

      </div>

      {/* CONTEÚDO */}

      {aba === "cargos" && <CargosTable contratoId={contratoId} />}

      {aba === "planilha" && (
        <div className="p-6 text-slate-500">
          (em breve) planilha PCFP
        </div>
      )}

      {aba === "parametros" && <ParametrosTable />}

    </div>
  );
}