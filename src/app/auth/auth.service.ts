import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/api';
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  SelecionarOrgRequest,
  SelecionarOrgResponse,
  SessionUser,
} from '../models/api.types';
import { isAuthHandledStatus } from '../utils/http-error.util';

const STORAGE_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private router = inject(Router);
  private messageService = inject(MessageService);

  private userSubject = new BehaviorSubject<SessionUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const userJson = sessionStorage.getItem(STORAGE_KEY);
    if (userJson) {
      this.userSubject.next(JSON.parse(userJson));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse | ApiEnvelope<LoginResponse>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((res) => this.unwrapAuth(res)),
      tap((res) => {
        if (!res?.token) {
          throw new Error('Token não recebido no login');
        }
        this.persistPartialSession(res.token, res.tipoGlobal ?? 'DEFAULT');
      }),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  selecionarOrganizacao(idOrganizacao: number): Observable<SelecionarOrgResponse> {
    const body: SelecionarOrgRequest = { idOrganizacao };
    return this.http
      .post<SelecionarOrgResponse | ApiEnvelope<SelecionarOrgResponse>>(
        `${this.apiUrl}/auth/selecionar-organizacao`,
        body
      )
      .pipe(
        map((res) => this.unwrapAuth(res)),
        tap((res) => {
          if (!res?.token) {
            throw new Error('Token não recebido ao selecionar organização');
          }
          this.persistSession({
            token: res.token,
            tipoGlobal: 'DEFAULT',
            idOrganizacao: res.idOrganizacao,
            role: res.role,
            permissoes: res.permissoes ?? [],
            idUsuario: this.getUser()?.idUsuario,
          });
        }),
        catchError((e) => {
          this.exibirErros(e);
          return throwError(() => e);
        })
      );
  }

  checkAuth(): Observable<MeResponse | null> {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      return of(null);
    }

    return this.http.get<MeResponse | ApiEnvelope<MeResponse>>(`${this.apiUrl}/auth/me`).pipe(
      map((res) => this.unwrapAuth(res)),
      tap((me) => {
        const current = this.getUser();
        if (current?.token) {
          this.persistSession({
            token: current.token,
            tipoGlobal: (me.tipoGlobal as SessionUser['tipoGlobal']) ?? 'DEFAULT',
            idOrganizacao: me.idOrganizacao ?? undefined,
            role: me.role ?? undefined,
            permissoes: me.permissoes ?? [],
            idUsuario: me.idUsuario,
          });
        }
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getUser(): SessionUser | null {
    return this.userSubject.value;
  }

  getUserSubbject(): SessionUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value?.token;
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.tipoGlobal === 'SUPER_ADMIN' && !user?.idOrganizacao;
  }

  hasOrgSelected(): boolean {
    const user = this.getUser();
    return user?.tipoGlobal === 'SUPER_ADMIN' || !!user?.idOrganizacao;
  }

  hasPermission(chave: string): boolean {
    const permissoes = this.getUser()?.permissoes ?? [];
    return permissoes.includes(chave);
  }

  hasAnyPermission(...chaves: string[]): boolean {
    return chaves.some((c) => this.hasPermission(c));
  }

  /** Controle de exibição no menu lateral (permissão {modulo}.exibir no plano/papel). */
  canShowInMenu(modulo: string): boolean {
    return this.hasPermission(`${modulo}.exibir`);
  }

  clearSession(): void {
    this.userSubject.next(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private persistPartialSession(token: string, tipoGlobal: SessionUser['tipoGlobal']): void {
    this.persistSession({
      token,
      tipoGlobal,
      permissoes: [],
      idOrganizacao: undefined,
      role: undefined,
    });
  }

  private persistSession(user: SessionUser): void {
    this.userSubject.next(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private unwrapAuth<T>(body: T | ApiEnvelope<T>): T {
    if (body && typeof body === 'object' && 'data' in (body as ApiEnvelope<T>)) {
      return (body as ApiEnvelope<T>).data;
    }
    return body as T;
  }

  exibirErros(e: { error?: ApiErrorShape; status?: number }): void {
    if (isAuthHandledStatus(e.status ?? 0)) {
      return;
    }

    const err = e.error;
    const detail = [err?.message, err?.hint].filter(Boolean).join(' ');
    this.messageService.add({
      severity: 'error',
      summary: 'Não foi possível concluir',
      detail: detail || err?.error || 'Ocorreu um erro inesperado. Tente novamente.',
    });
  }
}

interface ApiErrorShape {
  message?: string;
  error?: string;
  hint?: string;
}

interface ApiEnvelope<T> {
  message?: string;
  data: T;
}
