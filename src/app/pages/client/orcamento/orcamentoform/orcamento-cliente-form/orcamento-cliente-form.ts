import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { LayoutCampo } from "../../../../../components/layout-campo/layout-campo";
import { BaseService } from '../../../../../services/base.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NgxMaskDirective } from 'ngx-mask';
import { Autocomplete } from '../../../../../components/autocomplete/autocomplete';
import { FlagOption } from '../../../../../models/flag-option';

@Component({
  selector: 'app-orcamento-cliente-form',
  imports: [LayoutCampo, CommonModule, FormsModule, InputTextModule, TextareaModule, NgxMaskDirective, Autocomplete],
  templateUrl: './orcamento-cliente-form.html',
  styleUrl: './orcamento-cliente-form.scss',
})
export class OrcamentoClienteForm {
  @Input() objeto: any;
  @Input() errorValidacao: Record<string, string> = {};

  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  listaCliente: FlagOption[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objeto']) {

      if (!this.objeto.cliente)
        this.objeto.cliente = {};

      this.obterCliente();
    }
  }



  processarMascaraCpfCnpj(event: any): void {
    let valor = event.target.value || '';

    valor = valor.replace(/\D/g, '');

    if (valor.length <= 11) {
      // CPF
      valor = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      valor = valor
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.objeto.cliente.nuCpfcnpj = valor;
  }

   processarCliente(event: any) {
    const isObject = event && typeof event === 'object';

    if (isObject) {
      this.objeto.cliente.idCliente = Number(event?.code) ?? null;
      this.objeto.cliente.nmCliente = event?.name ?? null;
      this.objeto.cliente.nuCpfcnpj = event?.extra?.nuCpfcnpj ?? '';
      this.objeto.cliente.nuTelefone = event?.extra?.nuTelefone ?? '';
      this.objeto.cliente.dsEmail = event?.extra?.dsEmail ?? '';
      this.objeto.cliente.dsObservacoes = event?.extra?.dsObservacoes ?? '';
    } else {
      this.objeto.cliente.idCliente = null;
      this.objeto.cliente.nuCpfcnpj = '';
      this.objeto.cliente.nmPerfilcliente = '';
      this.objeto.cliente.nuTelefone = '';
      this.objeto.cliente.dsEmail = '';
      this.objeto.cliente.dsObservacoes = '';
    }

  }

  obterCliente() {
    this.baseService.findAll(`cliente/`).subscribe({
      next: (res) => {
        this.listaCliente = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = String(index.idCliente);
          item.name = index.nmCliente;
          item.extra = {
            nuCpfcnpj: index.nuCpfcnpj,
            nuTelefone: index.nuTelefone,
            dsEmail: index.dsEmail,
            dsObservacoes: index.dsObservacoes,
          };
          return item;
        });
        this.cd.markForCheck();
      },
      error: (err) => {
        this.cd.markForCheck();
      },
    });
  }


}
