import { NEUTRAL_SUBJECT_COLOR, SUBJECT_PALETTE, subjectColor } from './schedule-colors';

describe('subjectColor', () => {
  it('asigna siempre el mismo color al mismo código', () => {
    expect(subjectColor('IS-401')).toEqual(subjectColor('IS-401'));
  });

  it('no distingue mayúsculas ni espacios alrededor del código', () => {
    expect(subjectColor(' is-401 ')).toEqual(subjectColor('IS-401'));
  });

  it('reparte códigos distintos entre varios colores de la paleta', () => {
    const codes = ['IS-101', 'IS-201', 'IS-301', 'IS-401', 'IS-501', 'IS-601', 'IS-701', 'IS-102'];
    const used = new Set(codes.map((code) => subjectColor(code).background));

    expect(used.size).toBeGreaterThanOrEqual(5);
    used.forEach((bg) => expect(SUBJECT_PALETTE.map((c) => c.background)).toContain(bg));
  });

  it('usa el color neutro cuando no hay código', () => {
    expect(subjectColor(null)).toEqual(NEUTRAL_SUBJECT_COLOR);
    expect(subjectColor('   ')).toEqual(NEUTRAL_SUBJECT_COLOR);
  });
});
