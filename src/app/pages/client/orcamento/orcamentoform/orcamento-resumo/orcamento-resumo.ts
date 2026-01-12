import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseService } from '../../../../../services/base.service';

@Component({
  selector: 'app-orcamento-resumo',
  imports: [CommonModule, FormsModule],
  templateUrl: './orcamento-resumo.html',
  styleUrl: './orcamento-resumo.scss',
})
export class OrcamentoResumo {
  @Input() objeto: any;



}
