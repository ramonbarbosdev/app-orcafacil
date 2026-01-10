import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
import { FlagOption } from '../../../../models/flag-option';
import { LayoutFormSimples } from '../../../../components/layouts/layout-form-simples/layout-form-simples';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { Empresa } from '../../../../models/empresa';
import { EmpresaSchema } from '../../../../schema/empresa-schema';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormatCpfCnpj } from '../../../../format/FormatarCpfCnpj';

@Component({
  selector: 'app-empresaform',
  imports: [
    DialogModule,
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
    ToggleButtonModule,
  ],
  templateUrl: './empresaform.html',
  styleUrl: './empresaform.scss',
})
export class Empresaform {
  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => { };
  @Input() key!: number;

  loading: boolean = true;
  public objeto: Empresa = new Empresa();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'empresa';
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  public listaAssinatura: FlagOption[] = [];

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();

    this.obterAssinatura();

    if (this.key == 0) {
      // this.obterSequencia();
      setTimeout(() => (this.loading = false), 0);

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
       this.objeto.cdEmpresa =  FormatCpfCnpj(this.objeto.cdEmpresa);

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

         const payload = {
        ...this.objeto,
        cdEmpresa: this.objeto.cdEmpresa.replace(/\D/g, '')
      };

      
      this.baseService.create(`${this.endpoint}/cadastrar`, payload).subscribe({
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
      EmpresaSchema.parse([this.objeto]);
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
        this.objeto.cdEmpresa = res.sequencia;
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
    this.objeto = new Empresa();
    this.errorValidacao = {};
  }

  obterAssinatura() {
    this.baseService.findAll(`planoassinatura/`).subscribe({
      next: (res) => {
        this.listaAssinatura = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index.idPlanoAssinatura;
          item.name = index.nmPlanoAssinatura;
          this.cd.markForCheck();
          return item;
        });
      },
      error: (err) => { },
    });
  }

  
  processarMascaraCpfCnpj(event: any): void {
    let valor = event.target.value || '';

    valor = valor.replace(/\D/g, '');

    if (valor.length <= 11) {
      // CPF
      valor = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      valor = valor
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.objeto.cdEmpresa = valor;
  }
}
