import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models';
import { addMonths, subMonths,  isSameDay, isSameMonth  } from 'date-fns';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.fetchSchedules();
  }

  fetchSchedules(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth() + 1; // Month is 0-indexed in Date, 1-indexed in API
    this.scheduleService.getSchedulesByMonth(year, month).subscribe({
      next: (data) => {
        this.calendarEvents = data.map(s => ({
          title: `${s.person.name} - ${s.contentType.name}`,
          start: new Date(s.scheduledDate),
          color: { primary: s.person.color, secondary: s.person.color },
          allDay: true,
          meta: {
            personName: s.person.name,
            contentTypeName: s.contentType.name
          }
        }));
      },
      error: (err) => {
        console.error('Error fetching schedules', err);
      }
    });
  }

  incrementMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.fetchSchedules();
  }

  decrementMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    this.fetchSchedules();
  }

  today(): void {
    this.viewDate = new Date();
    this.fetchSchedules();
  }

  // Returns black or white depending on background color for contrast
  getContrastColor(hex: string): string {
    if (!hex) return '#000';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    // Standard luminance formula
    const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
    return luminance > 0.6 ? '#222' : '#fff';
  }

  // Optional: Add event handlers for calendar interactions
  handleEvent(action: string, event: CalendarEvent): void {
    console.log(`Event ${action}:`, event);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  getSlice(events: CalendarEvent[], size: number): CalendarEvent[] {
    if (size <= 0) {
      return [];
    }
    return [...events].slice(0, size);
  }
}
