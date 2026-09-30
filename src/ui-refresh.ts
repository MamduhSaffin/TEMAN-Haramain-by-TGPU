type RefreshHandler = () => void;

const listeners = new Set<RefreshHandler>();
let scheduled = false;
let secondPassTimer: number | null = null;

function flush() {
  scheduled = false;
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('[TEMAN] UI refresh failed', error);
    }
  });
}

export function requestTemanUiRefresh() {
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(flush);
  }

  // React effects such as html lang/dir updates may land just after the first frame.
  // One delayed pass keeps labels in sync without continuously observing the DOM.
  if (secondPassTimer !== null) window.clearTimeout(secondPassTimer);
  secondPassTimer = window.setTimeout(() => {
    secondPassTimer = null;
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(flush);
    }
  }, 80);
}

export function onTemanUiRefresh(handler: RefreshHandler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function initTemanUiRefresh() {
  const schedule = () => requestTemanUiRefresh();

  // User-driven events cover React page changes, language/city changes,
  // profile saves, emergency selections, and form actions without DOM polling.
  document.addEventListener('click', schedule, { passive: true });
  document.addEventListener('change', schedule, { passive: true });
  window.addEventListener('online', schedule, { passive: true });
  window.addEventListener('offline', schedule, { passive: true });
  window.addEventListener('pageshow', schedule, { passive: true });
  window.addEventListener('storage', schedule);
  document.addEventListener('visibilitychange', schedule, { passive: true });

  requestTemanUiRefresh();
}
