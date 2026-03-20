export default function ContratoHeader({ contrato }) {

  return (

    <div className="mb-6">

      <h1 className="text-2xl font-bold">
        Contrato {contrato.numero}
      </h1>

      <p className="text-slate-500">
        {contrato.fornecedor_nome}
      </p>

    </div>

  )

}