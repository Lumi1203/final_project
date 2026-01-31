import { useEffect } from "react";
import { unstable_useBlocker as useBlocker } from "react-router-dom";

export function usePreventNavigation(when) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (when) {
        e.preventDefault();
        e.returnValue = "Your test is not submitted yet!";
        return "Your test is not submitted yet!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);

  // React Router navigation blocker
  const blocker = useBlocker(when);
  useEffect(() => {
    if (!blocker) return;
    if (blocker.state === "blocked") {
      const ok = window.confirm("Your test is not submitted yet. Are you sure you want to leave?");
      if (ok) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
}
