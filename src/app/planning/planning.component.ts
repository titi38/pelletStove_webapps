import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PelletService, PresencePeriod, PresenceSchedule } from '../services/pellets.service';

@Component({selector: 'app-planning', standalone: false, templateUrl: './planning.component.html', styleUrls: ['./planning.component.scss']})
export class PlanningComponent implements OnInit, OnDestroy {
  readonly weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  selectedDay = 0;
  selectedMode: 'auto' | 'presence' | 'absence' = 'auto';
  schedule: PresenceSchedule | null = null;
  edited: PresenceSchedule | null = null;
  editing = -1;
  start = '08:00';
  end = '18:00';
  copyTargets: boolean[] = Array(7).fill(false);
  showCopy = false;
  loading = true;
  saving = false;
  dirty = false;
  private saveTimer?: ReturnType<typeof setTimeout>;
  private revision = 0;
  private persistedRevision = 0;
  message = '';
  error = '';
  constructor(private api: PelletService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }
  ngOnDestroy() { this.cancelSaveTimer(); }
  private cancelSaveTimer() {
    if (this.saveTimer !== undefined) clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
  }
  private changed() {
    this.revision++;
    this.dirty = true;
    this.error = '';
    this.message = '';
    this.cancelSaveTimer();
    this.saveTimer = setTimeout(() => { this.saveTimer = undefined; this.flushSave(); }, 650);
    this.cdr.markForCheck();
  }


  /** Réglage tactile par pas de 0,5 °C ; même sauvegarde que la saisie directe. */
/** Réglage tactile par pas de 0,5 °C. */
adjustComfortStep(direction: -1 | 1): void {
    if (!this.edited) return;

    const current = Number(this.edited.comfort);
    if (!Number.isFinite(current)) return;

    const next = Math.max(
      10,
      Math.min(25, Math.round(current * 2 + direction) / 2)
    );

    if (next === current) return;

    this.edited.comfort = next;
    this.onComfortChange();
  }
  onComfortChange() { this.changed(); }
  onSettingsChange() { this.changed(); }
  private adjust(value: number, direction: -1 | 1, low: number, high: number): number {
    return Math.max(low, Math.min(high, Math.round(value * 2 + direction) / 2));
  }
  changeSetting(field: 'anticipationBelow' | 'autoFrostStart' | 'autoFrostStop' |
      'presenceComfort' | 'absenceFrostStart' | 'absenceFrostStop', direction: -1 | 1): void {
    if (!this.edited) return;
    const c = this.edited;
    const a = c.automaticFrost, f = c.absenceFrost;
    switch(field) {
      case 'anticipationBelow': c.anticipation.below = this.adjust(c.anticipation.below,direction,10,25); break;
      case 'autoFrostStart': a.startBelow = this.adjust(a.startBelow,direction,5,a.stopAt-0.5); break;
      case 'autoFrostStop': a.stopAt = this.adjust(a.stopAt,direction,a.startBelow+0.5,25); break;
      case 'presenceComfort': c.presenceMode.comfort = this.adjust(c.presenceMode.comfort,direction,10,25); break;
      case 'absenceFrostStart': f.startBelow = this.adjust(f.startBelow,direction,5,f.stopAt-0.5); break;
      case 'absenceFrostStop': f.stopAt = this.adjust(f.stopAt,direction,f.startBelow+0.5,25); break;
    }
    this.changed();
  }
  /** Appliquer explicitement les valeurs conseillées, sans écraser une configuration existante au chargement. */
  restoreAbsenceDefaults(): void {
    if (!this.edited) return;
    const f = this.edited.absenceFrost;
    if (f.enabled && f.startBelow === 15 && f.stopAt === 16) return;
    f.enabled = true;
    f.startBelow = 15;
    f.stopAt = 16;
    this.changed();
  }
  private ensureSettings(s: PresenceSchedule): PresenceSchedule {
    return {
      ...s,
      anticipation: s.anticipation ?? {enabled:false, below:17, minutes:60},
      automaticFrost: s.automaticFrost ?? {enabled:false, startBelow:15, stopAt:17},
      presenceMode: s.presenceMode ?? {start:'07:00', end:'23:00', comfort:19.5},
      absenceFrost: s.absenceFrost ?? {enabled:true, startBelow:15, stopAt:16}
    };
  }
  private validSettings(s: PresenceSchedule): boolean {
    const half = (n:number) => Number.isFinite(n) && Math.abs(n*2-Math.round(n*2))<1e-6;
    const frost = (f:{startBelow:number;stopAt:number}) =>
      half(f.startBelow) && half(f.stopAt) && f.startBelow >= 5 && f.stopAt <=25 && f.startBelow<f.stopAt;
    return half(s.comfort) && half(s.anticipation.below) &&
      s.anticipation.below>=10 && s.anticipation.below<=25 &&
      Number.isInteger(s.anticipation.minutes) && s.anticipation.minutes>=0 && s.anticipation.minutes<=180 &&
      frost(s.automaticFrost) && frost(s.absenceFrost) && half(s.presenceMode.comfort) &&
      s.presenceMode.comfort>=10 && s.presenceMode.comfort<=25 &&
      this.validTime(s.presenceMode.start) && this.validTime(s.presenceMode.end) &&
      s.presenceMode.start !== s.presenceMode.end;
  }
  clone(s: PresenceSchedule): PresenceSchedule { return JSON.parse(JSON.stringify(s)); }
  get periods(): PresencePeriod[] { return this.edited?.days[this.selectedDay] ?? []; }
  load() {
    if (this.dirty || this.saving) {
      this.error = 'Modifications en cours : actualisation désactivée pour éviter de perdre le planning.';
      this.cdr.markForCheck();
      return;
    }
    this.cancelSaveTimer();
    this.loading = true; this.error = '';
    this.api.refreshSchedule().subscribe({
      next: s => {
        this.schedule = this.ensureSettings(this.clone(s)); this.edited = this.clone(this.schedule);
        this.loading = false; this.dirty = false; this.message = ''; this.revision = 0; this.persistedRevision = 0; this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false; this.error = 'Endpoint /dynamic/schedule.json indisponible. Installer le backend Programmation avant toute sauvegarde.';
        this.cdr.markForCheck();
      }
    });
  }
  begin(index: number) {
    this.editing = index < 0 ? -2 : index;
    this.start = index >= 0 ? this.periods[index].start : '08:00';
    this.end = index >= 0 ? this.periods[index].end : '18:00';
    this.error = '';
  }
  validTime(t: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(t); }
  savePeriod() {
    if (!this.edited) return;
    if (!this.validTime(this.start) || !this.validTime(this.end) || this.start >= this.end) {
      this.error = 'Horaires invalides. Une période doit débuter avant sa fin (HH:MM).'; return;
    }
    if (this.periods.some((p, i) => i !== this.editing && this.start < p.end && this.end > p.start)) {
      this.error = 'Cette période chevauche une autre période de fonctionnement.'; return;
    }
    const newPeriods = this.periods.map(p => ({...p}));
    if (this.editing < 0) newPeriods.push({start: this.start, end: this.end});
    else newPeriods[this.editing] = {start: this.start, end: this.end};
    newPeriods.sort((a,b) => a.start.localeCompare(b.start));
    this.edited.days[this.selectedDay] = newPeriods;
    this.editing = -1; this.changed();
  }
  removePeriod(index: number) {
    if (!this.edited) return;
    this.edited.days[this.selectedDay] = this.periods.filter((_,i) => i !== index);
    this.editing = -1; this.changed();
  }
  copyPeriods() {
    if (!this.edited) return;
    this.copyTargets.forEach((selected, i) => {
      if (selected && i !== this.selectedDay) this.edited!.days[i] = this.periods.map(p=>({...p}));
    });
    this.showCopy = false; this.copyTargets = Array(7).fill(false);
    this.changed();
  }
  private flushSave() {
    if (!this.edited || this.saving || !this.dirty) return;
    const comfort = Number(this.edited.comfort);
    if (!Number.isFinite(comfort) || comfort < 10 || comfort > 25) {
      this.error = 'Consigne invalide (10 à 25 °C). Modifications non enregistrées.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.validSettings(this.edited)) {
      this.error = 'Paramètres invalides : vérifier les seuils, les horaires et les pas de 0,5 °C.';
      this.cdr.markForCheck();
      return;
    }
    const snapshot = this.clone(this.edited);
    snapshot.comfort = comfort;
    const savingRevision = this.revision;
    this.saving = true;
    this.error = '';
    this.cdr.markForCheck();
    this.api.saveSchedule(snapshot).subscribe({
      next: result => {
        this.saving = false;
        if (!result.success) {
          this.error = result.error || 'Sauvegarde refusée par le backend. Modifications non enregistrées.';
        } else {
          this.schedule = snapshot;
          this.persistedRevision = savingRevision;
          this.dirty = this.persistedRevision !== this.revision;
          if (!this.dirty) this.message = 'Programmation enregistrée automatiquement.';
        }
        // Ne jamais envoyer deux écritures simultanées : une modification
        // effectuée pendant l'enregistrement est envoyée après la réponse.
        if (this.dirty && this.revision > savingRevision && result.success) this.queueLatest();
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.error = 'Échec de la sauvegarde automatique. Modifications conservées localement.';
        this.cdr.markForCheck();
      }
    });
  }
  private queueLatest() {
    this.cancelSaveTimer();
    this.saveTimer = setTimeout(() => { this.saveTimer = undefined; this.flushSave(); }, 250);
  }
}
