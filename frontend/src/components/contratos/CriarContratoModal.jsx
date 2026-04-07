export default function CriarContratoModal({ onClose }) {

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl p-6 w-[500px]">

        <h2 className="text-lg font-semibold mb-4">
          Novo contrato
        </h2>

        <p className="text-slate-500 mb-4">
          Cadastro manual de contrato
        </p>

        <div className="flex justify-end">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Fechar
          </button>

        </div>

      </div>

    </div>

  )

}