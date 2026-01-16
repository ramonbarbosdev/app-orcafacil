import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { OrcamentoClienteForm } from "./orcamento-cliente-form/orcamento-cliente-form";
import { Orcamento } from '../../../../models/orcamento';
import { BaseService } from '../../../../services/base.service';
import { OrcamentoClienteSchema } from '../../../../schema/orcamentoclientes-schema';
import { ZodError } from 'zod';
import { OrcamentoDetalhesForm } from "./orcamento-detalhes-form/orcamento-detalhes-form";
import { OrcamentoSchema } from '../../../../schema/orcamento-schema';
import { OrcamentoItemForm } from "./orcamento-item-form/orcamento-item-form";
import { OrcamentoInformacaoadicionalForm } from "./orcamento-informacaoadicional-form/orcamento-informacaoadicional-form";
import { FormatarDataBanco } from '../../../../utils/FormatarData';
import { OrcamentoResumo } from "./orcamento-resumo/orcamento-resumo";
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-orcamentoform',
  imports: [CardModule, ButtonModule, DividerModule, OrcamentoClienteForm, OrcamentoDetalhesForm, OrcamentoItemForm, OrcamentoInformacaoadicionalForm, OrcamentoResumo],
  templateUrl: './orcamentoform.html',
  styleUrl: './orcamentoform.scss',
})
export class Orcamentoform {

  router = inject(Router);
  public objeto: Orcamento = new Orcamento();

  public errorValidacao: Record<string, string> = {};
  public endpoint = 'orcamento';
  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  carregarDetalhes = false;


  ngAfterViewInit(): void {
    const key = Number(this.route.snapshot.paramMap.get('id'));


    this.eventService.atualizarCampoPersonalizado$.subscribe(() => {
      this.consultarPreviewValorFinal();
    });

    if (key == 0) {

    } else {
      this.onEdit(key);
    }
  }



  onEdit(id: number) {
    if (!id) {
      return;
    }

    this.baseService.findById(`${this.endpoint}`, id).subscribe({
      next: (res: any) => {
        this.objeto = res;
        this.objeto.descricaoMetodo = res.dsMetodoPrecificacao;
        this.objeto.dtEmissao = FormatarDataBanco(res.dtEmissao);
        this.objeto.dtValido = FormatarDataBanco(res.dtValido);

        this.cd.markForCheck();
      },
      error: (err) => {
        this.cd.markForCheck();
      },
    });
  }

  onClose() {
    this.router.navigate(['/client/orcamento']);
  }

  onSaveRascunho() {
   
    this.onSave('rascunho');
  }

  onSaveGerado() {
   
    this.onSave('gerar');
  }

  onSave(url?: string) {
    if (this.validarItens()) {

      let urlRequisicao =  url ? url : `cadastrar`;

      this.baseService.create(`${this.endpoint}/${urlRequisicao}`, this.objeto).subscribe({
        next: () => {

          this.cd.markForCheck();
          this.onClose()
        },
        error: (erro) => {
          this.cd.markForCheck();
        },
      });
    }
  }

  validarItens(): boolean {
    try {
      OrcamentoClienteSchema.parse([this.objeto.cliente]);
      OrcamentoSchema.parse([this.objeto]);
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

  processarTotalizador(valor: number): void {
    this.consultarPreviewValorFinal();
    this.objeto.vlPrecoBase = valor;
    this.objeto.vlPrecoFinal = valor;
  }

  //buscar preview
  consultarPreviewValorFinal() {
    if (this.objeto.orcamentoItem.length > 0) {

      this.baseService.post(`${this.endpoint}/preview-precificacao`, this.objeto).subscribe({
        next: (res) => {
          this.objeto.vlPrecoBase = res.valorTotal;
          this.cd.markForCheck();
        },
        error: (erro) => {
          this.cd.markForCheck();
        },
      });
    }
  }

}
