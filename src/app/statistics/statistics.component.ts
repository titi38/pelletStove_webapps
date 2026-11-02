import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PelletService } from '../services/pellets.service';

interface SeriesPoint { date: Date; temp: number | null; humidity: number | null; run: number | null; }

@Component({
  standalone: false,
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  updatedAt: Date | null = null;
  count = 0;
  averageTemp: number | null = null;
  averageHumidity: number | null = null;
  lastMode: number | null = null;
  // Puissance normalisée sur l'axe droit (0–100 %) pour combiner 3 unités
  // dans le même graphique Google Charts, qui ne possède que deux axes Y.
  combinedData: any[][] = [];
  private refreshSubscription: Subscription;

  readonly combinedOptions: any = {
    backgroundColor: 'transparent',
    colors: ['#d87636', '#3189b5', '#27815a'],
    legend: { position: 'top', textStyle: {fontSize: 12, color: '#536a60'} },
    series: {
      0: { targetAxisIndex: 0, lineWidth: 3, pointSize: 3 },
      1: { targetAxisIndex: 1, lineWidth: 3, pointSize: 3 },
      2: { targetAxisIndex: 1, lineWidth: 3, pointSize: 3, lineDashStyle: [6, 3] }
    },
    vAxes: {
      0: { title: 'Température (°C)', textStyle: {color: '#b96b37'}, gridlines: {color: '#edf1ee'} },
      1: { title: 'Humidité (%) / puissance (0–6)', viewWindow: {min: 0, max: 100},
           ticks: [{v:0,f:'0% · 0/6'}, {v:100/6,f:'17% · 1/6'}, {v:200/6,f:'33% · 2/6'}, {v:50,f:'50% · 3/6'}, {v:400/6,f:'67% · 4/6'}, {v:500/6,f:'83% · 5/6'}, {v:100,f:'100% · 6/6'}], textStyle: {color: '#3189b5'}, gridlines: {color: 'transparent'} }
    },
    hAxis: { format: 'HH:mm', textStyle: {color: '#74847d', fontSize: 11}, gridlines: {color: '#edf1ee'} },
    chartArea: {left: 65, top: 40, width: '70%', height: '70%'},
    tooltip: { isHtml: false },
    curveType: 'function',
    interpolateNulls: false
  };

  constructor(private pellets: PelletService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.refreshSubscription = timer(0, 60000).pipe(
      switchMap(() => this.pellets.refreshStats())
    ).subscribe(payload => {
      if (!payload || !Array.isArray(payload.stats) ||
          !Number.isInteger(payload.hour) || !Number.isInteger(payload.quarter) ||
          payload.hour < 0 || payload.hour > 23 || payload.quarter < 0 || payload.quarter > 3) {
        this.error = 'Format des statistiques invalide.';
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
      // Le backend ne stocke que les quarts d’heure TERMINÉS.
      // hour/quarter identifient le quart actuellement en cours.
      const now = new Date();
      const currentQuarter = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
        payload.hour, payload.quarter * 15, 0, 0);
      // En cas de minuit/DST, l'heure civile provient du serveur, mais
      // sans date ni timezone dans l'API on ne peut pas reconstruire parfaitement un changement d'heure.
      const rows: SeriesPoint[] = payload.stats.slice(-96).map((values, index, all) => {
        const age = all.length - index;
        const date = new Date(currentQuarter.getTime() - age * 15 * 60000);
        return {
          date,
          temp: this.measure(values, 0),
          humidity: this.measure(values, 1),
          run: this.measure(values, 2, true)
        };
      });
      this.combinedData = rows.map(p => [
        p.date,
        p.temp,
        p.humidity,
        p.run === null ? null : { v: p.run * 100 / 6, f: `${p.run.toFixed(2)} / 6` }
      ]);
      this.count = rows.length;
      this.averageTemp = this.mean(rows.map(p => p.temp));
      this.averageHumidity = this.mean(rows.map(p => p.humidity));
      const modes = rows.map(p => p.run).filter(v => v !== null);
      this.lastMode = modes.length ? modes[modes.length - 1] : null;
      this.updatedAt = new Date();
      this.loading = false;
      this.error = '';
      this.cdr.markForCheck();
    }, () => {
      this.error = 'Impossible de récupérer les statistiques. Vérifie l’adresse du backend.';
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) { this.refreshSubscription.unsubscribe(); }
  }

  private measure(values: number[], index: number, allowZero = false): number | null {
    if (!Array.isArray(values) || !Number.isFinite(values[index])) { return null; }
    // Le backend encode une période sans échantillon comme 0,0,0.
    if (!allowZero && values[0] === 0 && values[1] === 0) { return null; }
    if (allowZero && values[0] === 0 && values[1] === 0 && values[2] === 0) { return null; }
    return values[index];
  }

  private mean(values: Array<number | null>): number | null {
    const valid = values.filter(v => v !== null) as number[];
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  }

}
