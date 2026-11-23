/** Dientes permanentes en notacion FDI, en orden de presentacion. */
export const FDI_TEETH: readonly number[] = [
  ...[11, 12, 13, 14, 15, 16, 17, 18],
  ...[21, 22, 23, 24, 25, 26, 27, 28],
  ...[31, 32, 33, 34, 35, 36, 37, 38],
  ...[41, 42, 43, 44, 45, 46, 47, 48],
];

export const MAX_TOOTH_NOTE_LENGTH = 300;

export function isValidTooth(tooth: number) {
  return FDI_TEETH.includes(tooth);
}
