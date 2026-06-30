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
import { SelectCadastroRapido } from '../../../../../components/select-cadastro-rapido/select-cadastro-rapido';


@Component({
  selector: 'app-orcamento-detalhes-form',
  standalone: true,
  imports: [LayoutCampo, CommonModule, FormsModule, InputTextModule, DatePickerModule, SelectModule, SelectCadastroRapido],
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

    this.baseService.findAll('configuracao-orcamento').subscribe({
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
    this.baseService.findAll('empresa-metodos-precificacao').subscribe({
      next: (res) => {
        this.atualizarListaMetodo(this.mapearMetodos(res as any[]));
        this.cd.markForCheck();
      },
      error: () => { },
    });
  }

  atualizarListaMetodo(opcoes: FlagOption[]) {
    this.listaMetodo = opcoes.map((c) => {
      const item = new FlagOption();
      item.code = c.code;
      item.name = c.name;
      const extra = c.extra as Record<string, unknown> | undefined;
      item.extra = {
        descricao: extra?.['dsMetodoPrecificacao'] ?? extra?.['descricao'],
      };
      return item;
    });
  }

  private mapearMetodos(res: any[]): FlagOption[] {
    return res.map((index) => {
      const item = new FlagOption();
      item.code = index.idEmpresaMetodoPrecificacao;
      item.name = index.nmMetodoPrecificacao;
      item.extra = index;
      return item;
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
