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
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Clientes } from '../../../../models/clientes';
import { ClienteSchema } from '../../../../schema/clientes-schema';
import { NgxMaskDirective } from 'ngx-mask';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-clienteform',
  imports: [
    DialogModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    TextareaModule,
    CommonModule,
    ProgressSpinnerModule,
    SelectModule,
    PasswordModule,
    LayoutFormSimples,
    LayoutCampo,
    ToggleButtonModule,
    NgxMaskDirective,
    ChipModule,
  ],
  templateUrl: './clienteform.html',
  styleUrl: './clienteform.scss',
})
export class Clienteform {
  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => {};
  @Input() key!: number;

  loading: boolean = true;
  public objeto: Clientes = new Clientes();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'cliente';
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  public listaTipo: FlagOption[] = [];

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();

    this.obterTipoCliente();

    if (this.key == 0) {
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
      ClienteSchema.parse([this.objeto]);
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

  limparFormulario() {
    this.objeto = new Clientes();
    this.errorValidacao = {};
  }

  obterTipoCliente() {
    this.baseService.findAll(`${this.endpoint}/tipo-cliente/`).subscribe({
      next: (res) => {
        this.listaTipo = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index;
          item.name = index;
          this.cd.markForCheck();
          return item;
        });

        this.objeto.tp_cliente = String(this.listaTipo[0].code);
      },
      error: (err) => {},
    });
  }
}
