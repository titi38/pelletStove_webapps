import {Component, OnDestroy, OnInit} from '@angular/core';
import { PelletService } from '../services/pellets.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})

export class MonitorComponent implements OnInit, OnDestroy {

  info: any;
/*  info = { 'indoorData' : {'temp': 17.3, 'humi' : 52.1, 'humidex' : 17.45360285163524},
    'pelletMonitor' : {'power' : 1, 'tempWater' : 48, 'tempWaterConsigne' : 69, 'operatingMode' : 'on', 'conso': 791.4893617021277 } ,
    'outdoorData' : {'temp' : 1.98, 'humi' : 80, 'wind_speed' : 4, 'wind_dir' : 0, 'icon' : 'http://openweathermap.org/img/w/10n.png'},
    'autoMode': {'mode': 'basic'} };
*/

//  constructor() { }
  constructor(private pelletService: PelletService) { }

  refreshInfoSubscription: any;

  ngOnInit() {
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
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }

onModeCustom() {
  this.pelletService.sendCommand("auto&mode=custom").subscribe(
    (response) =>{
      //this.info = response;
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
      console.log(response);
    },
    (error) => {
      console.log('Erreur !: '+ error);
    }
  );
  }
}

