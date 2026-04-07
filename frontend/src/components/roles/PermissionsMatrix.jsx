export default function PermissionsMatrix({
  permissions = [],
  selected = [],
  onChange
}) {

  // =========================
  // NORMALIZAÇÃO
  // =========================

  function normalize(p) {
    if (!p) return null;

    if (typeof p === "string") return p;

    if (p.name) return p.name;

    if (p.resource && p.action) {
      return `${p.resource}.${p.action}`;
    }

    console.warn("Permissão inválida:", p);
    return null;
  }

  // =========================
  // GROUPING
  // =========================

  const grouped = permissions
    .map(normalize)
    .filter(Boolean)
    .reduce((acc, key) => {

      const [resource, action] = key.split(".");

      if (!resource || !action) return acc;

      if (!acc[resource]) acc[resource] = [];

      if (!acc[resource].includes(action)) {
        acc[resource].push(action);
      }

      return acc;

    }, {});

  // =========================
  // TOGGLE
  // =========================

  function toggle(key) {
    if (selected.includes(key)) {
      onChange(selected.filter(i => i !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6 max-h-[400px] overflow-auto pr-2">

      {Object.entries(grouped).map(([resource, actions]) => (

        <div key={resource} className="border-b pb-4">

          <div className="flex justify-between items-center mb-2">

            <h3 className="font-semibold text-slate-700 capitalize">
              {resource}
            </h3>

            {/* selecionar tudo */}
            <button
              onClick={() => {

                const allKeys = actions.map(a => `${resource}.${a}`);

                const allSelected = allKeys.every(k => selected.includes(k));

                if (allSelected) {
                  onChange(selected.filter(s => !allKeys.includes(s)));
                } else {
                  onChange([...new Set([...selected, ...allKeys])]);
                }

              }}
              className="text-xs text-blue-600 hover:underline"
            >
              selecionar tudo
            </button>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

            {actions.map(action => {

              const key = `${resource}.${action}`;

              return (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(key)}
                    onChange={() => toggle(key)}
                    className="accent-blue-600"
                  />
                  {action}
                </label>
              );

            })}

          </div>

        </div>

      ))}

    </div>
  );
}