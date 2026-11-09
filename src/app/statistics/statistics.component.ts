import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, of, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PelletService, PresenceSchedule } from '../services/pellets.service';

type Measurement = number | null;
interface Slot {
  date: Date;
  indoorTemp: Measurement;
  indoorHumidity: Measurement;
  outdoorTemp: Measurement;
  outdoorHumidity: Measurement;
  consumption: Measurement; // mass (kg) measured during each 15-minute slot
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
  private schedule: PresenceSchedule | null = null;
  // Indicative schedule line: historical mode changes are not recorded by stats.json.
  scheduledSetpointPaths: string[] = [];

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
    vAxis: { title: 'kg / 15 min', viewWindow: { min: 0 }, textStyle: { color: '#43865d', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
    hAxis: { format: 'HH:mm', textStyle: { color: '#718078', fontSize: 10 }, gridlines: { color: '#edf1ee' } },
    chartArea: { left: this.leftMargin, width: this.plotWidth, top: 8, height: '80%' },
    bar: { groupWidth: '88%' },
    interpolateNulls: false
  };

  // PELLET_V56_OVERLAY - diagramme SVG, trois echelles independantes.
  readonly svgW = 1240;
  readonly svgH = 430;
  readonly plotLeft = 68;
  readonly plotRight = 1082;
  readonly plotTop = 22;
  readonly plotBottom = 365;
  overlayBars: {x: number; y: number; w: number; h: number; tooltip: string}[] = [];
  overlayLines: {key: string; label: string; color: string; dash: string; paths: string[]}[] = [];
  overlayTimes: {x: number; label: string}[] = [];
  overlayTemps: {y: number; label: string}[] = [];
  overlayHumidity: {y: number; label: string}[] = [];
  overlayConsumption: {y: number; label: string}[] = [];

  private redrawOverlay(): void {
    const atmos = this.atmosphereData as Array<[Date, number|null, number|null, number|null, number|null]>;
    const cons = this.consumptionData as Array<[Date, number|null]>;
    const plotW = this.plotRight - this.plotLeft;
    const plotH = this.plotBottom - this.plotTop;
    // Uses the already computed common 24h domain of the old charts.
    const axis = this.atmosphereOptions.hAxis?.viewWindow;
    const end = axis?.max instanceof Date ? axis.max.getTime() : Date.now();
    const start = axis?.min instanceof Date ? axis.min.getTime() : end - 24*3600000;
    const x = (t: number) => this.plotLeft + (t - start) / Math.max(1, end-start) * plotW;
    const finite = (v: number|null|undefined): v is number => typeof v === 'number' && Number.isFinite(v);
    const scheduleComfort = this.schedule && Number.isFinite(this.schedule.comfort)
      ? this.schedule.comfort : null;
    const tempValues = atmos.flatMap(r => [r[1],r[3]]).filter(finite);
    if (scheduleComfort !== null) tempValues.push(scheduleComfort);
    let tMin = tempValues.length ? Math.floor((Math.min(...tempValues)-1)/5)*5 : 0;
    let tMax = tempValues.length ? Math.ceil((Math.max(...tempValues)+1)/5)*5 : 30;
    if (tMax <= tMin) tMax = tMin + 5;
    const massValues = cons.map(r=>r[1]).filter(finite).filter(v=>v>=0);
    const highest = massValues.length ? Math.max(...massValues) : 0;
    // Clean kg/15min axis without using the humidity or temperature scales.
    const massMax = Math.max(0.1, Math.ceil(highest / 0.1) * 0.1);
    const yTemp=(v:number)=>this.plotBottom-(v-tMin)/(tMax-tMin)*plotH;
    const yHumidity=(v:number)=>this.plotBottom-v/100*plotH;
    const yMass=(v:number)=>this.plotBottom-Math.max(0,v)/massMax*plotH;
    const fmt=(n:number)=>n.toFixed(1);
    this.overlayTemps = Array.from({length:5},(_,i)=>({
      y: this.plotBottom-i*plotH/4, label:fmt(tMin+(tMax-tMin)*i/4)
    }));
    this.overlayHumidity = Array.from({length:5},(_,i)=>({
      y:this.plotBottom-i*plotH/4,label:String(i*25)
    }));
    this.overlayConsumption = Array.from({length:5},(_,i)=>({
      y:this.plotBottom-i*plotH/4,label:(massMax*i/4).toFixed(2)
    }));
    const timeTicks=[] as {x:number;label:string}[];
    const stepMs=4*3600000;
    for(let t=Math.ceil(start/stepMs)*stepMs;t<=end;t+=stepMs){
      const d=new Date(t);
      timeTicks.push({x:x(t),label:String(d.getHours()).padStart(2,'0')+':00'});
    }
    this.overlayTimes=timeTicks;
    // Draw the current weekly programmed setpoint only while a scheduled period is active.
    // These are reference periods, NOT historical proof of actual Automatic mode operation.
    this.scheduledSetpointPaths = [];
    if (this.schedule && scheduleComfort !== null &&
        Array.isArray(this.schedule.days) && this.schedule.days.length === 7) {
      const minute = (value: unknown): number | null => {
        if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return null;
        const [h,m] = value.split(':').map(Number);
        return h >= 0 && h <= 23 && m >= 0 && m <= 59 ? h*60+m : null;
      };
      const first = new Date(start);
      first.setHours(0,0,0,0);
      first.setDate(first.getDate()-1); // A period may span midnight.
      const last = new Date(end);
      last.setHours(0,0,0,0);
      const segments: {from:number;to:number}[] = [];
      for (let date = new Date(first); date.getTime() <= last.getTime(); date.setDate(date.getDate()+1)) {
        const weekday = (date.getDay()+6)%7;
        const periods = this.schedule.days[weekday];
        if (!Array.isArray(periods)) continue;
        for (const period of periods) {
          const begin = minute(period.start), finish = minute(period.end);
          if (begin === null || finish === null || begin === finish) continue;
          const from = date.getTime()+begin*60000;
          const to = date.getTime()+(finish <= begin ? finish+1440 : finish)*60000;
          const clippedFrom = Math.max(start,from), clippedTo = Math.min(end,to);
          if (clippedTo > clippedFrom) segments.push({from:clippedFrom,to:clippedTo});
        }
      }
      segments.sort((a,b)=>a.from-b.from);
      // Merge adjacent and overlapping periods: no artificial gaps between them.
      const merged: {from:number;to:number}[] = [];
      for (const segment of segments) {
        const prev = merged[merged.length-1];
        if (prev && segment.from <= prev.to) prev.to = Math.max(prev.to,segment.to);
        else merged.push({...segment});
      }
      const y = yTemp(scheduleComfort).toFixed(2);
      this.scheduledSetpointPaths = merged.map(s=>
        `M${x(s.from).toFixed(2)},${y} L${x(s.to).toFixed(2)},${y}`);
    }
    const width=Math.min(9,plotW/96*0.82);
    this.overlayBars=cons.filter(r=>finite(r[1])&&r[1]>=0).map(r=>{
      const cx=x(r[0].getTime()+450000);
      const top=Math.max(this.plotTop, yMass(r[1] as number));
      const d=r[0];
      return {x:cx-width/2,y:top,w:width,h:this.plotBottom-top,
        tooltip:d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' · '+
          (r[1] as number).toFixed(3)+' kg sur le quart d’heure'};
    });
    const series:[string,string,number,(v:number)=>number,string][]=[
      ['Temp. intérieure','#e97822',1,yTemp,''],
      ['Temp. extérieure','#e97822',3,yTemp,'7 5'],
      ['Humidité intérieure','#1875cf',2,yHumidity,''],
      ['Humidité extérieure','#1875cf',4,yHumidity,'7 5']
    ];
    this.overlayLines=series.map(([label,color,col,project,dash])=>{
      let segment:string[]=[];
      const paths:string[]=[];
      const flush=()=>{if(segment.length>0){paths.push(segment.join(' '));segment=[];}};
      atmos.forEach(r=>{
        const v=r[col] as number|null;
        if(!finite(v)){flush();return;}
        const point=x(r[0].getTime()+450000).toFixed(2)+','+project(v).toFixed(2);
        segment.push((segment.length?'L':'M')+point);
      });
      flush();
      return {key:label,label,color,dash,paths};
    });
  }


  constructor(private pellets: PelletService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription = timer(0, 60000).pipe(switchMap(() => forkJoin({
      payload: this.pellets.refreshStats(),
      schedule: this.pellets.refreshSchedule().pipe(catchError(() => of(null)))
    }))).subscribe({
      next: ({payload, schedule}) => {
        this.schedule = schedule;
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
            consumption: this.value(values, 5)
          };
        });
        this.atmosphereData = rows.map(p => [p.date, p.indoorTemp, p.indoorHumidity, p.outdoorTemp, p.outdoorHumidity]);
        this.consumptionData = rows.map(p => [p.date, p.consumption]);
        // Include the current partial quarter, when backend exposes it.
        // The unfinished slot contains the mass accumulated so far (kg).
        const partialMass = this.value(current, 'consumptionKg');
        const partialSeconds = this.value(current, 'observedSeconds');
        const validPartial = partialMass !== null && partialSeconds !== null && partialSeconds > 0;
        if (validPartial) {
          this.consumptionData.push([currentQuarter, partialMass]);
        }
        this.redrawOverlay();
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
  private mean(values: Measurement[]): Measurement {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length ? valid.reduce((sum, v) => sum + v, 0) / valid.length : null;
  }
}
