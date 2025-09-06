import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  
  /**
   * Normaliza el texto eliminando tildes, convirtiendo a minúsculas y eliminando espacios extra
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y acentos
      .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno solo
      .trim();
  }

  /**
   * Verifica si el texto contiene el término de búsqueda (normalizado)
   */
  containsSearchTerm(text: string, searchTerm: string): boolean {
    if (!searchTerm || !text) return true;
    
    const normalizedText = this.normalizeText(text);
    const normalizedSearchTerm = this.normalizeText(searchTerm);
    
    return normalizedText.includes(normalizedSearchTerm);
  }

  /**
   * Busca en múltiples campos de texto
   */
  searchInFields(searchTerm: string, ...fields: string[]): boolean {
    if (!searchTerm) return true;
    
    const normalizedSearchTerm = this.normalizeText(searchTerm);
    
    return fields.some(field => {
      if (!field) return false;
      const normalizedField = this.normalizeText(field);
      return normalizedField.includes(normalizedSearchTerm);
    });
  }

  /**
   * Busca en arrays de texto (como tags, categorías, etc.)
   */
  searchInArray(searchTerm: string, array: string[]): boolean {
    if (!searchTerm || !array || array.length === 0) return true;
    
    const normalizedSearchTerm = this.normalizeText(searchTerm);
    
    return array.some(item => {
      const normalizedItem = this.normalizeText(item);
      return normalizedItem.includes(normalizedSearchTerm);
    });
  }

  /**
   * Filtro genérico para arrays de objetos
   */
  filterArray<T>(
    array: T[], 
    searchTerm: string, 
    searchFields: (item: T) => string[]
  ): T[] {
    if (!searchTerm) return array;
    
    return array.filter(item => {
      const fields = searchFields(item);
      return this.searchInFields(searchTerm, ...fields);
    });
  }
}
