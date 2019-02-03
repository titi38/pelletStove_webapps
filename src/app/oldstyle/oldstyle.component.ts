import {Component, OnDestroy, OnInit} from '@angular/core';
import { PelletService } from '../services/pellets.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-oldstyle',
  templateUrl: './oldstyle.component.html',
  styleUrls: ['./oldstyle.component.scss']
})
export class OldstyleComponent implements OnInit, OnDestroy {

  constructor(private pelletService: PelletService) { }
  lcdMessage: string;
  refreshLcdMsgSubscription: any;

  ngOnInit() {
    const counter = interval( 2000 );
    this.refreshLcdMsgSubscription = counter.subscribe(
      (value) => {
        this.onRefreshLcdMsg();
      },
      (error) => { // ERREUR
        console.log ( 'Erreur: ' + error );
      },
      () => { }
    );
  }

  ngOnDestroy() {
    this.refreshLcdMsgSubscription.unsubscribe();
  }

  onRefreshLcdMsg() {
    this.pelletService.getLcdMsg().subscribe(
      (response) =>{
        let aa: any ;
        aa = response;
        this.lcdMessage = aa.result;
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  chooseDur(val) {
    console.log(val);
  }

  durStrParam(){

  }

  onUp() {
    this.pelletService.sendCommand("pressButton&up"+this.durStrParam()).subscribe(
      (response) =>{
        //this.info = response;
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onDown() {
  }

  onOn() {
  }

  onOff() {

  }

  onUpDown() {
  }

  onOnUp() {

  }
}
