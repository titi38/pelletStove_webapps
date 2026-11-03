import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PelletService, PresencePeriod, PresenceSchedule } from '../services/pellets.service';

@Component({selector: 'app-planning', standalone: false, templateUrl: './planning.component.html', styleUrls: ['./planning.component.scss']})
export class PlanningComponent implements OnInit {
  readonly weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  selectedDay = 0;
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
  message = '';
  error = '';
  constructor(private api: PelletService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }
  clone(s: PresenceSchedule): PresenceSchedule { return JSON.parse(JSON.stringify(s)); }
  get periods(): PresencePeriod[] { return this.edited?.days[this.selectedDay] ?? []; }
  load() {
    this.loading = true; this.error = '';
    this.api.refreshSchedule().subscribe({
      next: s => {
        this.schedule = this.clone(s); this.edited = this.clone(s);
        this.loading = false; this.dirty = false; this.message = ''; this.cdr.markForCheck();
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
      this.error = 'Cette période chevauche une autre période de présence.'; return;
    }
    const newPeriods = this.periods.map(p => ({...p}));
    if (this.editing < 0) newPeriods.push({start: this.start, end: this.end});
    else newPeriods[this.editing] = {start: this.start, end: this.end};
    newPeriods.sort((a,b) => a.start.localeCompare(b.start));
    this.edited.days[this.selectedDay] = newPeriods;
    this.dirty = true; this.editing = -1; this.error = ''; this.message = '';
  }
  removePeriod(index: number) {
    if (!this.edited) return;
    this.edited.days[this.selectedDay] = this.periods.filter((_,i) => i !== index);
    this.dirty = true; this.editing = -1; this.message = '';
  }
  copyPeriods() {
    if (!this.edited) return;
    this.copyTargets.forEach((selected, i) => {
      if (selected && i !== this.selectedDay) this.edited!.days[i] = this.periods.map(p=>({...p}));
    });
    this.showCopy = false; this.copyTargets = Array(7).fill(false);
    this.dirty = true; this.message = '';
  }
  save() {
    if (!this.edited || this.saving) return;
    if (!Number.isFinite(this.edited.comfort) ||
        this.edited.comfort < 10 || this.edited.comfort > 25) {
      this.error = 'Consigne invalide (10 à 25 °C).'; return;
    }
    this.saving = true; this.error = '';
    this.api.saveSchedule(this.edited).subscribe({
      next: result => {
        this.saving = false;
        if (!result.success) this.error = result.error || 'Sauvegarde refusée par le backend.';
        else { this.schedule = this.clone(this.edited!); this.dirty = false; this.message = 'Programmation enregistrée sur le Raspberry Pi.'; }
        this.cdr.markForCheck();
      },
      error: () => { this.saving = false; this.error = 'Échec de la sauvegarde sur le Raspberry Pi.'; this.cdr.markForCheck(); }
    });
  }
}
