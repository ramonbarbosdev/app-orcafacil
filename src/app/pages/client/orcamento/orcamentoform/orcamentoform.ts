import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { OrcamentoClienteForm } from './orcamento-cliente-form/orcamento-cliente-form';
import { Orcamento } from '../../../../models/orcamento';
import { Orcamentoitem } from '../../../../models/orcamentoitem';
import { Clientes } from '../../../../models/clientes';
import { BaseService } from '../../../../services/base.service';
import { OrcamentoClienteSchema } from '../../../../schema/orcamentoclientes-schema';
import { ZodError } from 'zod';
import { OrcamentoDetalhesForm } from './orcamento-detalhes-form/orcamento-detalhes-form';
import { OrcamentoSchema } from '../../../../schema/orcamento-schema';
import { OrcamentoItemForm } from './orcamento-item-form/orcamento-item-form';
import { OrcamentoInformacaoadicionalForm } from './orcamento-informacaoadicional-form/orcamento-informacaoadicional-form';
import { FormatarDataBanco } from '../../../../utils/FormatarData';
import { OrcamentoResumo } from './orcamento-resumo/orcamento-resumo';
import { EventService } from '../../../../services/event.service';
import { PartilharOrcamento } from '../../partilhar-orcamento/partilhar-orcamento';

@Component({
  selector: 'app-orcamentoform',
  imports: [
    CardModule,
    ButtonModule,
    DividerModule,
    OrcamentoClienteForm,
    OrcamentoDetalhesForm,
    OrcamentoItemForm,
    OrcamentoInformacaoadicionalForm,
    OrcamentoResumo,
    PartilharOrcamento,
  ],
  templateUrl: './orcamentoform.html',
  styleUrl: './orcamentoform.scss',
})
export class Orcamentoform {
  router = inject(Router);
  public objeto: Orcamento = new Orcamento();

  public errorValidacao: Record<string, string> = {};
  public endpoint = 'orcamentos';
  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  partilharVisible: boolean = false;

  ngOnInit(): void {
    this.objeto.orcamentoItem = this.objeto.orcamentoItem ?? [];
  }

  ngAfterViewInit(): void {
    const key = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.atualizarCampoPersonalizado$.subscribe(() => {
      this.consultarPreviewValorFinal();
    });

    if (key) {
      this.onEdit(key);
    }
  }

  hideDialog() {
    this.partilharVisible = false;
  }

  onEdit(id: number) {
    if (!id) return;

    this.baseService.findById(this.endpoint, id).subscribe({
      next: (res: any) => {
        this.aplicarOrcamentoCarregado(res);
      },
      error: () => this.cd.markForCheck(),
    });
  }

  private aplicarOrcamentoCarregado(res: any): void {
    this.objeto = {
      ...res,
      orcamentoItem: this.mapearItens(res.itens ?? res.orcamentoItem ?? []),
      descricaoMetodo: res.dsMetodoPrecificacao,
      dtEmissao: FormatarDataBanco(res.dtEmissao),
      dtValido: FormatarDataBanco(res.dtValido),
      cliente: res.cliente ?? {
        idCliente: res.idCliente,
        nmCliente: res.nmCliente ?? '',
      },
    };

    if (res.idCliente) {
      this.carregarDadosCliente(res.idCliente, res.nmCliente);
      return;
    }

    this.cd.markForCheck();
  }

  private carregarDadosCliente(idCliente: number, nmCliente?: string): void {
    this.baseService.findById('clientes', idCliente).subscribe({
      next: (cliente: any) => {
        this.objeto.cliente = {
          idCliente: cliente.idCliente ?? idCliente,
          nmCliente: cliente.nmCliente ?? nmCliente ?? '',
          nuCpfcnpj: cliente.nuCpfcnpj ?? '',
          dsEmail: cliente.dsEmail ?? '',
          nuTelefone: cliente.nuTelefone ?? '',
          dsObservacoes: cliente.dsObservacoes ?? '',
        } as Clientes;
        this.objeto.idCliente = this.objeto.cliente?.idCliente ?? idCliente;
        this.cd.markForCheck();
      },
      error: () => {
        this.objeto.cliente = {
          idCliente,
          nmCliente: nmCliente ?? '',
          nuCpfcnpj: '',
          dsEmail: '',
          nuTelefone: '',
          dsObservacoes: '',
        } as Clientes;
        this.objeto.idCliente = idCliente;
        this.cd.markForCheck();
      },
    });
  }

  private mapearItens(itens: any[]): Orcamentoitem[] {
    return (itens ?? []).map(
      (item) =>
        new Orcamentoitem({
          ...item,
          orcamentoItemCampoValor: item.orcamentoItemCampoValor ?? item.camposValor ?? [],
        })
    );
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

  onSave(mode?: string) {
    if (!this.validarItens()) return;

    const payload = this.toApiPayload();

    if (mode === 'rascunho') {
      this.baseService.post(`${this.endpoint}/rascunho`, payload).subscribe({
        next: () => {
          this.cd.markForCheck();
          this.onClose();
        },
        error: () => this.cd.markForCheck(),
      });
      return;
    }

    if (mode === 'gerar') {
      const id = this.objeto.idOrcamento;
      if (!id) {
        this.baseService.post(`${this.endpoint}/rascunho`, payload).subscribe({
          next: (res: any) => {
            const newId = res.idOrcamento ?? res;
            this.gerarOrcamento(newId, payload);
          },
          error: () => this.cd.markForCheck(),
        });
      } else {
        this.gerarOrcamento(id, payload);
      }
      return;
    }

    this.baseService.save(this.endpoint, payload, this.objeto.idOrcamento).subscribe({
      next: () => {
        this.cd.markForCheck();
        this.onClose();
      },
      error: () => this.cd.markForCheck(),
    });
  }

  private gerarOrcamento(id: number, payload: unknown) {
    this.baseService.post(`${this.endpoint}/${id}/gerar`, payload).subscribe({
      next: (res: any) => {
        this.objeto.cdPublico = res.cdPublico ?? res;
        this.partilharVisible = true;
        this.cd.markForCheck();
      },
      error: () => this.cd.markForCheck(),
    });
  }

  private toApiPayload(): Record<string, unknown> {
    const { orcamentoItem, cliente, ...rest } = this.objeto as Orcamento & {
      orcamentoItem: unknown[];
      cliente?: Orcamento['cliente'];
    };

    return {
      ...rest,
      idCliente: cliente?.idCliente ?? rest.idCliente,
      cliente,
      itens: orcamentoItem ?? [],
    };
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

  consultarPreviewValorFinal() {
    if ((this.objeto.orcamentoItem?.length ?? 0) > 0) {
      this.baseService.post(`${this.endpoint}/preview-precificacao`, this.toApiPayload()).subscribe({
        next: (res: any) => {
          this.objeto.vlPrecoBase = res.valorTotal ?? res;
          this.cd.markForCheck();
        },
        error: () => this.cd.markForCheck(),
      });
    }
  }
}
