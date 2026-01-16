import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { OrcamentoVisualizacao } from '../../../../models/orcamento-visualizacao';
import { BaseService } from '../../../../services/base.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orcamentoview',
  imports: [],
  templateUrl: './orcamentoview.html',
  styleUrl: './orcamentoview.scss',
})
export class Orcamentoview {

  orcamento!: OrcamentoVisualizacao;
  loading = true;

  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  public baseService = inject(BaseService);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.baseService.findById(`orcamento/visualizacao`, id).subscribe(res => {
      this.orcamento = res;
      this.loading = false;
    });
  }

  statusClass(status: string) {
    return {
      'bg-gray-100 text-gray-700': status === 'RASCUNHO',
      'bg-blue-100 text-blue-700': status === 'GERADO',
      'bg-yellow-100 text-yellow-700': status === 'ENVIADO',
      'bg-green-100 text-green-700': status === 'APROVADO',
      'bg-red-100 text-red-700': status === 'REJEITADO'
    };
  }


}
