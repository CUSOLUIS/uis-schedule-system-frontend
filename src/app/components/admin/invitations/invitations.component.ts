import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvitationService, InvitationResponse } from '../../../services/invitation.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.css'
})
export default class InvitationsComponent implements OnInit {
  inviteForm: FormGroup;
  availableRoles = ['ADMINISTRADOR', 'OPERADOR', 'DOCENTE', 'ESTUDIANTE'];

  pendingList = signal<InvitationResponse[]>([]);
  loading = signal(false);
  sendingInvite = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  processingId = signal<string | null>(null);
  selectedRoles: { [key: string]: string } = {};

  constructor(private fb: FormBuilder, private invitationService: InvitationService) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading.set(true);
    this.invitationService.getPendingApprovals().subscribe({
      next: (list) => {
        this.pendingList.set(list);
        list.forEach(inv => {
          if (!this.selectedRoles[inv.invitationId]) {
            this.selectedRoles[inv.invitationId] = 'DOCENTE';
          }
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  sendInvitation() {
    if (this.inviteForm.invalid) return;
    this.sendingInvite.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.invitationService.createInvitation(this.inviteForm.value.email).subscribe({
      next: () => {
        this.successMessage.set('Invitación enviada correctamente al correo.');
        this.inviteForm.reset();
        this.sendingInvite.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Error al enviar la invitación.');
        this.sendingInvite.set(false);
      }
    });
  }

  approve(invitationId: string) {
    const roleName = this.selectedRoles[invitationId];
    if (!roleName) return;
    this.processingId.set(invitationId);
    this.invitationService.approveInvitation(invitationId, roleName).subscribe({
      next: () => {
        this.processingId.set(null);
        this.loadPending();
      },
      error: () => this.processingId.set(null)
    });
  }

  reject(invitationId: string) {
    this.processingId.set(invitationId);
    this.invitationService.rejectInvitation(invitationId).subscribe({
      next: () => {
        this.processingId.set(null);
        this.loadPending();
      },
      error: () => this.processingId.set(null)
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}