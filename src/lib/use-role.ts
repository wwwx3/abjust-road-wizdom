import { useEffect, useState } from "react";

const KEY = "abjust.role";
export type Role = "citizen" | "officer" | null;

export function useRole(): [Role, (r: Role) => void] {
  const [role, setRoleState] = useState<Role>(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as Role;
      if (v) setRoleState(v);
    } catch {}
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      if (r) localStorage.setItem(KEY, r);
      else localStorage.removeItem(KEY);
    } catch {}
  };
  return [role, setRole];
}
