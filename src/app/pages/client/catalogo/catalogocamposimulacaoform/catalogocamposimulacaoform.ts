import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogocamposimulacaoform',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogocamposimulacaoform.html',
  styleUrl: './catalogocamposimulacaoform.scss',
})
export class Catalogocamposimulacaoform {
  @Input() objeto: any;
  @Input() carregarDados = false;

  valorPreco = 0 
  valorCusto = 0

  ngOnChanges(changes: SimpleChanges): void {
    if (this.carregarDados && changes['objeto']) {
        this.valorPreco = this.objeto.vlPrecoBase
        this.valorCusto = this.objeto.vlCustoBase; 
     
    }
  }

  ngOnInit() {

  }

  get totalizador() {
    let total = 0

    total =   this.objeto.vlPrecoBase + this.objeto.vlCustoBase

    return total;
  }
}
