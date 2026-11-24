/** Par de colores de una materia: fondo claro y texto oscuro del mismo tono (contraste ≥ 6.8:1). */
export interface SubjectColor {
  background: string;
  ink: string;
}

export const SUBJECT_PALETTE: readonly SubjectColor[] = [
  { background: '#dbe8fb', ink: '#13407a' },
  { background: '#d3f0ec', ink: '#0d5149' },
  { background: '#fbecc9', ink: '#6b4a05' },
  { background: '#f9dce3', ink: '#7a1d36' },
  { background: '#e6defa', ink: '#43237f' },
  { background: '#dcf1d6', ink: '#275a17' },
  { background: '#fde2cf', ink: '#7a3a0c' },
  { background: '#d4eef7', ink: '#0c4d63' },
  { background: '#e2e6ec', ink: '#2c3747' },
  { background: '#ecefcf', ink: '#4c5310' },
];

export const NEUTRAL_SUBJECT_COLOR: SubjectColor = { background: '#eef1f5', ink: '#3b4655' };

/**
 * Color de una materia derivado de su código. Es un hash y no un índice por orden de aparición
 * para que el calendario y las tarjetas pinten igual la misma materia sin coordinarse.
 */
export function subjectColor(code: string | null | undefined): SubjectColor {
  const key = code?.trim().toUpperCase();
  if (!key) {
    return NEUTRAL_SUBJECT_COLOR;
  }
  let hash = 5381;
  for (const char of key) {
    hash = ((hash << 5) + hash + char.codePointAt(0)!) | 0;
  }
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length];
}
