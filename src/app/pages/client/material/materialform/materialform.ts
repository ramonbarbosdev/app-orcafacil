import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { ZodError } from 'zod';
import { CampoPersonalizadoSchema } from '../../../../schema/campopersonalizado-schema';
import { FlagOption } from '../../../../models/flag-option';
import { BaseService } from '../../../../services/base.service';
import { ActivatedRoute } from '@angular/router';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { LayoutCardConfig } from '../../configuracao-view/layout-card-config/layout-card-config';
import { LayoutFormSimples } from "../../../../components/layouts/layout-form-simples/layout-form-simples";
import { TipoCampo, TipoCampoLabel } from '../../../../enum/TipoCampo';
import { TipoValor, TipoValorLabel } from '../../../../enum/TipoValor';

@Component({
  selector: 'app-materialform',
  imports: [LayoutCardConfig, TextareaModule, TableModule, TagModule, LayoutCampo, CommonModule, FormsModule, SelectModule, ButtonModule, InputTextModule, DividerModule, LayoutFormSimples],
  templateUrl: './materialform.html',
  styleUrl: './materialform.scss',
})
export class Materialform {
  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => { };
  @Input() key!: number;

  loading: boolean = true;
  public objeto: Campopersonalizado = new Campopersonalizado();
  public errorValidacao: Record<string, string> = {};
  private endpoint = 'campopersonalizado';
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  listaTipoCampo: FlagOption[] = [];
  listaTipoValor: FlagOption[] = [];

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.loading = true;
    this.limparFormulario();

    this.obterTipoCampo();
    this.obterTipoValor();

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
      CampoPersonalizadoSchema.parse([this.objeto]);
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
    this.objeto = new Campopersonalizado();
    this.errorValidacao = {};
  }

  formatarNome(nome: string) {
    const valor = nome;
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase();
  }

  processarNome(event: any) {
    let nome = this.formatarNome(event)
    this.objeto.cdCampoPersonalizado = nome;
  }



  obterTipoValor() {
    this.baseService.findAll(`${this.endpoint}/tipo-valor/`).subscribe({
      next: (res) => {

        this.listaTipoValor = (res as any).map((index: any) => {

          const item = new FlagOption();
          item.code = index;
          item.name = index;
          item.name = TipoValorLabel[index as TipoValor] ?? index; 

          return item;
        });

        this.objeto.tpCampoValor = String(this.listaTipoValor[0]?.code)
      },
      error: (err) => {
      },
    });
  }

  obterTipoCampo() {
    this.baseService.findAll(`${this.endpoint}/tipo-campo/`).subscribe({
      next: (res) => {

        this.listaTipoCampo = (res as any).map((index: any) => {

          const item = new FlagOption();
          item.code = index; 
          item.name = TipoCampoLabel[index as TipoCampo] ?? index; 
          return item;
        });

        this.objeto.tpCampoPersonalizado = String(this.listaTipoCampo[1]?.code)
      },
      error: (err) => {
      },
    });
  }



}
