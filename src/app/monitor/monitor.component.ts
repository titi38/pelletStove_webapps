import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { PelletService, PresenceSchedule } from '../services/pellets.service';
import { interval } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})

export class MonitorComponent implements OnInit, OnDestroy {

  info: any;
  schedule: PresenceSchedule | null = null;
  scheduleBusy = false;
  scheduleError = '';
  private lastScheduleRefresh = 0;
  onPresenceOverride(value: 'arrive' | 'leave') {
    this.scheduleBusy = true;
    this.scheduleError = '';
    this.pelletService.setPresenceOverride(value).subscribe({
      next: response => {this.scheduleBusy = false; if (!response.success) this.scheduleError = response.error || 'Refusé'; this.loadSchedule(); this.onRefreshInfo(); this.cdr.markForCheck();},
      error: () => {this.scheduleBusy = false; this.scheduleError = 'Commande de dérogation indisponible'; this.cdr.markForCheck();}
    });
  }
  loadSchedule() {
    this.pelletService.refreshSchedule().subscribe({
      next: s => {this.schedule = s; this.cdr.markForCheck();},
      error: () => {this.schedule = null; this.cdr.markForCheck();}
    });
  }

  get canLeave(): boolean {
    return !!this.schedule && this.schedule.autoEnabled === true && (this.schedule.presence || this.schedule.override === 'arrive') &&
      this.schedule.override !== 'leave' && !this.schedule.alarmLatched;
  }
  get canArrive(): boolean {
    return !!this.schedule && this.schedule.autoEnabled === true && (!this.schedule.presence || this.schedule.override === 'leave') &&
      this.schedule.override !== 'arrive' && !this.schedule.alarmLatched;
  }
  overrideDeadline(): string {
    const ts = this.schedule?.overrideUntil;
    return ts ? new Date(ts * 1000).toLocaleString('fr-FR', {weekday:'short', hour:'2-digit', minute:'2-digit'}) : '';
  }

  modes = [
    {key: 'off', label: 'Manuel', description: 'Contrôle direct', icon: '✋'},
    {key: 'basic', label: 'Automatique', description: 'Régulation', icon: '◉'},
    {key: 'vacation', label: 'Présence', description: 'À la maison', icon: '⌂'},
    {key: 'absent', label: 'Absence', description: 'Économie', icon: '◇'}
  ];

  modeName(key: string): string {
    const item = this.modes.find(m => m.key === key);
    return item ? item.label : 'Inconnu';
  }

  selectMode(key: string): void {
    if (key === 'off') { this.onModeOff(); }
    else if (key === 'basic') { this.onModeNormal(); }
    else if (key === 'vacation') { this.onModeVacation(); }
    else if (key === 'absent') { this.onModeAbsent(); }
  }

/*  info = { 'indoorData' : {'temp': 17.3, 'humi' : 52.1, 'humidex' : 17.45360285163524},
    'pelletMonitor' : {'power' : 1, 'tempWater' : 48, 'tempWaterConsigne' : 69, 'operatingMode' : 'on', 'conso': 791.4893617021277 } ,
    'outdoorData' : {'temp' : 1.98, 'humi' : 80, 'wind_speed' : 4, 'wind_dir' : 0, 'icon' : 'http://openweathermap.org/img/w/10n.png'},
    'autoMode': {'mode': 'basic'} };
*/

//  constructor() { }
  constructor(private pelletService: PelletService, private cdr: ChangeDetectorRef) { }

  refreshInfoSubscription: any;

  ngOnInit() {
    this.onRefreshInfo();
    this.loadSchedule();
    const counter = interval( 2000 );
    this.refreshInfoSubscription = counter.subscribe(
      (value) => {
        this.onRefreshInfo();
      },
      (error) => { // ERREUR
        console.log ( 'Erreur: ' + error );
      },
      () => { }
    );
  }

  ngOnDestroy() {
    this.refreshInfoSubscription.unsubscribe();
  }

  onRefreshInfo() {
    this.pelletService.refreshInfo().subscribe(
      (response) =>{
        this.info = response;
        if (Date.now() - this.lastScheduleRefresh > 15000) {
          this.lastScheduleRefresh = Date.now();
          this.loadSchedule();
        }
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onIncPower() {
    this.pelletService.sendCommand("incPower").subscribe(
      (response) =>{
        //this.info = response;
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onDecPower() {
    this.pelletService.sendCommand("decPower").subscribe(
      (response) =>{
        //this.info = response;
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onStart() {
    this.pelletService.sendCommand("start").subscribe(
      (response) =>{
        //this.info = response;
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onStop() {
    this.pelletService.sendCommand("stop").subscribe(
      (response) =>{
        //this.info = response;
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onClean() {
    this.pelletService.sendCommand("clean").subscribe(
      (response) =>{
        //this.info = response;
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

onModeOff() {
  this.pelletService.sendCommand("auto&mode=off").subscribe(
    (response) =>{
      //this.info = response;
        this.cdr.markForCheck();
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }

onModeNormal() {
  this.pelletService.sendCommand("auto&mode=on").subscribe(
    (response) =>{
      //this.info = response;
        this.cdr.markForCheck();
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }

onModeVacation() {
  this.pelletService.sendCommand("auto&mode=vac").subscribe(
    (response) =>{
      //this.info = response;
        this.cdr.markForCheck();
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }

onModeAbsent() {
  this.pelletService.sendCommand("auto&mode=abs").subscribe(
    (response) =>{
      //this.info = response;
        this.cdr.markForCheck();
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }

onResetAlert() {
  this.pelletService.sendCommand("resetAlert").subscribe(
    (response) =>{
      //this.info = response;
        this.cdr.markForCheck();
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }
}

