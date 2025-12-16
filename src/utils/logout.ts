export function logout() {
  localStorage.removeItem("token");
  // Opcional si almacenas más en localStorage:
  localStorage.removeItem("user");
  window.location.href = "/"; // o ruta de login
}
