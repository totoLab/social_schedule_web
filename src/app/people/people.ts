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
  personContentData: { typeDistribution: { [key: string]: number } } | null = null;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // 1-indexed
  viewMode: 'month' | 'year' = 'month';

  get viewDate(): Date {
    return new Date(this.currentYear, this.currentMonth - 1);
  }

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
      console.log("Loading person data...")
      this.loadPersonContent();
    } else {
      this.personContentData = null;
    }
  }

  loadPersonContent(): void {
    if (!this.selectedPersonId) {
      this.personContentData = null;
      return;
    }

    const contentObservable = this.viewMode === 'month'
      ? this.scheduleService.getPersonContent(this.selectedPersonId, this.currentYear, this.currentMonth)
      : this.scheduleService.getPersonContent(this.selectedPersonId, this.currentYear);

    contentObservable.subscribe({
      next: (data) => {
        this.personContentData = data;
      },
      error: (err) => {
        console.error(`Error fetching person content by ${this.viewMode}`, err);
        this.personContentData = null;
      }
    });
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
