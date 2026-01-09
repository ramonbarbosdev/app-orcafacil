import { Injectable, signal } from '@angular/core';
import { Catalogo } from '../models/catalogo';
import { CampoPrecificacaoDTO } from '../pages/client/catalogo/catalogocampoform/catalogocampoform';
import { BehaviorSubject } from 'rxjs';

export interface CatalogoDraft {

  cdCatalogo?: string;
  nmCatalogo?: string;
  dsCatalogo?: string;
  vlCustoBase?: number;
  vlPrecoBase?: number;

  camposSelecionados: CampoPrecificacaoDTO[];

  ajustesPadrao: {
    [idCampoPersonalizado: number]: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CatalogoWizardStateService {

  private camposSelecionadosSubject =
    new BehaviorSubject<CampoPrecificacaoDTO[]>([]);

  private ajustesPadraoSubject =
    new BehaviorSubject<Record<number, any>>({});

  camposSelecionados$ = this.camposSelecionadosSubject.asObservable();
  ajustesPadrao$ = this.ajustesPadraoSubject.asObservable();

  setCamposSelecionados(novosCampos: any[]) {

    const camposAtuais = this.camposSelecionadosSubject.value;
    const ajustesAtuais = this.ajustesPadraoSubject.value;

    const novosIds = new Set(
      novosCampos.map(c => c.idCampoPersonalizado)
    );

    const ajustesReconstruidos: Record<number, any> = {};

    for (const id of Object.keys(ajustesAtuais)) {
      const idNum = Number(id);
      if (novosIds.has(idNum)) {
        ajustesReconstruidos[idNum] = ajustesAtuais[idNum];
      }
    }

    this.camposSelecionadosSubject.next([...novosCampos]);
    this.ajustesPadraoSubject.next(ajustesReconstruidos);
  }

  setAjustePadrao(idCampo: number, valor: any) {
    const atual = this.ajustesPadraoSubject.value;

    this.ajustesPadraoSubject.next({
      ...atual,
      [idCampo]: valor,
    });
  }

  getCamposSelecionadosSnapshot() {
    return this.camposSelecionadosSubject.value;
  }

  getAjustesPadraoSnapshot(): Record<number, any> {
    return this.ajustesPadraoSubject.value;
  }

  hidratar(
    campos: CampoPrecificacaoDTO[],
    ajustes: Record<number, any>
  ): void {
    this.camposSelecionadosSubject.next(campos);
    this.ajustesPadraoSubject.next(ajustes);
  }


  reset(): void {
    this.camposSelecionadosSubject.next([]);
    this.ajustesPadraoSubject.next({});
  }


}
