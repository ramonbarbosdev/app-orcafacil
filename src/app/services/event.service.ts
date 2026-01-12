import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private atualizarCampoPersonalizado = new Subject<void>();
  atualizarCampoPersonalizado$ = this.atualizarCampoPersonalizado.asObservable();

  emitAtualizarCampoPersonalizado() {
    this.atualizarCampoPersonalizado.next();
  }

  private consultarPreviewValorFinal = new Subject<void>();
  consultarPreviewValorFinal$ = this.consultarPreviewValorFinal.asObservable();

  emitConsultarPreviewValorFinal() {
    this.consultarPreviewValorFinal.next();
  }


}
