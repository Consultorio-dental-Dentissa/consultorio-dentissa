/**
 * Un access token queda invalido si se emitio antes del ultimo cambio de
 * contraseña. `iat` va en segundos, por eso se compara truncando a segundos
 * (un login hecho en el mismo segundo del cambio no se rechaza).
 */
export function isIssuedBeforePasswordChange(
  iat: unknown,
  passwordChangedAt: Date | null | undefined,
): boolean {
  if (!passwordChangedAt) {
    return false;
  }

  if (typeof iat !== 'number') {
    return true;
  }

  return iat < Math.floor(passwordChangedAt.getTime() / 1000);
}
