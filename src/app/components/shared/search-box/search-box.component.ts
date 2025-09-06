import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent {
  @Input() placeholder: string = 'Buscar...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  private searchTerm = signal('');

  ngOnInit() {
    this.searchTerm.set(this.value);
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchTerm.set(value);
    this.valueChange.emit(value);
  }

  get currentValue() {
    return this.searchTerm();
  }

  /**
   * Normaliza el texto eliminando tildes, convirtiendo a minúsculas y eliminando espacios extra
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y acentos
      .trim();
  }

  /**
   * Función estática para normalizar texto en los filtros
   */
  static normalizeForSearch(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y acentos
      .trim();
  }
}
