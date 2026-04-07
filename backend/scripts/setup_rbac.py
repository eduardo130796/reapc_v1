from app.database.client import supabase_admin as supabase
import uuid

def setup_rbac():
    print("--- INICIANDO SETUP DE RBAC NO SUPABASE ---")

    # 1. CRIAR ROLES
    roles_to_create = ["admin", "gestor", "tecnico"]
    role_map = {}

    for r_name in roles_to_create:
        res = supabase.table("roles").select("id").eq("name", r_name).execute()
        if not res.data:
            new_role = supabase.table("roles").insert({"name": r_name}).execute().data[0]
            role_map[r_name] = new_role["id"]
            print(f"Role '{r_name}' criada.")
        else:
            role_map[r_name] = res.data[0]["id"]
            print(f"Role '{r_name}' já existe.")

    # 2. CRIAR PERMISSÕES
    permissions = [
        {"resource": "usuarios", "action": "gerenciar"},
        {"resource": "contratos", "action": "cadastro"},
        {"resource": "pcfp", "action": "configurar"},
        {"resource": "pcfp", "action": "reajustar"},
        {"resource": "modelos", "action": "gerenciar"},
        {"resource": "*", "action": "*"} # Wildcard opcional
    ]

    perm_map = {}
    for p in permissions:
        key = f"{p['resource']}.{p['action']}"
        res = supabase.table("permissions").select("id").eq("resource", p["resource"]).eq("action", p["action"]).execute()
        if not res.data:
            new_p = supabase.table("permissions").insert(p).execute().data[0]
            perm_map[key] = new_p["id"]
            print(f"Permissão '{key}' criada.")
        else:
            perm_map[key] = res.data[0]["id"]
            print(f"Permissão '{key}' já existe.")

    # 3. VINCULAR PERMISSÕES
    print("Vinculando permissões...")
    
    # Limpa vínculos antigos para garantir consistência (opcional, mas seguro para setup)
    # supabase.table("role_permissions").delete().neq("id", 0).execute() # Cuidado: apaga tudo

    def grant(role_name, resource, action):
        r_id = role_map[role_name]
        p_id = perm_map[f"{resource}.{action}"]
        # Verifica se já existe
        exists = supabase.table("role_permissions").select("*").eq("role_id", r_id).eq("permission_id", p_id).execute()
        if not exists.data:
            supabase.table("role_permissions").insert({"role_id": r_id, "permission_id": p_id}).execute()

    # ADMIN: TUDO
    for p_key in perm_map:
        res, act = p_key.split(".")
        grant("admin", res, act)

    # GESTOR: Cadastro, PCFP Config, Reajuste, Modelos
    grant("gestor", "contratos", "cadastro")
    grant("gestor", "pcfp", "configurar")
    grant("gestor", "pcfp", "reajustar")
    grant("gestor", "modelos", "gerenciar")

    # TECNICO: Apenas Reajuste
    grant("tecnico", "pcfp", "reajustar")

    # 4. ATUALIZAR USUÁRIOS ATUAIS PARA ADMIN (Para o USER não perder acesso)
    print("Atualizando todos os usuários para o perfil 'admin' para testes iniciais...")
    supabase.table("usuarios").update({"role_id": role_map["admin"]}).neq("id", "00000000-0000-0000-0000-000000000000").execute()

    print("--- SETUP CONCLUÍDO COM SUCESSO ---")

if __name__ == "__main__":
    setup_rbac()
