import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../../../services/base.service';
import { ZodError } from 'zod';
import { NovaSessaoSchema } from '../../../../schema/novasessao-schema';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-novasessao',
  imports: [DialogModule, ButtonModule, LayoutCampo, FormsModule, CommonModule, InputTextModule],
  templateUrl: './novasessao.html',
  styleUrl: './novasessao.scss',
})
export class Novasessao {
  @Input() isDialog: boolean = true;
  @Output() isDialogChange = new EventEmitter<boolean>();

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.objeto = {};
    this.errorValidacao = {};
  }

  private baseService = inject(BaseService);
  private endpoint = 'whatsappsessao';
  public errorValidacao: Record<string, string> = {};

  public objeto: any = { nm_sessao: '', qrCode: ''};

  onSave() {
    if (this.validarItens()) {
      this.baseService.create(`${this.endpoint}/criar-sessao`, this.objeto).subscribe({
        next: (res) => {
          // if ( res.qrcode) {
          //   this.objeto.qrCode = 'data:image/png;base64,' + res.qrcode;
          // }
          this.hideDialog();
        },
        error: (erro) => {},
      });
    }
  }

  validarItens(): boolean {
    try {
      NovaSessaoSchema.parse([this.objeto]);
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
}
