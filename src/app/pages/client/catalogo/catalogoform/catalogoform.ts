import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
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
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Catalogo } from '../../../../models/catalogo';
import { ActivatedRoute } from '@angular/router';
import { CatalogoSchema } from '../../../../schema/catalogo-schema';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TabsModule } from 'primeng/tabs';
import { Catalogocampoform } from "../catalogocampoform/catalogocampoform";
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { Catalogocampoajusteform } from "../catalogocampoajusteform/catalogocampoajusteform";
@Component({
  selector: 'app-catalogoform',
  imports: [InputTextModule,
    FormsModule,
    CommonModule,
    LayoutFormSimples,
    LayoutCampo,
    TextareaModule,
    SelectModule,
    InputGroupModule,
    InputNumberModule,
    InputGroupAddonModule,
    TabsModule, Catalogocampoform, Catalogocampoajusteform],
  templateUrl: './catalogoform.html',
  styleUrl: './catalogoform.scss',
})
export class Catalogoform {

  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => { };
  @Input() key!: number;

  loading: boolean = true;
  public objeto: Catalogo = new Catalogo();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'catalogo';
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  carregarDados = false;

  @ViewChild('camposForm')
  camposForm!: Catalogocampoform;

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();
    this.carregarDados = true;

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
      CatalogoSchema.parse([this.objeto]);
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
        this.objeto.cdCatalogo = res.sequencia;
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
    this.objeto = new Catalogo();
    this.errorValidacao = {};
    this.carregarDados = false;

  }

  onTabChange(event: any) {
    if (event == 1) {
      this.camposForm.continuar();
    }
  }


}
