import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvitationResponse {
  invitationId: string;
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  createdByName: string;
}

export interface CompleteInvitationRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface ApproveInvitationRequest {
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private apiUrl = '/api/v1/invitations';

  constructor(private http: HttpClient) {}

  createInvitation(email: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(this.apiUrl, { email });
  }

  validateToken(token: string): Observable<InvitationResponse> {
    return this.http.get<InvitationResponse>(`${this.apiUrl}/validate/${token}`);
  }

  completeInvitation(token: string, data: CompleteInvitationRequest): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/complete/${token}`, data);
  }

  getPendingApprovals(): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(`${this.apiUrl}/pending`);
  }

  approveInvitation(invitationId: string, roleName: string): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.apiUrl}/${invitationId}/approve`, { roleName });
  }

  rejectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.put<InvitationResponse>(`${this.apiUrl}/${invitationId}/reject`, {});
  }
}