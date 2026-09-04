import { ADMIN_GOOGLE_EMAIL } from "@/lib/admin-auth-config";

export const adminCopy = {
  brand: "Explora School & Club",
  panelName: "Panel de gestión",
  accessEyebrow: "Acceso corporativo",
  accessTitle: "Entrada al panel",
  accessLead:
    "Espacio reservado al equipo de Explora. Identifícate con la cuenta de Google autorizada para gestionar reservas, contactos y contenidos.",
  accessHint: "Solo personal autorizado de Explora School & Club",
  googleButton: "Entrar con Google",
  googleButtonLoading: "Conectando con Google…",
  googleButtonVerifying: "Verificando acceso…",
  googleFooter:
    "Se abrirá la ventana segura de Google. Usa únicamente la cuenta corporativa de Explora.",
  authorizedAccount: ADMIN_GOOGLE_EMAIL,
  checkingSession: "Comprobando tu sesión…",
  welcomeBack: "Acceso correcto. Abriendo el panel…",
  logout: "Cerrar sesión",
  loggedInAs: "Sesión activa",
  location: "Sierra Nevada · Granada",
  errors: {
    firebaseMissing:
      "El acceso con Google no está disponible en este entorno. Revisa la configuración de Firebase.",
    unauthorizedEmail: `Esta cuenta no tiene permiso. El panel solo admite ${ADMIN_GOOGLE_EMAIL}.`,
    unverifiedEmail: "Tu cuenta de Google debe tener el correo verificado para entrar.",
    tokenInvalid: "No hemos podido validar la identidad. Vuelve a intentarlo.",
    authUnavailable: "El servicio de acceso no está disponible ahora mismo. Inténtalo en unos minutos.",
    verifyFailed: "No hemos podido completar el acceso con Google. Inténtalo de nuevo.",
    domainUnauthorized:
      "Este dominio no está autorizado para el acceso corporativo. Contacta con el equipo técnico de Explora.",
    popupBlocked:
      "El navegador ha bloqueado la ventana de Google. Permite ventanas emergentes e inténtalo otra vez.",
    generic: "No se ha podido iniciar sesión. Inténtalo de nuevo.",
    redirectRecover: "No hemos podido recuperar la sesión de Google. Vuelve a entrar.",
  },
} as const;

export type AdminApiErrorCode =
  | "firebase_missing"
  | "unauthorized_email"
  | "unverified_email"
  | "token_invalid"
  | "auth_unavailable"
  | "verify_failed";

export function adminErrorMessage(code: string | undefined, fallback?: string): string {
  switch (code) {
    case "firebase_missing":
      return adminCopy.errors.firebaseMissing;
    case "unauthorized_email":
      return adminCopy.errors.unauthorizedEmail;
    case "unverified_email":
      return adminCopy.errors.unverifiedEmail;
    case "token_invalid":
      return adminCopy.errors.tokenInvalid;
    case "auth_unavailable":
      return adminCopy.errors.authUnavailable;
    case "verify_failed":
      return adminCopy.errors.verifyFailed;
    default:
      return fallback || adminCopy.errors.generic;
  }
}
