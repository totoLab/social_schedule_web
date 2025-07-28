import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

  selectedContentType: string | null = null;
  contentForSelectedType: Schedule[] = [];
  isLoadingContent = false;
  today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  @ViewChild('contentList') contentList: ElementRef | undefined;

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
    this.clearContentTypeSelection();
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
    this.clearContentTypeSelection();

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

  onContentTypeClick(contentType: string): void {
    if (!this.selectedPersonId) return;

    this.selectedContentType = contentType;
    this.isLoadingContent = true;
    this.contentForSelectedType = [];

    if (this.viewMode == "month") {
      this.scheduleService.getSchedulesForPersonAndContentTypeInMonth(this.selectedPersonId, contentType, this.currentYear, this.currentMonth).subscribe({
        next: (data) => {
          this.contentForSelectedType = data.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
          this.isLoadingContent = false;
          setTimeout(() => this.scrollToToday(), 0);
        },
        error: (err) => {
          console.error(`Error fetching content for type ${contentType}`, err);
          this.isLoadingContent = false;
        }
      });
    } else {
      this.scheduleService.getSchedulesForPersonAndContentTypeInYear(this.selectedPersonId, contentType, this.currentYear).subscribe({
        next: (data) => {
          this.contentForSelectedType = data.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
          this.isLoadingContent = false;
          setTimeout(() => this.scrollToToday(), 0);
        },
        error: (err) => {
          console.error(`Error fetching content for type ${contentType}`, err);
          this.isLoadingContent = false;
        }
      });
    }
  }

  clearContentTypeSelection(): void {
    this.selectedContentType = null;
    this.contentForSelectedType = [];
  }

  scrollToToday(): void {
    if (!this.contentList) return;

    const listEl = this.contentList.nativeElement;
    const todayEl = listEl.querySelector('.today');

    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
