import { Injectable, signal } from '@angular/core';
import { Catalogo } from '../models/catalogo';
import { CampoPrecificacaoDTO } from '../pages/client/catalogo/catalogocampoform/catalogocampoform';
import { BehaviorSubject } from 'rxjs';

export interface CatalogoDraft {

  // Aba 1 – Dados básicos
  cdCatalogo?: string;
  nmCatalogo?: string;
  dsCatalogo?: string;
  vlCustoBase?: number;
  vlPrecoBase?: number;

  // Aba 2 – Campos de precificação
  camposSelecionados: CampoPrecificacaoDTO[];

  // Aba 3 – Ajustes padrão
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

  // Observables públicos (readonly)
  camposSelecionados$ = this.camposSelecionadosSubject.asObservable();
  ajustesPadrao$ = this.ajustesPadraoSubject.asObservable();

  // Setters
  setCamposSelecionados(novosCampos: any[]) {

    const camposAtuais = this.camposSelecionadosSubject.value;
    const ajustesAtuais = this.ajustesPadraoSubject.value;

    // IDs dos novos campos
    const novosIds = new Set(
      novosCampos.map(c => c.idCampoPersonalizado)
    );

    // mantém apenas ajustes de campos que continuam existindo
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

  // (opcional) getters síncronos
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
