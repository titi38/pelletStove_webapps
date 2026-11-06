import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PelletService {
  private readonly apiUrl = '/dynamic';
  constructor(private httpClient: HttpClient) {}

  refreshInfo() {
    return this.httpClient.get<any>(`${this.apiUrl}/info.json`);
  }

  refreshStats() {
    return this.httpClient.get<{hour: number; quarter: number; stats: number[][]}>(
      `${this.apiUrl}/stats.json`, {params: {_: Date.now().toString()}}
    );
  }

  refreshSchedule() {
    return this.httpClient.get<PresenceSchedule>(`${this.apiUrl}/schedule.json`,
      {params: { _: Date.now().toString() }});
  }

  saveSchedule(schedule: PresenceSchedule) {
    return this.httpClient.get<{success: boolean; error?: string}>(`${this.apiUrl}/schedule.json`,
      {params: {_: Date.now().toString(), action: 'save', config: JSON.stringify({days: schedule.days, comfort: schedule.comfort, anticipation: schedule.anticipation, automaticFrost: schedule.automaticFrost, presenceMode: schedule.presenceMode, absenceFrost: schedule.absenceFrost})}});
  }

  setPresenceOverride(value: 'arrive' | 'leave') {
    return this.httpClient.get<{success: boolean; error?: string}>(`${this.apiUrl}/schedule.json`,
      {params: {_: Date.now().toString(), action: 'override', value}});
  }

  sendCommand(command: string) {
    // Keep the original raw query syntax expected by the Navajo backend.
    return this.httpClient.get<any>(`${this.apiUrl}/command.json?${command}`);
  }
}

export interface PresencePeriod { start: string; end: string; }
export interface FrostSettings { enabled: boolean; startBelow: number; stopAt: number; }
export interface AnticipationSettings { enabled: boolean; below: number; minutes: number; }
export interface PresenceModeSettings { start: string; end: string; comfort: number; }
export interface PresenceSchedule {
  anticipation: AnticipationSettings;
  automaticFrost: FrostSettings;
  presenceMode: PresenceModeSettings;
  absenceFrost: FrostSettings;
  days: PresencePeriod[][]; comfort: number;
  override: 'none' | 'arrive' | 'leave'; presence: boolean;
  overrideUntil?: number; effectivePresence?: boolean; autoEnabled?: boolean; alarmLatched?: boolean; lastAlarm?: string;
}
