import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { PelletService } from '../services/pellets.service';
import { interval } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-oldstyle',
  templateUrl: './oldstyle.component.html',
  styleUrls: ['./oldstyle.component.scss']
})
export class OldstyleComponent implements OnInit, OnDestroy {
  // PANEL_ORIGIN_LOCK_V54 : état inconnu => boutons désactivés (fail-closed).
  private autoModeState: string | null = null;
  get panelCommandsAllowed(): boolean { return this.autoModeState === 'off'; }
  get panelLockMessage(): string {
    return this.autoModeState === null
      ? 'Vérification du mode de régulation…'
      : 'Passez en mode Manuel depuis le Tableau de bord pour utiliser les touches.';
  }
  private refreshPanelMode(): void {
    this.pelletService.refreshInfo().subscribe({
      next: info => { this.autoModeState = info?.autoMode?.mode ?? null; this.cdr.markForCheck(); },
      error: () => { this.autoModeState = null; this.cdr.markForCheck(); }
    });
  }


  constructor(private pelletService: PelletService, private cdr: ChangeDetectorRef) { }
  lcdMessage: string;
  refreshLcdMsgSubscription: any;

  durationOptions = [ 'short', 'normal', 'long' ];
  selectedDurationOption = 'normal';


  ngOnInit() {
    this.refreshPanelMode();
    const counter = interval( 2000 );
    this.refreshLcdMsgSubscription = counter.subscribe(
      (value) => {
        this.onRefreshLcdMsg();
        this.refreshPanelMode();
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
        this.cdr.markForCheck();
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: '+ error);
      }
    );
  }


  pressButton(button: string){
    if (!this.panelCommandsAllowed) { return; }
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
