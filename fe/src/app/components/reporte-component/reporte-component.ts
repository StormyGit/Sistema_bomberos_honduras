import {
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-report-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-component.html',
  styleUrl: './reporte-component.css'
})
export class ReportComponent {

  @Input() showBotton: boolean = true;

  @Input()
  titulo = 'Reporte';

  @Input()
  subtitulo: string | null = null;

  @Input()
  logoIzquierdo: string | null = " - ";

  @Input()
  logoDerecho: string | null = " - ";

  /*
   * JSON que define la estructura.
   */
  @Input()
  structure: iFormGroup | null = null;

  /*
   * JSON que contiene los valores.
   */
  @Input()
  values: Record<string, any> = {};

  @ViewChild('reportContent')
  reportContent?: ElementRef<HTMLElement>;

  generandoPdf = false;

public async descargarPdf(): Promise<void> {

  const element = this.reportContent?.nativeElement;

  if (!element || this.generandoPdf) {
    return;
  }

  this.generandoPdf = true;

  try {

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true
    });

    await pdf.html(element, {

      x: 10,
      y: 10,

      /*
       * Una página carta mide aproximadamente 216 mm.
       * Dejamos 10 mm a cada lado:
       *
       * 216 - 20 = 196 mm
       */
      width: 196,

      /*
       * Ancho original del componente en píxeles.
       * jsPDF calculará automáticamente la reducción.
       */
      windowWidth: element.scrollWidth,

      autoPaging: 'text',

      html2canvas: {
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      }
    });

    pdf.save('reporte.pdf');

  } catch (error) {

    console.error(
      'Error generando el PDF:',
      error
    );

  } finally {

    this.generandoPdf = false;

  }
}

  /**
   * Obtiene el ancho del campo.
   *
   * w: 1 = 100%
   * w: 2 = 50%
   * w: 3 = 33.33%
   * w: 4 = 25%
   */
  getWidth(w?: number): string {

    const divider = Math.min(
      6,
      Math.max(1, w ?? 1)
    );

    return `${100 / divider}%`;
  }

  /**
   * Devuelve las filas de una sección.
   *
   * Si no tiene rows, devuelve el objeto general.
   * Si tiene rows, busca el arreglo dentro de values.
   */
  getSectionRows(
    section: iFormSeccion
  ): any[] {

    if (!section.rows) {
      return [this.values];
    }

    const source = this.getByPath(
      this.values,
      section.rows.name
    );

    const rows = Array.isArray(source)
      ? [...source]
      : [];

    const limitedRows =
      section.rows.limit === null
        ? rows
        : rows.slice(
            0,
            section.rows.limit
          );

    while (
      limitedRows.length <
      section.rows.min
    ) {
      limitedRows.push({});
    }

    return limitedRows;
  }

  /**
   * Obtiene y formatea el valor del campo.
   */
  getValue(
    field: iFormField,
    context: any
  ): string {

    const localValue = this.getByPath(
      context,
      field.name
    );

    const globalValue = this.getByPath(
      this.values,
      field.name
    );

    const value =
      localValue ??
      globalValue ??
      field.value ??
      '';

    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    if (
      field.type === 'select' ||
      field.type === 'select-search' ||
      field.type === 'autocomplete'
    ) {

      const option = field.option?.find(
        item =>
          String(item.value) ===
          String(value)
      );

      return option?.label ??
        String(value);
    }

    if (field.type === 'date') {
      return this.formatDate(value);
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {

      return (
        value.label ??
        value.nombre ??
        JSON.stringify(value)
      );
    }

    return String(value);
  }

  isChecked(
    field: iFormField,
    context: any
  ): boolean {

    const localValue = this.getByPath(
      context,
      field.name
    );

    const globalValue = this.getByPath(
      this.values,
      field.name
    );

    const value =
      localValue ??
      globalValue ??
      field.value;

    return (
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'true' ||
      value === 'si' ||
      value === 'sí'
    );
  }

  getImage(
    field: iFormField,
    context: any
  ): string | null {

    const localValue = this.getByPath(
      context,
      field.name
    );

    const globalValue = this.getByPath(
      this.values,
      field.name
    );

    const value =
      localValue ??
      globalValue ??
      field.value;

    if (typeof value === 'string') {
      return value;
    }

    if (
      value &&
      typeof value.url === 'string'
    ) {
      return value.url;
    }

    return null;
  }

  getTextareaHeight(
    field: iFormField
  ): number {

    return (field.h ?? 3) * 24;
  }

  private getByPath(
    source: any,
    path: string
  ): any {

    if (
      source === null ||
      source === undefined ||
      !path
    ) {
      return undefined;
    }

    return path
      .split('.')
      .reduce(
        (current, property) =>
          current?.[property],
        source
      );
  }

  private formatDate(
    value: any
  ): string {

    if (typeof value === 'string') {

      const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      'es-HN'
    );
  }

  private normalizarNombre(
    value: string
  ): string {

    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(
        /[^a-z0-9áéíóúñ-]/gi,
        ''
      );
  }
}
