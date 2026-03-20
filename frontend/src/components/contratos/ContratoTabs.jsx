import CargosList from "../cargos/CargosList"

export default function ContratoTabs({ aba, setAba, contratoId }) {

  return (

    <div className="mt-6">

      {/* TABS */}
      <div className="flex gap-2 border-b mb-4">

        <button
          onClick={() => setAba("cargos")}
          className={`px-4 py-2 ${
            aba === "cargos" ? "border-b-2 border-blue-600 font-semibold" : ""
          }`}
        >
          Cargos
        </button>

        <button
          onClick={() => setAba("pcfp")}
          className={`px-4 py-2 ${
            aba === "pcfp" ? "border-b-2 border-blue-600 font-semibold" : ""
          }`}
        >
          PCFP
        </button>

      </div>

      {/* CONTEÚDO */}

      {aba === "cargos" && (
        <CargosList contratoId={contratoId} />
      )}

      {aba === "pcfp" && (
        <div className="p-6 text-slate-500">
          (Em breve PCFP por cargo)
        </div>
      )}

    </div>
  )
}