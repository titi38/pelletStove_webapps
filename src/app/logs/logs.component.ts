import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

interface LogRow { date: string; level: string; message: string; details: string; }

@Component({
  selector: 'app-logs', standalone: false,
  templateUrl: './logs.component.html', styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {
  rows: LogRow[] = [];
  filter = '';
  level = '';
  page = 0;
  pageSize = 15;
  sortField: keyof LogRow = 'date';
  descending = true;
  expanded: number | null = null;
  error = '';
  private timer?: Subscription;
  private request?: Subscription;
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.refresh(); this.timer = interval(10000).subscribe(() => this.refresh()); }
  ngOnDestroy() { this.timer?.unsubscribe(); this.request?.unsubscribe(); }
  refresh() {
    if (this.request && !this.request.closed) return;
    this.request = this.http.get<{ logs: LogRow[] }>('/dynamic/logs.json',
      { params: { _: String(Date.now()) } }).subscribe({
      next: data => {
        this.rows = Array.isArray(data.logs) ? data.logs : [];
        this.error = '';
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Impossible de récupérer les logs du poêle.'; this.cdr.markForCheck(); }
    });
  }
  setSort(field: keyof LogRow) {
    this.descending = this.sortField === field ? !this.descending : field === 'date';
    this.sortField = field;
    this.page = 0;
  }
  get filtered(): LogRow[] {
    const query = this.filter.toLocaleLowerCase();
    const filtered = this.rows.filter(r =>
      (!this.level || r.level === this.level) &&
      (!query || [r.date, r.level, r.message, r.details].some(s => String(s ?? '').toLocaleLowerCase().includes(query))));
    return filtered.sort((a,b) => String(a[this.sortField] ?? '').localeCompare(String(b[this.sortField] ?? '')) * (this.descending ? -1 : 1));
  }
  get pages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get visible() { return this.filtered.slice(this.page*this.pageSize, (this.page+1)*this.pageSize); }
  applyFilter() { this.page = 0; }
  exportCsv() {
    const lines = [['Date','Niveau','Message','Détails'], ...this.filtered.map(r => [r.date,r.level,r.message,r.details])];
    const csv = '\ufeff' + lines.map(values => values.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8'});
    const href = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = href; anchor.download = 'pelletcontrol-logs.csv'; anchor.click(); URL.revokeObjectURL(href);
  }
}
