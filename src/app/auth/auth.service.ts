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
  OrganizacaoResumo,
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
    this.restoreSessionFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse | ApiEnvelope<LoginResponse>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((res) => this.unwrapAuth(res)),
      tap((res) => {
        if (!res?.token) {
          throw new Error('Token não recebido no login');
        }
        this.persistPartialSession(res.token, res.tipoGlobal ?? 'DEFAULT', res.organizacoes ?? []);
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
            organizacoesPendentes: undefined,
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

    return this.refreshPermissoes().pipe(
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  refreshPermissoes(): Observable<MeResponse> {
    return this.http.get<MeResponse | ApiEnvelope<MeResponse>>(`${this.apiUrl}/auth/me`).pipe(
      map((res) => this.unwrapAuth(res)),
      tap((me) => this.aplicarPermissoes(me)),
      catchError((e) => {
        if (!isAuthHandledStatus(e.status ?? 0)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Não foi possível atualizar',
            detail: 'Não foi possível recarregar suas permissões. Tente novamente.',
          });
        }
        return throwError(() => e);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getUser(): SessionUser | null {
    return this.getSessionUser();
  }

  getToken(): string | null {
    const token = this.getSessionUser()?.token?.trim();
    return token || null;
  }

  getOrganizacoesPendentes(): OrganizacaoResumo[] {
    return this.getSessionUser()?.organizacoesPendentes ?? [];
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    const user = this.getSessionUser();
    return user?.tipoGlobal === 'SUPER_ADMIN' && !user?.idOrganizacao;
  }

  hasOrgSelected(): boolean {
    const user = this.getSessionUser();
    return user?.tipoGlobal === 'SUPER_ADMIN' || !!user?.idOrganizacao;
  }

  needsOrgSelection(): boolean {
    const user = this.getSessionUser();
    return !!user?.token && user.tipoGlobal === 'DEFAULT' && !user.idOrganizacao;
  }

  hasPermission(chave: string): boolean {
    const permissoes = this.getSessionUser()?.permissoes ?? [];
    return permissoes.includes(chave);
  }

  hasAnyPermission(...chaves: string[]): boolean {
    return chaves.some((c) => this.hasPermission(c));
  }

  canShowInMenu(modulo: string): boolean {
    return this.hasPermission(`${modulo}.exibir`);
  }

  canShowConfiguracaoMenu(): boolean {
    return (
      this.canShowInMenu('configuracao-orcamento') ||
      this.canShowInMenu('metodos-precificacao') ||
      this.canShowInMenu('campos-personalizados') ||
      this.canShowInMenu('metodos-ajuste') ||
      this.canShowInMenu('empresa-metodos-precificacao')
    );
  }

  hasMenuVisibilityForPermission(permission: string): boolean {
    const modulo = permission.slice(0, permission.lastIndexOf('.'));
    if (modulo === 'configuracao-orcamento') {
      return this.canShowConfiguracaoMenu();
    }
    return this.canShowInMenu(modulo);
  }

  clearSession(): void {
    this.userSubject.next(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private restoreSessionFromStorage(): void {
    const userJson = sessionStorage.getItem(STORAGE_KEY);
    if (!userJson) {
      return;
    }
    try {
      const user = JSON.parse(userJson) as SessionUser;
      if (user?.token?.trim()) {
        this.userSubject.next(user);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  private getSessionUser(): SessionUser | null {
    const fromMemory = this.userSubject.value;
    if (fromMemory?.token?.trim()) {
      return fromMemory;
    }
    this.restoreSessionFromStorage();
    return this.userSubject.value;
  }

  private persistPartialSession(
    token: string,
    tipoGlobal: SessionUser['tipoGlobal'],
    organizacoes: OrganizacaoResumo[]
  ): void {
    this.persistSession({
      token,
      tipoGlobal,
      permissoes: [],
      organizacoesPendentes: organizacoes,
    });
  }

  private persistSession(user: SessionUser): void {
    if (!user.token?.trim()) {
      return;
    }
    this.userSubject.next(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private aplicarPermissoes(me: MeResponse): void {
    const current = this.getSessionUser();
    if (!current?.token) {
      return;
    }
    this.persistSession({
      ...current,
      token: current.token,
      tipoGlobal: (me.tipoGlobal as SessionUser['tipoGlobal']) ?? current.tipoGlobal,
      idOrganizacao: me.idOrganizacao ?? undefined,
      role: me.role ?? undefined,
      permissoes: me.permissoes ?? [],
      idUsuario: me.idUsuario,
    });
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
