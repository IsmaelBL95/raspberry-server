// src/hooks/useIdentitySession.js
import { useCallback, useEffect, useState } from "react";

export function useIdentitySession() {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/identities/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        const data = await response.json();
        setIdentity(data);
      } else {
        setIdentity(null);
      }
    } catch {
      setIdentity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/identities/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // no-op
    } finally {
      setIdentity(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    identity,
    loading,
    isAuthenticated: Boolean(identity),
    refresh,
    logout,
  };
}