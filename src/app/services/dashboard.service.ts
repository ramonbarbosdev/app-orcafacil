import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.types';
import { DashboardResumo } from '../models/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  obterResumo(): Observable<DashboardResumo> {
    return this.http
      .get<ApiResponse<DashboardResumo>>(`${this.apiUrl}/dashboard/resumo`)
      .pipe(map((res) => res.data));
  }
}
