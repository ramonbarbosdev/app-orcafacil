import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-partilhar-orcamento',
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './partilhar-orcamento.html',
  styleUrl: './partilhar-orcamento.scss',
})
export class PartilharOrcamento {
  @Input() cdPublico!: string;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() show = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<any>();

  linkOrcamento = '';
  gerandoPdf = false;

  public baseService = inject(BaseService);
  router = inject(Router);
  private cd = inject(ChangeDetectorRef);

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
    console.log('Enviar WhatsApp');
  }

  enviarEmail() {
    console.log('Enviar Email');
  }

  copiarLink() {
    navigator.clipboard.writeText(this.linkOrcamento);
  }

  abrirView() {
    this.router.navigate(['public/orcamento', this.cdPublico]);
  }

  gerarPdf(): void {
    if (this.gerandoPdf) {
      return;
    }

    this.gerandoPdf = true;
    this.baseService.gerarEAbrirRelatorioPdf(this.cdPublico).subscribe({
      complete: () => {
        this.gerandoPdf = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.gerandoPdf = false;
        this.cd.markForCheck();
      },
    });
  }
}
