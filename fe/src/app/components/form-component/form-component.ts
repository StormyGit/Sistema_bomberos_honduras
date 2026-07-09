import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, output, QueryList, Signal, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

interface iFilePreview {
  file: File;
  name: string;
  size: number;
  url?: string; // solo para imágenes
}

@Component({

  selector: 'app-form-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-component.html'
})
export class FormComponent {
  @ViewChildren('panelRef', { read: ElementRef })
  panels?: QueryList<ElementRef<HTMLElement>>;


  @Input() Formulary: iFormGroup | null = null;
  @Input() labelSudmit: string | null = null;
  @Input() ShowButtonCancel: boolean = false;
  @Output() getSubmit = new EventEmitter<iFormEmit>();
  @Output() getCancel = new EventEmitter();

  _OpenSelectInput: string = "";
  //svrToast = inject(ToastService);

  // previews de archivos/imágenes seleccionados, por nombre de campo
  _filesPreview: { [fieldName: string]: iFilePreview[] } = {};

  _formGroup!: FormGroup;
  fb = inject(FormBuilder);

  ngOnInit() {
    this.buildForm();
  }
buildForm() {
  const controls: any = {};

  if (this.Formulary) {
    this.Formulary.seccions.forEach(section => {
      section.field.forEach(field => {
        const validators = [];

        if (field.required) {
          validators.push(Validators.required);
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        if (field.type === 'number') {
          if (field.max) validators.push(Validators.max(field.max));
          if (field.min) validators.push(Validators.min(field.min));
        } else {
          if (field.max) validators.push(Validators.maxLength(field.max));
          if (field.min) validators.push(Validators.minLength(field.min));
        }

        const hasValue = field.value !== undefined && field.value !== null;

        const initialValue =
          field.type === 'checkbox'
            ? (hasValue ? !!field.value : false)
            : hasValue
              ? field.value
              : (field.type === 'image' || field.type === 'file')
                ? (field.file_Multiple ? [] : null)
                : '';

        controls[field.name] = [initialValue, validators];
      });
    });
  }

  this._formGroup = this.fb.group(controls);
}

  Submit() {
    const isValid = this._formGroup.valid;
    const dataForm = {
      status: isValid,
      data: isValid ? this.removeEmptyValues(this._formGroup.value) : {}
    };

    this.getSubmit.emit(dataForm);
  }

  Cancelar(){
    this.getCancel.emit();
  }

  removeEmptyValues(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ''
      )
    );
  }
@HostListener('document:mousedown', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as Node | null;
  if (!target) return;

  const clickedInsideAny =
    this.panels?.toArray().some(panel =>
      panel.nativeElement.contains(target)
    ) ?? false;

  if (!clickedInsideAny) {
    if (this._OpenSelectInput) {
      this._searchText[this._OpenSelectInput] = '';
    }
    this._OpenSelectInput = "";
  }
}

  selectOption(name: string, value: any) {
    this._formGroup.get(name)?.setValue(value);
    this._OpenSelectInput = '';
    this._searchText[name] = '';
    this.fieldChange.emit({ name, value });
  }

  toggleSelect(name: string) {
    console.log(name);
    this._OpenSelectInput =
      this._OpenSelectInput === name ? '' : name;
  }

  // ---------- Archivos / Imágenes ----------

  // mapea field.file -> accept del input nativo
  getFileAccept(field: iFormField): string {
    switch (field.file) {
      case 'pdf':   return '.pdf,application/pdf';
      case 'word':  return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'excel': return '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'png':   return '.png,image/png';
      case 'jpg':   return '.jpg,.jpeg,image/jpeg';
      default:      return field.type === 'image' ? 'image/*' : '*';
    }
  }

  // texto de ayuda bajo el dropzone
  getFileHint(field: iFormField): string {
    const tipo = field.file ? field.file.toUpperCase() : (field.type === 'image' ? 'JPG, PNG' : 'Cualquier archivo');
    return field.file_Multiple ? `${tipo} · puedes subir varios` : `${tipo} · un solo archivo`;
  }

  onFileChange(event: Event, field: iFormField) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const filesArray = Array.from(input.files);

    const previews: iFilePreview[] = filesArray.map(file => ({
      file,
      name: file.name,
      size: file.size,
      url: field.type === 'image' ? URL.createObjectURL(file) : undefined
    }));

    this._filesPreview[field.name] = previews;

    const value = field.file_Multiple ? filesArray : filesArray[0];
    this._formGroup.get(field.name)?.setValue(value);
    this._formGroup.get(field.name)?.markAsTouched();
    this._formGroup.get(field.name)?.markAsDirty();

    // limpia el input nativo para poder re-seleccionar el mismo archivo si se borra y se vuelve a elegir
    input.value = '';
  }

  removeFile(field: iFormField, index: number) {
    const current = this._filesPreview[field.name] ?? [];
    const removed = current[index];
    if (removed?.url) URL.revokeObjectURL(removed.url);

    current.splice(index, 1);
    this._filesPreview[field.name] = [...current];

    const value = field.file_Multiple
      ? current.map(p => p.file)
      : (current[0]?.file ?? null);

    this._formGroup.get(field.name)?.setValue(value);
    this._formGroup.get(field.name)?.markAsTouched();
    this._formGroup.get(field.name)?.markAsDirty();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getSelectedLabel(field: iFormField): string {
    const value = this._formGroup.get(field.name)?.value;
    if (value === null || value === undefined || value === '') return '';

    const selectedOption = this.getFieldOptions(field).find(op => op.value === value);
    return selectedOption?.label ?? '';
  }



  @Output() fieldChange = new EventEmitter<{ name: string; value: any }>();

  // opciones dinámicas por campo (si existe, pisa a field.option)
  _dynamicOptions: { [fieldName: string]: iFormOption[] } = {};

  // Devuelve las opciones a pintar en el template
  getFieldOptions(field: iFormField): iFormOption[] {
    return this._dynamicOptions[field.name] ?? field.option ?? [];
  }

  // // Método público: lo llamas desde el padre cuando llegan los municipios, etc.
  // setFieldOptions(fieldName: string, options: iFormOption[], resetValue: boolean = true) {
  //   this._dynamicOptions[fieldName] = options;
  //   if (resetValue) {
  //     this._formGroup.get(fieldName)?.setValue(null);
  //   }
  // }

  // Por si necesitas ir agregando de a uno
  addFieldOption(fieldName: string, option: iFormOption) {
    const current = this._dynamicOptions[fieldName] ?? [];
    this._dynamicOptions[fieldName] = [...current, option];
  }










// Setea SOLO el valor de un campo (sirve para inputs normales también, no solo selects)
setFieldValue(fieldName: string, value: any) {
  this._formGroup.get(fieldName)?.setValue(value);
}

// Setea opciones + valor de una sola vez (útil para selects)
setFieldOptions(fieldName: string, options: iFormOption[], resetValue: boolean = true) {
  this._dynamicOptions[fieldName] = options;
  if (resetValue) {
    this._formGroup.get(fieldName)?.setValue(null);
  }
}

// Setea varios campos a la vez (ideal para "precargar" un form completo)
patchForm(data: { [key: string]: any }) {
  this._formGroup.patchValue(data);
}



// nuevo: texto de búsqueda por campo
_searchText: { [fieldName: string]: string } = {};

// valor a mostrar en el input: si está abierto muestra lo que escribiste,
// si está cerrado muestra la opción seleccionada
getSelectSearchValue(field: iFormField): string {
  if (this._OpenSelectInput === field.name) {
    return this._searchText[field.name] ?? '';
  }
  return this.getSelectedLabel(field);
}

// al hacer foco: abre el panel y arranca la búsqueda vacía
onSelectSearchFocus(field: iFormField) {
  this._OpenSelectInput = field.name;
  this._searchText[field.name] = '';
}

// al escribir: filtra
onSelectSearchInput(event: Event, field: iFormField) {
  const value = (event.target as HTMLInputElement).value;
  this._searchText[field.name] = value;
  this._OpenSelectInput = field.name;
}

// opciones filtradas por el texto escrito
getFilteredOptions(field: iFormField): iFormOption[] {
  const search = (this._searchText[field.name] ?? '').toLowerCase().trim();
  const options = this.getFieldOptions(field);
  if (!search) return options;
  return options.filter(op => (op.label ?? '').toLowerCase().includes(search));
}

}
