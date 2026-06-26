import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FlagOption } from '../../../models/flag-option';
import { SelectModule } from 'primeng/select';
import { LayoutCampo } from '../../../components/layout-campo/layout-campo';
import { Auth } from '../../../models/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { LoginSchema } from '../../../schema/login-schema';
import { ZodError } from 'zod';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selecionar-organizacao',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    LayoutCampo,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './selecionar-organizacao.html',
  styleUrl: './selecionar-organizacao.scss',
})
export class SelecionarOrganizacao {
  @Input() visible: boolean = false;
  @Input() listaEmpresa: FlagOption[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  @Input() objeto!: Auth;
  private auth = inject(AuthService);
  private router = inject(Router);

  loading: boolean = false;
  private cd = inject(ChangeDetectorRef);
  public errorValidacao: Record<string, string> = {};

  showDialog() {
    if (this.listaEmpresa.length > 0) {
      this.objeto.idOrganizacao = Number(this.listaEmpresa[0].code);
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.cancel.emit();
    this.loading = false;
  }

  continuar() {
    if (!this.validarItens() || !this.objeto.idOrganizacao) return;
    this.loading = true;

    this.auth.selecionarOrganizacao(Number(this.objeto.idOrganizacao)).subscribe({
      next: () => {
        this.loading = false;
        this.visible = false;
        this.router.navigate(['/client/home']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  validarItens(): boolean {
    try {
      LoginSchema.parse([this.objeto]);
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
}
