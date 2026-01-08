import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { BaseService } from '../../../../../services/base.service';
import { LayoutCampo } from "../../../../../components/layout-campo/layout-campo";
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FlagOption } from '../../../../../models/flag-option';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-orcamento-informacaoadicional-form',
  imports: [InputNumberModule, FormsModule, CommonModule, InputTextModule, ButtonModule, DividerModule, LayoutCampo, DatePickerModule, SelectModule,TextareaModule],
  templateUrl: './orcamento-informacaoadicional-form.html',
  styleUrl: './orcamento-informacaoadicional-form.scss',
})
export class OrcamentoInformacaoadicionalForm {
  @Input() objeto: any;
  @Input() errorValidacao: Record<string, string> = {};
  @Input() endpoint: string = '';

  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  public listaCondicaoPagamento: FlagOption[] = [];


  ngOnInit(): void {

    this.obterCondicao()
    this.obterTermoCondicoes()

  }

  obterCondicao() {
    this.baseService.findAll(`condicaopagamento/`).subscribe({
      next: (res) => {
        this.listaCondicaoPagamento = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index.idCondicaoPagamento;
          item.name = index.nmCondicaoPagamento;
          this.cd.markForCheck();
          return item;
        });

        this.objeto.idCondicaoPagamento = this.listaCondicaoPagamento[0].code
      },
      error: (err) => { },
    });
  }

   obterTermoCondicoes() {
    if (this.objeto.idOrcamento) return;

    this.baseService.findAll('configuracaoorcamento/').subscribe({
      next: (res) => {

        this.objeto.dsObservacoes = res.termosPadrao ?? '';
        
        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

}
