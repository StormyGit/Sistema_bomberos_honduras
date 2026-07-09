import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { BadgeComponent } from '../badge-component/badge-component';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge';
}

export interface TableAction {
  key: string;
  label: string;
  class?: string;
  show?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
}

export interface TableActionEvent {
  action: string;
  row: any;
  index: number;
}

@Component({
  selector: 'app-table-custom',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    BadgeComponent
  ],
  templateUrl: './table-custom.html',
  styleUrl: './table-custom.css'
})
export class TableCustomComponent implements AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<any>;

  @Output() actionClick = new EventEmitter<TableActionEvent>();

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private actionsColumnKey = '__actions';

  @Input() set data(value: any[]) {
    this.dataSource.data = value ? [...value] : [];

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }

    if (this.table) {
      this.table.renderRows();
    }
  }

  onActionClick(action: TableAction, row: any, index: number): void {
    this.actionClick.emit({
      action: action.key,
      row,
      index
    });
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.show ? action.show(row) : true;
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }



  private _columns: TableColumn[] = [];
private _actions: TableAction[] = [];

@Input() set columns(value: TableColumn[]) {
  this._columns = value ?? [];
  this.updateDisplayedColumns();
}

get columns(): TableColumn[] {
  return this._columns;
}

@Input() set actions(value: TableAction[]) {
  this._actions = value ?? [];
  this.updateDisplayedColumns();
}

get actions(): TableAction[] {
  return this._actions;
}

displayedColumns: string[] = [];

private updateDisplayedColumns(): void {
  const cols = this._columns.map(column => column.key);

  this.displayedColumns = this._actions.length > 0
    ? [...cols, this.actionsColumnKey]
    : cols;
}


applyFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.dataSource.filter = value.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}

ngAfterViewInit(): void {
  this.paginator.pageSize = 10;
  this.dataSource.paginator = this.paginator;

  // Filtro que busca en todos los valores de la fila, no solo en un campo
  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const values = Object.values(data)
      .map(v => (v ?? '').toString().toLowerCase())
      .join(' ');
    return values.includes(filter);
  };
}


}
