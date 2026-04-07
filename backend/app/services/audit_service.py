from app.database.client import supabase, supabase_admin


def registrar_log(user_id, action, entity, entity_id=None, payload=None):

    supabase.table("audit_logs").insert({
        "user_id": user_id,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "payload": payload or {}
    }).execute()