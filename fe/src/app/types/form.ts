interface iFormGroup {
    seccions: iFormSeccion[]
}

interface iFormSeccion {
    title: String | null;
    showTitle?: boolean;
    w?: 1 | 2 | 3 | 4 | 5 | 6;
    rows?: iFormRows;
    field: iFormField[];
}

interface iFormRows{
  name: string;
  min: number;
  limit: number | null;
}

interface iFormField {
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'password' | 'image' | 'file' | 'input' | 'textarea' | 'date' | 'checkbox' | 'select-search' | 'autocomplete' | 'phone';
    name: string;
    max?: number;
    min?: number;
    minChars?: number;
    allowFreeText?: boolean;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    value?: any;
    file?: 'pdf' | 'word' | 'excel' | 'png' | 'jpg';
    file_Multiple?: boolean;
    option?: iFormOption[];
    w?: 1 | 2 | 3 | 4 | 5 | 6;
    h?: 1 | 2 | 3 | 4 | 5 | 6;
}
interface iFormOption {
    label: string;
    value: string | null;
    selected?: boolean;
}

interface iFormEmit {
    status: boolean;
    data: any | null;
}


interface iFormMessage {
  text: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
