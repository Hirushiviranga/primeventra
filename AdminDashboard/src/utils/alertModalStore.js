let listener = null

export function registerAlertListener(fn) {
  listener = fn
}

// Global, imperative "OK" popup — usable from any component or plain handler
// (e.g. AdminContext.jsx) without prop drilling, similar to a toast singleton.
export function showAlert(message) {
  if (listener) listener(message)
  else window.alert(message)
}
