import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogEntry } from '@taskmgmt/data';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  getAuditLog(limit?: number): Observable<AuditLogEntry[]> {
    const params = limit != null ? { limit: limit.toString() } : undefined;
    return this.http.get<AuditLogEntry[]>(`${API}/audit-log`, { params });
  }
}
