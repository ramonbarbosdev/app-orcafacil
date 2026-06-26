import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-layout-card-config',
  imports: [CommonModule, DividerModule, ButtonModule, CardModule],
  templateUrl: './layout-card-config.html',
  styleUrl: './layout-card-config.scss',
})
export class LayoutCardConfig {

  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon: string = 'pi pi-cog';
  @Input() showSalvar = true;
  @Output() salvar = new EventEmitter<void>();

  onSalvar(): void {
    this.salvar.emit();
  }
}
