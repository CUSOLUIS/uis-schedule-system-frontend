import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HOUR_HEIGHT_PX,
  ScheduleSlot,
  ScheduleViewComponent,
  ScheduleViewConfig,
} from './schedule-view.component';
import { subjectColor } from './schedule-colors';

function slot(overrides: Partial<ScheduleSlot> = {}): ScheduleSlot {
  return {
    day: 'Jueves',
    startTime: '10:00',
    endTime: '11:30',
    classroom: '102',
    building: 'Edificio A',
    subjectName: 'Ingeniería de Software',
    subjectCode: 'IS-401',
    groupNumber: 'A',
    ...overrides,
  };
}

const PX_PER_MIN = HOUR_HEIGHT_PX / 60;

describe('ScheduleViewComponent', () => {
  let fixture: ComponentFixture<ScheduleViewComponent>;
  let component: ScheduleViewComponent;

  async function render(
    slots: ScheduleSlot[],
    config: Partial<ScheduleViewConfig> = {},
    view: 'week' | 'day' = 'week'
  ): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [ScheduleViewComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(ScheduleViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scheduleSlots', slots);
    fixture.componentRef.setInput('config', { title: 'Horario', allowViewToggle: true, ...config });
    fixture.detectChanges();
    component.setView(view);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function blocks(el: HTMLElement, day?: string): HTMLElement[] {
    const scope = day ? `[data-day="${day}"] ` : '';
    return Array.from(el.querySelectorAll<HTMLElement>(`${scope}.schedule-block`));
  }

  it('dibuja cada clase como un solo bloque proporcional a su duración', async () => {
    const el = await render([slot()]);

    const found = blocks(el, 'Jueves');
    expect(found.length).toBe(1);
    // Desde las 07:00: 10:00 está a 180 min y la clase dura 90 min.
    expect(found[0].style.top).toBe(`${180 * PX_PER_MIN}px`);
    expect(found[0].style.height).toBe(`${90 * PX_PER_MIN}px`);
  });

  it('amplía el rango de horas cuando una clase empieza antes del horario configurado', async () => {
    const el = await render([slot({ startTime: '06:00', endTime: '07:00' })]);

    expect(el.querySelector('.hour-label')?.textContent?.trim()).toBe('06:00');
    expect(blocks(el, 'Jueves')[0].style.top).toBe('0px');
  });

  it('no muestra el texto "Libre" en las horas vacías', async () => {
    const el = await render([slot()]);

    expect(el.textContent).not.toContain('Libre');
  });

  it('oculta el sábado si no tiene clases y lo muestra si las tiene', async () => {
    let el = await render([slot()]);
    expect(el.querySelector('[data-day="Sábado"]')).toBeNull();

    TestBed.resetTestingModule();
    el = await render([slot(), slot({ day: 'Sábado', startTime: '08:00', endTime: '10:00' })]);
    expect(el.querySelector('[data-day="Sábado"]')).not.toBeNull();
  });

  it('pinta igual las clases de la misma materia', async () => {
    const el = await render([slot(), slot({ day: 'Lunes', startTime: '14:00', endTime: '16:00' })]);

    const expected = subjectColor('IS-401');
    for (const block of blocks(el)) {
      expect(block.getAttribute('data-color')).toBe(expected.background);
    }
  });

  it('muestra una leyenda sin repetir materia y grupo', async () => {
    const el = await render([
      slot(),
      slot({ day: 'Lunes', startTime: '14:00', endTime: '16:00' }),
      slot({ day: 'Viernes', subjectCode: 'IS-601', subjectName: 'Sistemas Operativos', classroom: '' }),
    ]);

    const items = el.querySelectorAll('.legend-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Ingeniería de Software');
  });

  it('oculta la leyenda con showLegend en false', async () => {
    const el = await render([slot()], { showLegend: false });

    expect(el.querySelector('.schedule-legend')).toBeNull();
  });

  it('la vista diaria lista las clases del día en orden de hora', async () => {
    const el = await render(
      [slot({ startTime: '14:00', endTime: '16:00' }), slot()],
      {},
      'day'
    );
    component.selectDay(component.days().indexOf('Jueves'));
    fixture.detectChanges();

    const rows = Array.from(el.querySelectorAll('.day-list-item'));
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('10:00');
    expect(rows[1].textContent).toContain('14:00');
    expect(rows[0].textContent).toContain('Aula 102, Edificio A');
  });

  it('la vista diaria no repite la materia en el nombre del grupo', async () => {
    const el = await render(
      [slot({ groupNumber: 'HU59 Ingeniería de Software - Grupo A' })],
      {},
      'day'
    );
    component.selectDay(component.days().indexOf('Jueves'));
    fixture.detectChanges();

    const meta = el.querySelector('.day-list-item .item-meta')?.textContent ?? '';
    expect(meta).toContain('Grupo A');
    expect(meta).not.toContain('HU59');
  });

  it('la vista diaria avisa cuando el día no tiene clases', async () => {
    const el = await render([slot()], {}, 'day');
    component.selectDay(component.days().indexOf('Lunes'));
    fixture.detectChanges();

    expect(el.querySelector('.day-list-empty')?.textContent).toContain('Sin clases este día');
  });

  it('no se rompe con franjas incompletas o sin datos', async () => {
    const el = await render([
      slot({ startTime: '', endTime: '' }),
      slot({ day: '' }),
    ]);

    expect(blocks(el).length).toBe(0);
    expect(el.querySelector('.week-grid')).not.toBeNull();
  });
});
