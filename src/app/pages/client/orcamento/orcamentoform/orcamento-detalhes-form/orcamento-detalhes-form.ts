import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { BaseService } from '../../../../../services/base.service';
import { LayoutCampo } from '../../../../../components/layout-campo/layout-campo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FlagOption } from '../../../../../models/flag-option';
import { SelectModule } from 'primeng/select';
import { EventService } from '../../../../../services/event.service';


@Component({
  selector: 'app-orcamento-detalhes-form',
  standalone: true,
  imports: [LayoutCampo, CommonModule, FormsModule, InputTextModule, DatePickerModule, SelectModule],
  templateUrl: './orcamento-detalhes-form.html',
  styleUrl: './orcamento-detalhes-form.scss',
})
export class OrcamentoDetalhesForm {
  @Input() objeto: any;
  @Input() errorValidacao: Record<string, string> = {};
  @Input() endpoint: string = '';

  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  private eventService = inject(EventService);

  public listaMetodo: FlagOption[] = [];


  ngOnInit(): void {
    if (!this.objeto.dtEmissao) {
      this.objeto.dtEmissao = new Date();
    }
    this.obterDiasValido()
    this.obterMetodo();
    this.obterSequencia();
  }

  obterSequencia() {
    this.baseService.findSequence(this.endpoint).subscribe({
      next: (res) => {
        this.objeto.nuOrcamento = res.sequencia;
        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

  obterDiasValido() {

    if (this.objeto.idOrcamento) return;

    this.baseService.findAll('configuracaoorcamento/').subscribe({
      next: (res) => {

        const validadeDias = res.validadeDias ?? 30;
        const dtBase = new Date(this.objeto.dtEmissao);
        dtBase.setDate(dtBase.getDate() + validadeDias);
        this.objeto.dtValido = dtBase;

        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

  obterMetodo() {
    this.baseService.findAll(`empresametodoprecificacao/listar`).subscribe({
      next: (res) => {
        this.listaMetodo = (res.content as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index.idEmpresaMetodoPrecificacao;
          item.name = index.nmMetodoPrecificacao;
          item.extra = { descricao: index.dsMetodoPrecificacao };
          this.cd.markForCheck();
          return item;
        });
      },
      error: (err) => { },
    });
  }


  descricao: any;

  processarMetodo(event: any) {
    const metodo = this.listaMetodo.find(m => m.code === event);
    if (metodo) {
      this.objeto.descricaoMetodo = metodo.extra?.['descricao']
    }
    this.eventService.emitAtualizarCampoPersonalizado();


  }
}
