import { Component, inject } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { Usuariosonline } from '../../../models/usuariosonline';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../../services/websocket.service';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ListboxModule } from 'primeng/listbox';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-usuarioonline',
  imports: [
    FormsModule,
    CommonModule,
    TagModule,
    DividerModule,
    CardModule,
    ListboxModule,
    AvatarModule,
    DataViewModule,
  ],
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

  getInitials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
