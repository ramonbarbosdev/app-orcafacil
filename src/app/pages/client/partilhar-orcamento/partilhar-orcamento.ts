import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Divider, DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-partilhar-orcamento',
  imports: [DialogModule, FormsModule, CommonModule, ButtonModule, InputTextModule, DividerModule],
  templateUrl: './partilhar-orcamento.html',
  styleUrl: './partilhar-orcamento.scss',
})
export class PartilharOrcamento {

  @Input() cdPublico!: string ;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() show = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<any>();

  linkOrcamento = '';

  private cd = inject(ChangeDetectorRef);
  public baseService = inject(BaseService);


  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.cancel.emit();
  }

  showDialog() {

    this.linkOrcamento = `${window.location.origin}/orcamentos/${this.cdPublico}`;
    this.visible = true;
  }



  enviarWhatsApp() {
    // depois você integra com backend
    console.log('Enviar WhatsApp');
  }

  enviarEmail() {
    console.log('Enviar Email');
  }

  copiarLink() {
    navigator.clipboard.writeText(this.linkOrcamento);
  }

  gerarPdf() {
    console.log('Gerar PDF');
  }

 

}
