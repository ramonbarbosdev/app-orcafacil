import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { OrcamentoClienteForm } from "./orcamento-cliente-form/orcamento-cliente-form";
import { Orcamento } from '../../../../models/orcamento';
import { BaseService } from '../../../../services/base.service';

@Component({
  selector: 'app-orcamentoform',
  imports: [CardModule, ButtonModule, DividerModule, OrcamentoClienteForm],
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
    //  this.carregarDetalhes = true;
  }

  onClose() {
    this.router.navigate(['/client/orcamento']);
  }
}
