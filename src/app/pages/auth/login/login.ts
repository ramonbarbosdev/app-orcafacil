import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { Auth } from '../../../models/auth';
import { CommonModule } from '@angular/common';
import { LoginSchema } from '../../../schema/login-schema';
import { ZodError } from 'zod';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../../../auth/auth.service';
import { LayoutCampo } from '../../../components/layout-campo/layout-campo';
import { SelectModule } from 'primeng/select';
import { FlagOption } from '../../../models/flag-option';
import { SelecionarOrganizacao } from '../selecionar-organizacao/selecionar-organizacao';
import { LoginResponse } from '../../../models/api.types';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    NgxMaskDirective,
    LayoutCampo,
    SelectModule,
    SelecionarOrganizacao,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  public objeto = new Auth();
  checked: boolean = false;
  loading: boolean = false;
  visibleOrganizacao: boolean = false;
  loginResponse: LoginResponse | null = null;

  private auth = inject(AuthService);
  public errorValidacao: Record<string, string> = {};
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  public listaEmpresa: FlagOption[] = [];

  ngOnInit(): void {
    this.verificarUsuarioLogado();
  }

  hideDialog() {
    this.visibleOrganizacao = false;
  }

  entrar() {
    if (!this.validarItens()) return;

    const nuCpf = this.objeto.nuCpf.replace(/\D/g, '');
    this.loading = true;

    this.auth.login({ nuCpf, dsSenha: this.objeto.dsSenha }).subscribe({
      next: (res) => {
        this.loading = false;
        this.loginResponse = res;

        if (res.tipoGlobal === 'SUPER_ADMIN') {
          this.router.navigate(['/admin/home']);
          return;
        }

        if (res.precisaSelecionarOrganizacao) {
          this.visibleOrganizacao = true;
          this.listaEmpresa = res.organizacoes.map((org) => {
            const item = new FlagOption();
            item.code = String(org.idOrganizacao);
            item.name = org.nmOrganizacao;
            return item;
          });
          if (this.listaEmpresa.length > 0) {
            this.objeto.idOrganizacao = Number(this.listaEmpresa[0].code);
          }
        } else if (res.organizacoes?.length === 1) {
          this.auth.selecionarOrganizacao(res.organizacoes[0].idOrganizacao).subscribe({
            next: () => this.router.navigate(['/client/home']),
          });
        } else {
          this.router.navigate(['/client/home']);
        }
      },
      error: () => {
        this.visibleOrganizacao = false;
        this.loading = false;
      },
    });
  }

  validarItens(): boolean {
    try {
      const nuCpf = this.objeto.nuCpf.replace(/\D/g, '');
      LoginSchema.parse([{ ...this.objeto, nuCpf }]);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        this.errorValidacao = {};
        error.issues.forEach((e) => {
          const value = e.path[1];
          this.errorValidacao[String(value)] = e.message;
        });
        return false;
      }
      return false;
    }
  }

  verificarUsuarioLogado() {
    this.auth.checkAuth().subscribe({
      next: (me) => {
        if (!me) return;
        if (this.auth.isSuperAdmin()) {
          this.router.navigate(['/admin/home']);
        } else if (this.auth.hasOrgSelected()) {
          this.router.navigate(['/client/home']);
        }
      },
      error: () => {},
    });
  }
}
