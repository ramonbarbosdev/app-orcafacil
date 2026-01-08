import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { OrcamentoClienteForm } from "./orcamento-cliente-form/orcamento-cliente-form";
import { Orcamento } from '../../../../models/orcamento';
import { BaseService } from '../../../../services/base.service';
import { OrcamentoClienteSchema } from '../../../../schema/orcamentoclientes-schema';
import { ZodError } from 'zod';
import { OrcamentoDetalhesForm } from "./orcamento-detalhes-form/orcamento-detalhes-form";
import { OrcamentoSchema } from '../../../../schema/orcamento-schema';
import { OrcamentoItemForm } from "./orcamento-item-form/orcamento-item-form";

@Component({
  selector: 'app-orcamentoform',
  standalone: true,
  imports: [CardModule, ButtonModule, DividerModule, OrcamentoClienteForm, OrcamentoDetalhesForm, OrcamentoItemForm],
  templateUrl: './orcamentoform.html',
  styleUrl: './orcamentoform.scss',
})
export class Orcamentoform {

  router = inject(Router);
  public objeto: Orcamento = new Orcamento();

  public errorValidacao: Record<string, string> = {};
  public endpoint = 'orcamento';
  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  carregarDetalhes = false;


  ngAfterViewInit(): void {


  }

  onClose() {
    this.router.navigate(['/client/orcamento']);
  }

  onSave() {
    console.log(this.objeto)
    if (this.validarItens()) {

      this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto).subscribe({
        next: () => {

          this.cd.markForCheck();
          this.onClose()
        },
        error: (erro) => {
          this.cd.markForCheck();
        },
      });
    }
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
    this.objeto.vlPrecoBase = valor;
    this.objeto.vlPrecoFinal = valor;
  }

}
