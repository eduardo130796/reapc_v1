import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../services/usuariosService";
import { toast } from "react-hot-toast";
import { 
  UserIcon, 
  LockClosedIcon, 
  CheckCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState(user?.nome || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleUpdateProfile(e) {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      return toast.error("As senhas não coincidem");
    }

    setLoading(true);
    try {
      const payload = { nome };
      if (password) payload.password = password;

      const updatedUser = await updateProfile(payload);
      
      // Atualizar o contexto do usuário (o token deve continuar o mesmo)
      const token = localStorage.getItem("token");
      login({ user: { ...user, nome: updatedUser.nome }, token });

      toast.success("Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout title="Meu Perfil">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Header da Página */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Configurações de Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências de segurança.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Coluna da Esquerda: Resumo */}
          <div className="space-y-6">
            <div className="card-modern p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-primary/10">
                    {user?.nome?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-background rounded-lg shadow-md border border-border">
                    <CheckCircleIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground truncate w-full">
                  {user?.nome || "Completar Perfil"}
                </h2>
                <p className="text-sm text-muted-foreground truncate w-full mb-4">
                  {user?.email}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                  {user?.role || "Técnico"}
                </div>
            </div>

            <div className="card-modern bg-[#0f172a] p-6 text-white overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="relative z-10">
                <ShieldCheckIcon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-1 text-lg">Segurança Ativa</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sua conta está protegida por políticas de acesso baseadas em funções (RBAC) e criptografia avançada.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Formulário */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleUpdateProfile} className="card-modern border-none shadow-lg">
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Dados do Perfil
                </h3>
              </div>
              
              <div className="p-6 space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all outline-none text-foreground"
                    placeholder="Como deseja ser chamado?"
                    required
                  />
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-3 mb-6">
                    <LockClosedIcon className="h-5 w-5 text-primary" />
                    Segurança de Acesso
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all outline-none text-foreground"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all outline-none text-foreground"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 italic bg-muted/20 p-2 rounded-lg inline-block">
                    * Deixe os campos de senha em branco se não quiser alterá-la.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20
                    hover:bg-primary/90 hover:scale-[1.02] active:scale-95
                    transition-all flex items-center gap-2
                    ${loading ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
