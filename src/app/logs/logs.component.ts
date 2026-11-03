import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

interface LogRow { date: string; level: string; message: string; details: string; }
type Threshold = 'WARN' | 'INFO' | 'ALL';

@Component({
  selector: 'app-logs', standalone: false,
  templateUrl: './logs.component.html', styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {
  rows: LogRow[] = [];
  filter = '';
  level: Threshold = 'INFO';
  sortField: keyof LogRow = 'date';
  descending = true;
  expanded: string | null = null;
  error = '';
  private timer?: Subscription;
  private request?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.refresh();
    this.timer = interval(2000).subscribe(() => this.refresh());
  }
  ngOnDestroy() {
    this.timer?.unsubscribe();
    this.request?.unsubscribe();
  }
  refresh() {
    // Ne pas empiler les requêtes si le réseau est lent.
    if (this.request && !this.request.closed) return;
    this.request = this.http.get<{ logs: LogRow[] }>('/dynamic/logs.json',
      { params: { _: String(Date.now()) } }).subscribe({
      next: data => {
        this.rows = Array.isArray(data.logs) ? data.logs : [];
        this.error = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Impossible de récupérer le journal du poêle.';
        this.cdr.markForCheck();
      }
    });
  }
  private rank(level: string): number {
    switch ((level || '').toUpperCase()) {
      case 'DEBUG': return 0;
      case 'INFO': return 1;
      case 'WARNING': case 'WARN': return 2;
      case 'ALERT': return 3;
      case 'ERROR': return 4;
      case 'FATAL': return 5;
      default: return 1; // inconnu : visible dans INFO+ et Tous
    }
  }
  private allowed(row: LogRow): boolean {
    if (this.level === 'ALL') return true;
    return this.rank(row.level) >= (this.level === 'WARN' ? 2 : 1);
  }
  setSort(field: keyof LogRow) {
    this.descending = this.sortField === field ? !this.descending : field === 'date';
    this.sortField = field;
  }
  rowKey(row: LogRow): string {
    return [row.date, row.level, row.message, row.details].join('\u0001');
  }
  get filtered(): LogRow[] {
    const query = this.filter.trim().toLocaleLowerCase();
    return this.rows.filter(row =>
      this.allowed(row) &&
      (!query || [row.date, row.level, row.message, row.details].some(v =>
        String(v ?? '').toLocaleLowerCase().includes(query))))
      .sort((a, b) => String(a[this.sortField] ?? '')
        .localeCompare(String(b[this.sortField] ?? '')) * (this.descending ? -1 : 1));
  }
  exportCsv() {
    const lines = [['Date','Niveau','Message','Détails'],
      ...this.filtered.map(r => [r.date, r.level, r.message, r.details])];
    const csv = '\ufeff' + lines.map(values =>
      values.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = 'pelletcontrol-journal.csv';
    anchor.click();
    URL.revokeObjectURL(href);
  }
}
