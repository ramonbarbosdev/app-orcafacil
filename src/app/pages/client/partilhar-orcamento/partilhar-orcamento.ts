import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Divider, DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-partilhar-orcamento',
  imports: [DialogModule, FormsModule, CommonModule, ButtonModule, InputTextModule, DividerModule, ButtonModule],
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
  public baseService = inject(BaseService);
  router = inject(Router);


  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.cancel.emit();
  }

  showDialog() {

    this.linkOrcamento = `${window.location.origin}/public/orcamento/${this.cdPublico}`;
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

  abrirView() {
    // navigator.clipboard.writeText(this.linkOrcamento);
      this.router.navigate(['public/orcamento', this.cdPublico]);

  }

  gerarPdf() {
    console.log('Gerar PDF');
  }

 

}
