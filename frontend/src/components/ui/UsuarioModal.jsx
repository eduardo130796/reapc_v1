import { useState, useEffect } from "react";

export default function UsuarioModal({
  open,
  onClose,
  onSave,
  roles,
  initialData
}) {

  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    role_id: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome || "",
        email: initialData.email || "",
        password: "",
        role_id: initialData.role_id || ""
      });
    } else {
      setForm({
        nome: "",
        email: "",
        password: "",
        role_id: ""
      });
    }
  }, [initialData]);

  if (!open) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">

        <h2 className="text-xl font-semibold mb-6">
          {initialData ? "Editar usuário" : "Novo usuário"}
        </h2>

        <div className="flex flex-col gap-4">

          <input
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={!!initialData}
            className="border rounded-lg px-3 py-2"
          />

          {!initialData && (
            <input
              name="password"
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          )}

          <select
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Selecione a role</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

        </div>

        <div className="flex justify-end gap-2 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </div>

    </div>
  );
}