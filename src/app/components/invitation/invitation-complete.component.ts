import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-invitation-complete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invitation-complete.component.html',
  styleUrl: './invitation-complete.component.css'
})
export default class InvitationCompleteComponent implements OnInit {
  form: FormGroup;
  token = '';
  validating = signal(true);
  tokenValid = signal(false);
  submitting = signal(false);
  submitted = signal(false);
  errorMessage = signal('');
  invitationEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[^0-9]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[^0-9]*$')]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage.set('Enlace inválido.');
      this.validating.set(false);
      return;
    }

    this.invitationService.validateToken(this.token).subscribe({
      next: (inv) => {
        this.invitationEmail.set(inv.email);
        this.tokenValid.set(true);
        this.validating.set(false);
      },
      error: () => {
        this.errorMessage.set('El enlace no es válido o ha expirado.');
        this.validating.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set('');

    this.invitationService.completeInvitation(this.token, this.form.value).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Error al completar el registro.');
        this.submitting.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}