import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook to validate the root session on mount and periodically.  It
 * attempts to fetch `/api/root/session` with credentials.  If the
 * session is valid (HTTP 200), the hook sets `checking` to false and
 * allows the consuming component to render.  Otherwise it redirects
 * the user to the root authentication page.
 *
 * The hook automatically polls the session every 60 seconds after
 * the initial check passes.  Any subsequent failure will trigger a
 * redirect to `/root/auth`.
 *
 * @returns {Object} An object containing the `checking` flag.  When
 *   `checking` is true the session is still being validated.
 */
export function useRootSession() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Perform the initial session check on mount.
  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (!mounted) return;
        if (res.status === 200) {
          setChecking(false);
        } else {
          navigate("/root/auth", { replace: true });
        }
      } catch {
        navigate("/root/auth", { replace: true });
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Poll the session every 60 seconds after it has been verified.
  useEffect(() => {
    if (checking) return;
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (res.status !== 200) {
          navigate("/root/auth", { replace: true });
        }
      } catch {
        navigate("/root/auth", { replace: true });
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [checking, navigate]);

  return { checking };
}