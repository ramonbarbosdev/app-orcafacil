import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BaseService } from '../../../../services/base.service';
import { ZodError } from 'zod';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LayoutFormSimples } from '../../../../components/layouts/layout-form-simples/layout-form-simples';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Condicaopagamento } from '../../../../models/condicaopagamento';
import { CondicaoPagamentoSchema } from '../../../../schema/condicaopagamento-schema';

@Component({
  selector: 'app-condicaopagamentoform',
  imports: [ DialogModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    FormsModule,
    TextareaModule,
    CommonModule,
    ProgressSpinnerModule,
    SelectModule,
    PasswordModule,
    LayoutFormSimples,
    LayoutCampo,
    ToggleButtonModule,],
  templateUrl: './condicaopagamentoform.html',
  styleUrl: './condicaopagamentoform.scss',
})
export class Condicaopagamentoform {
@Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => { };
  @Input() key!: number;

  loading: boolean = true;
  public objeto: Condicaopagamento = new Condicaopagamento();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'condicaopagamento';
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();

    if (this.key == 0) {
      this.obterSequencia();
    } else {
      this.onEdit(this.key);
    }
  }

  onEdit(id: number) {
    if (!id) {
      this.loading = false;
      return;
    }

    this.baseService.findById(`${this.endpoint}`, id).subscribe({
      next: (res: any) => {
        this.objeto = res;

        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  onSave() {
    if (this.validarItens()) {
      this.loading = true;

      this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto).subscribe({
        next: () => {
          this.loading = false;
          this.hideDialog();
          this.onReloadList();
          this.cd.markForCheck();
        },
        error: (erro) => {
          this.loading = false;
          this.cd.markForCheck();
        },
      });
    }
  }

  validarItens(): boolean {
    try {
      CondicaoPagamentoSchema.parse([this.objeto]);
      this.errorValidacao = {};
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
      throw error;
    }
  }

  obterSequencia() {
    this.baseService.findSequence(this.endpoint).subscribe({
      next: (res) => {
        this.objeto.cdCondicaoPagamento = res.sequencia;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  limparFormulario() {
    this.objeto = new Condicaopagamento();
    this.errorValidacao = {};
  }

  
}
