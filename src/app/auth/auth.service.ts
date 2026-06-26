import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
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
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => this.persistPartialSession(res.token, res.tipoGlobal)),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  selecionarOrganizacao(idOrganizacao: number): Observable<SelecionarOrgResponse> {
    const body: SelecionarOrgRequest = { idOrganizacao };
    return this.http
      .post<SelecionarOrgResponse>(`${this.apiUrl}/auth/selecionar-organizacao`, body)
      .pipe(
        tap((res) => {
          const current = this.getUser();
          this.persistSession({
            token: res.token,
            tipoGlobal: current?.tipoGlobal ?? 'DEFAULT',
            idOrganizacao: res.idOrganizacao,
            role: res.role,
            permissoes: res.permissoes,
            idUsuario: current?.idUsuario,
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

    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`).pipe(
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
    return this.getUser()?.tipoGlobal === 'SUPER_ADMIN';
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

  clearSession(): void {
    this.userSubject.next(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private persistPartialSession(token: string, tipoGlobal: SessionUser['tipoGlobal']): void {
    this.persistSession({
      token,
      tipoGlobal,
      permissoes: [],
    });
  }

  private persistSession(user: SessionUser): void {
    this.userSubject.next(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  exibirErros(e: { error?: ApiErrorShape }): void {
    const err = e.error;
    this.messageService.add({
      severity: 'error',
      summary: err?.message ?? 'Erro',
      detail: err?.error ?? '',
    });
  }
}

interface ApiErrorShape {
  message?: string;
  error?: string;
}
