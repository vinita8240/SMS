import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'currency' | 'date' | 'custom';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() keyField: string = 'id';
  @Input() selectable: boolean = false;
  @Input() hasActions: boolean = true;
  @Input() pagination: { page: number; limit: number; total: number; totalPages: number } | null = null;

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<any[]>();

  @ContentChild('actions', { static: false }) actionsTmpl?: TemplateRef<any>;
  @ContentChild('customCell', { static: false }) customCellTmpl?: TemplateRef<any>;

  searchQuery: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRows: any[] = [];
  selectAll: boolean = false;
  Math = Math;

  onSearchChange(val: string) {
    this.search.emit(val);
  }

  sort(columnKey: string) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.data.sort((a, b) => {
      const valA = a[columnKey];
      const valB = b[columnKey];
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  toggleSelectRow(row: any) {
    const idx = this.selectedRows.findIndex(r => r === row || (row[this.keyField] && r[this.keyField] === row[this.keyField]));
    if (idx > -1) {
      this.selectedRows.splice(idx, 1);
    } else {
      this.selectedRows.push(row);
    }
    this.selectAll = this.selectedRows.length === this.data.length && this.data.length > 0;
    this.selectionChange.emit(this.selectedRows);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.some(r => r === row || (row[this.keyField] && r[this.keyField] === row[this.keyField]));
  }

  exportCSV() {
    if (!this.data.length) return;
    const headers = this.columns.map(c => c.label).join(',');
    const rows = this.data.map(row => {
      return this.columns.map(c => `"${(row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : '').toString().replace(/"/g, '""')}"`).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sms-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printTable() {
    window.print();
  }
}
