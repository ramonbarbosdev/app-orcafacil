import { Component, inject } from '@angular/core';
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CampoPrecificacaoDTO } from '../catalogocampoform/catalogocampoform';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalogocampoajusteform',
  imports: [CommonModule,
    FormsModule,
    InputNumberModule,
    InputTextModule],
  templateUrl: './catalogocampoajusteform.html',
  styleUrl: './catalogocampoajusteform.scss',
})
export class Catalogocampoajusteform {

  
  private wizardState = inject(CatalogoWizardStateService);

  camposAtivos: CampoPrecificacaoDTO[] = [];
  ajustesPadrao: Record<number, any> = {};

  private sub = new Subscription();

  ngOnInit() {

    this.sub.add(
      this.wizardState.camposSelecionados$
        .subscribe(campos => {
          this.camposAtivos = campos;
        })
    );

    this.sub.add(
      this.wizardState.ajustesPadrao$
        .subscribe(ajustes => {
          this.ajustesPadrao = ajustes;
        })
    );
  }

  setValor(idCampo: number, valor: any) {
    this.wizardState.setAjustePadrao(idCampo, valor);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();

  }

}
