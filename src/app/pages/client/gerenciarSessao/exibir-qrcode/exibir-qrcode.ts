import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseService } from '../../../../services/base.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exibir-qrcode',
  imports: [DialogModule, FormsModule, CommonModule],
  templateUrl: './exibir-qrcode.html',
  styleUrl: './exibir-qrcode.scss',
})
export class ExibirQrcode {
  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() key!: number;

  public objeto: any = { nm_sessao: '', qrCode: '' };

  private baseService = inject(BaseService);
  private endpoint = 'whatsappsessao';

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.objeto = {};
  }

  ngOnInit(): void {
    this.onShow();
  }

  onShow = () => {

    let id = this.key ?? null;


     if (!id) {
       return;
     }
    this.baseService.findById(`${this.endpoint}/iniciar-sessao`, id).subscribe({
      next: (res) => {
    
        if (res.qrcode) {
          this.objeto.qrCode = res.qrcode;
        }
      },
      error: (err) => {},
    });
  };
}
