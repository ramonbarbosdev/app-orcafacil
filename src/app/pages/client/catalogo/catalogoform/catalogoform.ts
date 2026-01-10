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
import {  Catalogocampoform } from "../catalogocampoform/catalogocampoform";
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { Catalogocampoajusteform } from "../catalogocampoajusteform/catalogocampoajusteform";
import { Catalogocampo } from '../../../../models/catalogocampo';
import { Catalogocamposimulacaoform } from "../catalogocamposimulacaoform/catalogocamposimulacaoform";
import { Campopersonalizado } from '../../../../models/campopersonalizado';
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
    TabsModule, Catalogocampoform, Catalogocampoajusteform, Catalogocamposimulacaoform],
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
  private wizardState = inject(CatalogoWizardStateService);

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

        // 1️⃣ hidratar wizard a partir do backend
        this.hidratarWizardState(res);

        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  private hidratarWizardState(catalogo: any): void {

    if (!catalogo.catalogoCampo || catalogo.catalogoCampo.length === 0) {
      return;
    }

    const ordenados = [...catalogo.catalogoCampo]
      .sort((a, b) => a.ordem - b.ordem);

    const camposSelecionados: any[] = ordenados.map(cc => ({
      idCampoPersonalizado: cc.idCampoPersonalizado,
      nmCampoPersonalizado: cc.campoPersonalizado?.nmCampoPersonalizado,
      tpCampoPersonalizado: cc.campoPersonalizado?.tpCampoPersonalizado,
      tpCampoValor: cc.campoPersonalizado?.tpCampoValor,
      dsCampoPersonalizado: cc.campoPersonalizado?.dsCampoPersonalizado
    }));

    const ajustesPadrao: Record<number, any> = {};

    for (const cc of ordenados) {
      ajustesPadrao[cc.idCampoPersonalizado] = cc.vlPadrao;
    }

    this.wizardState.setCamposSelecionados(camposSelecionados);

    for (const [idCampo, valor] of Object.entries(ajustesPadrao)) {
      this.wizardState.setAjustePadrao(Number(idCampo), valor);
    }
  }

  onSave() {

    if (this.validarItens()) {

      const campos = this.wizardState.getCamposSelecionadosSnapshot();
      const ajustes = this.wizardState.getAjustesPadraoSnapshot();

      const catalogoCampos = this.buildCatalogoCampos(
        this.objeto.idCatalogo,
        campos,
        ajustes
      );

      this.objeto.catalogoCampo = catalogoCampos;

      this.loading = true;

      this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto).subscribe({
        next: () => {
          this.loading = false;
          this.hideDialog();
          this.onReloadList();
          this.cd.markForCheck();
          this.wizardState.reset();
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

  private buildCatalogoCampos(
    idCatalogo: number,
    campos: Campopersonalizado[],
    ajustes: Record<number, any>
  ): Catalogocampo[] {

    return campos.map((campo, index) => {

      const catalogoCampo = new Catalogocampo();

      catalogoCampo.idCatalogo = idCatalogo;
      catalogoCampo.idCampoPersonalizado = campo.idCampoPersonalizado;
      catalogoCampo.vlPadrao = ajustes[campo.idCampoPersonalizado] ?? null;
      catalogoCampo.flEditavel = true; 
      catalogoCampo.ordem = index + 1;

      return catalogoCampo;
    });
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

  processarValorPreco(event: any)
  {
    this.objeto.vlPrecoBase = event;
  }


}
