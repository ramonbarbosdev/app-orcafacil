import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { FlagOption } from '../../models/flag-option';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  imports: [AutoCompleteModule, CommonModule, FormsModule],
  templateUrl: './autocomplete.html',
  styleUrl: './autocomplete.scss',
})
export class Autocomplete {
  @Input() options: FlagOption[] = [];
  @Input() placeholder: string = 'Selecione';
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'name';
  @Input() selectionLimit: number = 1;
  @Input() selectedOptions: any;
  @Input() error: string | null = null;
  @Input() disabled: boolean = false;

  @Output() selectedOptionsChange = new EventEmitter<string | string[]>();

  filtered: any[] = [];

  filterAuto(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();

    this.filtered = this.options
      .filter((city: any) => city.name.toLowerCase().includes(query))
      .slice(0, 50);
  }

  // onChange(value: any) {
  //   console.log(value);
  //   this.selectedOptionsChange.emit(value.code || null);
  // }

  onSelect(event: any) {
    // Quando o usuário seleciona da lista
    this.emitValue(event);
  }

  onInput(event: any) {
    // Quando o usuário digita livremente no campo
    const inputValue = event.target.value;
    this.emitValue(inputValue);
  }

  private emitValue(value: any) {

    if (this.optionValue && typeof value === 'object') {
      this.selectedOptionsChange.emit(value.value ?? null);
    } else {
      this.selectedOptionsChange.emit(value ?? null);
    }
    
  }
}
