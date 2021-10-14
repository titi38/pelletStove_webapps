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

  durationOptions = [ 'short', 'normal', 'long' ];
  selectedDurationOption = 'normal';


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
    this.pelletService.sendCommand("getLcdMsg").subscribe(
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


  pressButton(button: string){
    console.log("pressButton&"+button+"&dur="+this.selectedDurationOption);
    this.pelletService.sendCommand("pressButton&"+button+"&dur="+this.selectedDurationOption).subscribe(
      (response) =>{
        //this.info = response;
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }

  onUp() {
    this.pressButton("up");
  }

  onDown() {
    this.pressButton("down");
  }

  onOn() {
    this.pressButton("on");
  }

  onOff() {
    this.pressButton("off");
  }

  onUpDown() {
    this.pressButton("up&down");
  }

  onOnUp() {
    this.pressButton("up&on");
  }
}
