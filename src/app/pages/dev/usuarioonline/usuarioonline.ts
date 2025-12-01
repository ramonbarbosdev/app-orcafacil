import { Component, inject } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { Usuariosonline } from '../../../models/usuariosonline';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../../services/websocket.service';

@Component({
  selector: 'app-usuarioonline',
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarioonline.html',
  styleUrl: './usuarioonline.scss',
})
export class Usuarioonline {
  usuarios: Usuariosonline[] = [];
  carregando = false;

  public baseService = inject(BaseService);
  private wsService = inject(WebsocketService);

  ngOnInit() {
    this.wsService.getOnline().subscribe((msg) => {
      this.carregarUsuarios();
    });

    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.carregando = true;
    this.baseService.findAll('usuarioonline/').subscribe({
      next: (res) => {
        this.usuarios = res;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários online:', err);
        this.carregando = false;
      },
    });
  }
}
