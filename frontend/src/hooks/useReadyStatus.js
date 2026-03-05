import { useEffect, useState } from "react";

/**
 * Hook to poll the readiness of the backend and its MongoDB connection.
 * When active, it fetches `/api/ready` and expects a JSON response
 * containing a `mongo` property with values `"up"` or `"down"`.
 * The status is stored in state and updated every 30 seconds.  Any
 * network errors or unexpected responses set the status to `"down"`.
 *
 * @param {boolean} active Whether polling should start.  Typically
 *   this is tied to session validation; if the session is still
 *   checking, readiness polling can be deferred.
 * @returns {Object} An object containing the `mongoStatus` string.
 */
export function useReadyStatus(active) {
  const [mongoStatus, setMongoStatus] = useState("unknown");

  useEffect(() => {
    if (!active) return;

    const checkReady = async () => {
      try {
        const res = await fetch("/api/ready", { credentials: "include" });
        const data = await res.json();
        // Expected shape: { status: "ok"|"degraded", mongo: "up"|"down" }
        if (data?.mongo === "up" || data?.mongo === "down") {
          setMongoStatus(data.mongo);
        } else {
          setMongoStatus("unknown");
        }
      } catch {
        setMongoStatus("down");
      }
    };

    // Perform initial check immediately.
    checkReady();
    const intervalId = setInterval(checkReady, 30 * 1000);
    return () => clearInterval(intervalId);
  }, [active]);

  return { mongoStatus };
}