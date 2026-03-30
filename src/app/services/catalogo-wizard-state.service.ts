import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Campopersonalizado } from '../models/campopersonalizado';

export interface AjusteCampo {
  valor: number;
  descricao: string;
}

export interface CatalogoDraft {
  cdCatalogo?: string;
  nmCatalogo?: string;
  dsCatalogo?: string;
  vlCustoBase?: number;
  vlPrecoBase?: number;

  camposSelecionados: Campopersonalizado[];

  ajustesPadrao: Record<number, AjusteCampo>;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogoWizardStateService {

  private camposSelecionadosSubject =
    new BehaviorSubject<Campopersonalizado[]>([]);

  private ajustesPadraoSubject =
    new BehaviorSubject<Record<number, AjusteCampo>>({});

  camposSelecionados$ = this.camposSelecionadosSubject.asObservable();
  ajustesPadrao$ = this.ajustesPadraoSubject.asObservable();

  setCamposSelecionados(novosCampos: Campopersonalizado[]) {
    const ajustesAtuais = this.ajustesPadraoSubject.value;

    const novosIds = new Set(
      novosCampos.map(c => c.idCampoPersonalizado)
    );

    const ajustesReconstruidos: Record<number, AjusteCampo> = {};

    for (const id of Object.keys(ajustesAtuais)) {
      const idNum = Number(id);
      if (novosIds.has(idNum)) {
        ajustesReconstruidos[idNum] = ajustesAtuais[idNum];
      }
    }

    this.camposSelecionadosSubject.next([...novosCampos]);
    this.ajustesPadraoSubject.next(ajustesReconstruidos);
  }

  setAjustePadrao(idCampo: number, payload: { valor: number; descricao?: string }) {
    const atual = this.ajustesPadraoSubject.value;

    this.ajustesPadraoSubject.next({
      ...atual,
      [idCampo]: {
        valor: payload.valor,
        descricao: payload.descricao ?? atual[idCampo]?.descricao ?? ''
      }
    });
  }

  getCamposSelecionadosSnapshot() {
    return this.camposSelecionadosSubject.value;
  }

  getAjustesPadraoSnapshot(): Record<number, AjusteCampo> {
    return this.ajustesPadraoSubject.value;
  }

  hidratar(
    campos: Campopersonalizado[],
    ajustes: Record<number, AjusteCampo>
  ): void {
    this.camposSelecionadosSubject.next(campos);
    this.ajustesPadraoSubject.next(ajustes);
  }

  reset(): void {
    this.camposSelecionadosSubject.next([]);
    this.ajustesPadraoSubject.next({});
  }
}