export default function Loader({ text = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      {text}
    </div>
  );
}