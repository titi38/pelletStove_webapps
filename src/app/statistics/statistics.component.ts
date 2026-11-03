import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PelletService } from '../services/pellets.service';

type Measurement = number | null;
interface Slot {
  date: Date;
  indoorTemp: Measurement;
  indoorHumidity: Measurement;
  outdoorTemp: Measurement;
  outdoorHumidity: Measurement;
  consumption: Measurement; // hourly equivalent (kg/h) computed from 15min mass
}

@Component({
  selector: 'app-statistics', standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  updatedAt: Date | null = null;
  count = 0;
  avgIndoorTemp: Measurement = null;
  avgIndoorHumidity: Measurement = null;
  avgOutdoorTemp: Measurement = null;
  avgOutdoorHumidity: Measurement = null;
  avgConsumption: Measurement = null;
  avgDailyConsumption: Measurement = null;
  dailyConsumptionIsEstimate = false;
  atmosphereData: any[][] = [];
  consumptionData: any[][] = [];
  private subscription?: Subscription;

  // Both charts MUST use the same chartArea and fixed 24-hour domain.
  // Google Charts does not support chartArea.right or chartArea.bottom.
  private readonly plotWidth = '74%';
  // Same horizontal margins and time ticks on both charts.
  private readonly leftMargin = 68;
  private readonly rightMargin = 74;
  readonly atmosphereOptions: any = {
    backgroundColor: 'transparent',
    colors: ['#e97822', '#1875cf', '#e97822', '#1875cf'],
    legend: { position: 'top', textStyle: { fontSize: 11, color: '#405d56' } },
    series: {
      0: { targetAxisIndex: 0, lineWidth: 3, pointSize: 0 },
      1: { targetAxisIndex: 1, lineWidth: 2, pointSize: 0 },
      2: { targetAxisIndex: 0, lineWidth: 2, lineDashStyle: [6, 4], pointSize: 0 },
      3: { targetAxisIndex: 1, lineWidth: 2, lineDashStyle: [6, 4], pointSize: 0 }
    },
    vAxes: {
      0: { title: 'Température (°C)', textStyle: { color: '#b96326', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
      1: { title: 'Humidité (%)', viewWindow: { min: 0, max: 100 }, textStyle: { color: '#1875cf', fontSize: 10 }, gridlines: { color: 'transparent' } }
    },
    hAxis: { format: 'HH:mm', textStyle: { color: '#718078', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
    chartArea: { left: this.leftMargin, width: this.plotWidth, top: 42, height: '70%' },
    interpolateNulls: false,
    explorer: { axis: 'horizontal', keepInBounds: true }
  };
  readonly consumptionOptions: any = {
    backgroundColor: 'transparent',
    colors: ['#64b97c'],
    legend: 'none',
    vAxis: { title: 'kg/h', viewWindow: { min: 0 }, textStyle: { color: '#43865d', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
    hAxis: { format: 'HH:mm', textStyle: { color: '#718078', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
    chartArea: { left: this.leftMargin, width: this.plotWidth, top: 8, height: '80%' },
    bar: { groupWidth: '88%' },
    interpolateNulls: false
  };

  constructor(private pellets: PelletService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription = timer(0, 60000).pipe(switchMap(() => this.pellets.refreshStats())).subscribe({
      next: payload => {
        if (!payload || !Array.isArray(payload.stats) ||
          !Number.isInteger(payload.hour) || payload.hour < 0 || payload.hour > 23 ||
          !Number.isInteger(payload.quarter) || payload.quarter < 0 || payload.quarter > 3) {
          this.error = 'Format des statistiques invalide.';
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }
        const now = new Date();
        const currentQuarter = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
          payload.hour, payload.quarter * 15, 0, 0);
        // Leave room for the partial quarter on a 24-hour domain.
        const current = (payload as any).current;
        const hasPartial = current && typeof current.consumptionKg === 'number';
        const source = payload.stats.slice(hasPartial ? -95 : -96);
        const axisEnd = new Date(currentQuarter.getTime() + (hasPartial ? 900000 : 0));
        const axisStart = new Date(axisEnd.getTime() - 96 * 900000);
        const ticks: Date[] = [];
        // One common time scale and common grid positions for both graphs.
        const tickStep = window.innerWidth < 700 ? 4 * 3600000 : 2 * 3600000;
        const startMs = Math.ceil(axisStart.getTime() / tickStep) * tickStep;
        for (let t = startMs; t <= axisEnd.getTime(); t += tickStep) ticks.push(new Date(t));
        for (const opts of [this.atmosphereOptions, this.consumptionOptions]) {
          opts.hAxis = { ...opts.hAxis, ticks, viewWindow: { min: axisStart, max: axisEnd } };
        }
        const rows: Slot[] = source.map((values, index) => {
          const date = new Date(currentQuarter.getTime() - (source.length - index) * 900000);
          const missingIndoor = !Array.isArray(values) || (values[0] === 0 && values[1] === 0);
          return {
            date,
            indoorTemp: missingIndoor ? null : this.value(values, 0),
            indoorHumidity: missingIndoor ? null : this.value(values, 1),
            outdoorTemp: this.value(values, 3),
            outdoorHumidity: this.value(values, 4),
            consumption: this.massToRate(this.value(values, 5), 900)
          };
        });
        this.atmosphereData = rows.map(p => [p.date, p.indoorTemp, p.indoorHumidity, p.outdoorTemp, p.outdoorHumidity]);
        this.consumptionData = rows.map(p => [p.date, p.consumption]);
        // Include the current partial quarter, when backend exposes it.
        // kg/h is normalized over *observed seconds*, never over 15 minutes.
        const partialMass = this.value(current, 'consumptionKg');
        const partialSeconds = this.value(current, 'observedSeconds');
        const validPartial = partialMass !== null && partialSeconds !== null && partialSeconds > 0;
        if (validPartial) {
          this.consumptionData.push([currentQuarter, this.massToRate(partialMass, partialSeconds ?? 0)]);
        }
        this.count = rows.length;
        this.avgIndoorTemp = this.mean(rows.map(p => p.indoorTemp));
        this.avgIndoorHumidity = this.mean(rows.map(p => p.indoorHumidity));
        this.avgOutdoorTemp = this.mean(rows.map(p => p.outdoorTemp));
        this.avgOutdoorHumidity = this.mean(rows.map(p => p.outdoorHumidity));
        const validMasses = source.map(v => this.value(v, 5)).filter((v): v is number => v !== null);
        const totalMass = validMasses.reduce((sum, value) => sum + value, 0)
          + (validPartial ? (partialMass ?? 0) : 0);
        const observedHours = validMasses.length * 0.25 + (validPartial ? (partialSeconds ?? 0) / 3600 : 0);
        this.avgConsumption = observedHours > 0 ? totalMass / observedHours : null;
        this.avgDailyConsumption = observedHours > 0 ? totalMass * 24 / observedHours : null;
        this.dailyConsumptionIsEstimate = observedHours < 23.99;
        this.updatedAt = new Date();
        this.error = '';
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Impossible de récupérer les statistiques.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  ngOnDestroy(): void { this.subscription?.unsubscribe(); }
  private value(values: any, key: number | string): Measurement {
    const value = values == null ? undefined : values[key];
    return typeof value === 'number' && Number.isFinite(value)
      ? value : null;
  }
  private massToRate(massKg: Measurement, seconds: number): Measurement {
    return massKg === null || seconds <= 0 ? null : massKg * 3600 / seconds;
  }
  private mean(values: Measurement[]): Measurement {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length ? valid.reduce((sum, v) => sum + v, 0) / valid.length : null;
  }
}
