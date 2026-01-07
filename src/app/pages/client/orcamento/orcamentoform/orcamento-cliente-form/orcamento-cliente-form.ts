import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { LayoutCampo } from "../../../../../components/layout-campo/layout-campo";
import { BaseService } from '../../../../../services/base.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-orcamento-cliente-form',
  imports: [LayoutCampo, CommonModule, FormsModule, InputTextModule, TextareaModule, NgxMaskDirective],
  templateUrl: './orcamento-cliente-form.html',
  styleUrl: './orcamento-cliente-form.scss',
})
export class OrcamentoClienteForm {
  @Input() objeto: any;
  @Input() errorValidacao: Record<string, string> = {};

  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objeto']) {

      if (!this.objeto.cliente)
        this.objeto.cliente = {};

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

}
