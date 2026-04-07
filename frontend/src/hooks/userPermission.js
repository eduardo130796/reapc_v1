import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

// normaliza igual usamos antes
function normalize(p) {
  if (!p) return null;

  if (typeof p === "string") return p;

  if (p.name) return p.name;

  if (p.resource && p.action) {
    return `${p.resource}.${p.action}`;
  }

  return null;
}

export function usePermission() {

  const { user } = useAuth();

  const permissions = useMemo(() => {

    if (!user?.permissions) return [];

    return user.permissions
      .map(normalize)
      .filter(Boolean);

  }, [user]);

  function can(resource, action) {

    if (!permissions.length) return false;

    // 🔥 wildcard (*)
    if (permissions.includes("*")) return true;

    const key = `${resource}.${action}`;

    return permissions.includes(key);

  }

  return {
    can,
    permissions
  };
}