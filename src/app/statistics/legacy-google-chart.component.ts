import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';

declare global { interface Window { google?: any; } }

@Component({
  selector: 'google-chart',
  standalone: false,
  template: '<div #chartHost class="chart-host" style="height:100%;width:100%"></div>'
})
export class LegacyGoogleChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type = 'LineChart';
  @Input() data: any[][] = [];
  @Input() columnNames: string[] = [];
  @Input() options: any = {};
  @Input() dynamicResize = true;
  @ViewChild('chartHost', {static: true}) host!: ElementRef<HTMLElement>;
  private ready = false;
  private observer?: ResizeObserver;
  private disposed = false;

  ngAfterViewInit(): void {
    this.ready = true;
    if (this.dynamicResize && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.draw());
      this.observer.observe(this.host.nativeElement);
    }
    this.load();
  }
  ngOnChanges(): void { if (this.ready) this.load(); }
  ngOnDestroy(): void { this.disposed = true; this.observer?.disconnect(); }

  private load(): void {
    if (window.google?.visualization?.DataTable) { this.draw(); return; }
    if (window.google?.charts) {
      window.google.charts.load('current', {packages: ['corechart'], language: 'fr'});
      window.google.charts.setOnLoadCallback(() => this.draw());
      return;
    }
    if (!document.querySelector('script[data-google-chart-loader]')) {
      const script = document.createElement('script');
      script.dataset['googleChartLoader'] = '1';
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = () => this.load();
      document.head.appendChild(script);
    } else {
      setTimeout(() => this.load(), 200);
    }
  }
  private draw(): void {
    if (this.disposed || !this.ready || !window.google?.visualization?.DataTable || !this.host?.nativeElement || !this.columnNames?.length) return;
    const google = window.google;
    const table = new google.visualization.DataTable();
    table.addColumn('datetime', this.columnNames[0]);
    for (const name of this.columnNames.slice(1)) table.addColumn('number', name);
    for (const row of this.data || []) {
      if (!Array.isArray(row) || !(row[0] instanceof Date)) continue;
      table.addRow(row);
    }
    const chart = new google.visualization[this.type === 'ColumnChart' ? 'ColumnChart' : 'LineChart'](this.host.nativeElement);
    chart.draw(table, this.options);
  }
}
