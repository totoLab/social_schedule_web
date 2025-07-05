import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../services/schedule';
import { Person, Schedule } from '../models';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people.html',
  styleUrl: './people.css'
})
export class PeopleComponent implements OnInit {
  people: Person[] = [];
  selectedPersonId: number | null = null;

  get selectedPersonName(): string {
    const selectedPerson = this.people.find(p => p.id === this.selectedPersonId);
    return selectedPerson ? selectedPerson.name : '';
  }
  personSchedules: Schedule[] = [];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // 1-indexed
  viewMode: 'month' | 'year' = 'month';

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.loadPeople();
  }

  loadPeople(): void {
    this.scheduleService.getAllPeople().subscribe({
      next: (data) => {
        this.people = data;
      },
      error: (err) => {
        console.error('Error fetching people', err);
      }
    });
  }

  onPersonSelect(): void {
    if (this.selectedPersonId) {
      this.loadPersonContent();
    } else {
      this.personSchedules = [];
    }
  }

  loadPersonContent(): void {
    if (this.selectedPersonId) {
      if (this.viewMode === 'month') {
        this.scheduleService.getPersonContent(this.selectedPersonId, this.currentYear, this.currentMonth).subscribe({
          next: (data) => {
            this.personSchedules = data.schedules; // Assuming backend returns schedules directly or within a property like 'schedules'
          },
          error: (err) => {
            console.error('Error fetching person content by month', err);
          }
        });
      } else {
        this.scheduleService.getPersonContent(this.selectedPersonId, this.currentYear).subscribe({
          next: (data) => {
            this.personSchedules = data.schedules; // Assuming backend returns schedules directly or within a property like 'schedules'
          },
          error: (err) => {
            console.error('Error fetching person content by year', err);
          }
        });
      }
    }
  }

  nextPeriod(): void {
    if (this.viewMode === 'month') {
      if (this.currentMonth === 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    } else {
      this.currentYear++;
    }
    this.loadPersonContent();
  }

  prevPeriod(): void {
    if (this.viewMode === 'month') {
      if (this.currentMonth === 1) {
        this.currentMonth = 12;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    } else {
      this.currentYear--;
    }
    this.loadPersonContent();
  }

  changeViewMode(mode: 'month' | 'year'): void {
    this.viewMode = mode;
    this.loadPersonContent();
  }
}
