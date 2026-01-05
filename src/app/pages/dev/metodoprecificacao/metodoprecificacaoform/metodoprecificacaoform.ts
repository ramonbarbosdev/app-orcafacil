import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EmpresaMetodoPrecificacao } from '../../../../models/empresa-metodo-precificacao';
import { ZodError } from 'zod';
import { MetodoPrecificacaoSchema } from '../../../../schema/metodoprecificacao-schema';
import { BaseService } from '../../../../services/base.service';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutFormSimples } from '../../../../components/layouts/layout-form-simples/layout-form-simples';
import { MetodoPrecificacao } from '../../../../models/metodo-precificacao';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FlagOption } from '../../../../models/flag-option';

@Component({
  selector: 'app-metodoprecificacaoform',
  imports: [DialogModule,
    InputTextModule,
    FormsModule,
    CommonModule,
    LayoutFormSimples,
    LayoutCampo,
    TextareaModule,
    SelectModule
  ],
  templateUrl: './metodoprecificacaoform.html',
  styleUrl: './metodoprecificacaoform.scss',
})
export class Metodoprecificacaoform {


  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => { };
  @Input() key!: number;

  loading: boolean = true;
  public objeto: MetodoPrecificacao = new MetodoPrecificacao();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'metodoprecificacao';
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  public listaCodigo: FlagOption[] = [];


  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();

    this.obterCodigo();

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
      MetodoPrecificacaoSchema.parse([this.objeto]);
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
    this.objeto = new MetodoPrecificacao();
    this.errorValidacao = {};
  }

  obterCodigo() {
    this.baseService.findAll(`${this.endpoint}/tipo-precificacao`).subscribe({
      next: (res) => {
        this.listaCodigo = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index;
          item.name = index;
          this.cd.markForCheck();
          return item;
        });
      },
      error: (err) => { },
    });
  }


}
