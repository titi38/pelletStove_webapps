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
      {params: {_: Date.now().toString(), action: 'save', config: JSON.stringify({days: schedule.days, comfort: schedule.comfort})}});
  }

  setPresenceOverride(value: 'arrive' | 'leave' | 'clear') {
    return this.httpClient.get<{success: boolean; error?: string}>(`${this.apiUrl}/schedule.json`,
      {params: {_: Date.now().toString(), action: 'override', value}});
  }

  sendCommand(command: string) {
    // Keep the original raw query syntax expected by the Navajo backend.
    return this.httpClient.get<any>(`${this.apiUrl}/command.json?${command}`);
  }
}

export interface PresencePeriod { start: string; end: string; }
export interface PresenceSchedule {
  days: PresencePeriod[][]; comfort: number;
  override: 'none' | 'arrive' | 'leave'; presence: boolean;
}
