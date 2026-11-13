import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import DashboardComponent from './dashboard.component';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

const TEACHER_MENU = [
  { icon: 'fa-tachometer-alt', label: 'Dashboard', route: '/dashboard', visible: true, description: 'Dashboard - DOCENTE' },
  { icon: 'fa-calendar-alt', label: 'Mi Horario', route: '/teacher/schedule', visible: true, description: 'Mi Horario - DOCENTE' },
  { icon: 'fa-book', label: 'Mis Materias', route: '/teacher/subjects', visible: true, description: 'Mis Materias - DOCENTE' },
  { icon: 'fa-key', label: 'Cambiar Contraseña', route: '/cambiar-contrasena', visible: true, description: 'Cambiar Contraseña - DOCENTE' },
  { icon: 'fa-flask', label: 'Laboratorio', route: '/teacher/lab', visible: true, description: 'Laboratorio - DOCENTE' },
];

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () =>
              signal({ username: 'dtrujillo', fullName: 'David Trujillo', role: { id: 'DOCENTE', name: 'Docente' } }),
            getMenuItemsForUser: () => TEACHER_MENU,
          },
        },
        {
          provide: RoleService,
          useValue: {
            getRoleById: (id: string) =>
              id === 'DOCENTE'
                ? {
                    colorScheme: {
                      primary: '#D1E7FB',
                      text: '#1565C0',
                      gradient: 'linear-gradient(135deg, #1E5A9F 0%, #1565C0 100%)',
                    },
                  }
                : undefined,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function links(el: HTMLElement): HTMLAnchorElement[] {
    return Array.from(el.querySelectorAll<HTMLAnchorElement>('.quick-access a'));
  }

  it('no ofrece un acceso al dashboard en el que ya está el usuario', async () => {
    const el = await render();

    expect(links(el).map((a) => a.getAttribute('href'))).not.toContain('/dashboard');
  });

  it('cada acceso es un enlace completo a su ruta, sin botones "Ver"', async () => {
    const el = await render();

    expect(links(el).map((a) => a.getAttribute('href'))).toEqual([
      '/teacher/schedule',
      '/teacher/subjects',
      '/cambiar-contrasena',
      '/teacher/lab',
    ]);
    expect(el.querySelector('.quick-access button')).toBeNull();
  });

  it('muestra una descripción útil en lugar de repetir el título y el rol', async () => {
    const el = await render();

    const text = el.querySelector('.quick-access')?.textContent ?? '';
    expect(text).toContain('Consulta tus clases de la semana');
    expect(text).toContain('Cambia tu contraseña de acceso');
    expect(text).not.toContain('- DOCENTE');
  });

  it('usa los colores del rol del usuario para el encabezado y los íconos', async () => {
    const el = await render();

    const container = el.querySelector<HTMLElement>('.dashboard-container');
    expect(container?.style.getPropertyValue('--role-primary')).toBe('#D1E7FB');
    expect(container?.style.getPropertyValue('--role-ink')).toBe('#1565C0');
  });

  it('no deja un párrafo vacío cuando la ruta no tiene descripción', async () => {
    const el = await render();

    const lab = links(el).find((a) => a.getAttribute('href') === '/teacher/lab');
    expect(lab?.querySelector('.access-description')).toBeNull();
  });
});
