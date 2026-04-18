import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Doctor, Appointment, Review } from '../../models/doctor.model';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointment-booking.html',
  styleUrls: ['./appointment-booking.css']
})
export class AppointmentBookingComponent implements OnInit, OnDestroy {
  doctor?: Doctor;
  doctorReviews: Review[] = [];
  selectedSlot: string = '';
  activeTab: string = 'main';
  isModalOpen = false;
  newReviewText: string = '';
  selectedRating: number = 0;

  liveRating: number = 0;

  currentUser: AuthUser | null = null;

  isGuestModalOpen = false;
  guestName: string = '';
  guestPhone: string = '';
  guestNameError: string = '';
  guestPhoneError: string = '';

  availableDates = [
    { label: 'Сегодня',    value: '2026-04-17' },
    { label: '20 апр, пн', value: '2026-04-20' },
    { label: '21 апр, вт', value: '2026-04-21' },
    { label: '22 апр, ср', value: '2026-04-22' },
    { label: '23 апр, чт', value: '2026-04-23' },
    { label: '24 апр, пт', value: '2026-04-24' },
  ];

  selectedDate: string = '2026-04-17';

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.subs.add(
      this.bookingService.doctors$.subscribe(doctors => {
        const found = doctors.find(d => d.id === id);
        if (found) {
          this.doctor     = found;
          this.liveRating = found.rating;
        }
      })
    );

    this.subs.add(
      this.bookingService.reviews$.subscribe(allReviews => {
        if (this.doctor) {
          this.doctorReviews = allReviews.filter(r => r.doctorName === this.doctor!.name);
        }
      })
    );

    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['time']) this.selectedSlot = params['time'];
      })
    );
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    return this.currentUser.username.slice(0, 2).toUpperCase();
  }

  setTab(tab: string)            { this.activeTab = tab; }
  selectDate(dateValue: string)  { this.selectedDate = dateValue; this.selectedSlot = ''; }
  selectSlot(slot: string)       { this.selectedSlot = slot; }
  setRating(value: number)       { this.selectedRating = value; }
  openReviewModal()              { this.isModalOpen = true; }

  closeModal() {
    this.isModalOpen    = false;
    this.newReviewText  = '';
    this.selectedRating = 0;
  }

  submitReview() {
    if (this.doctor && this.newReviewText.trim() && this.selectedRating > 0) {
      const newReview: Review = {
        comment:      this.newReviewText,
        doctorName:   this.doctor.name,
        specialty:    this.doctor.specialty,
        photo:        this.doctor.photoUrl,
        rating:       this.selectedRating,
        date:         '17 апреля 2026',
        reviewerName: this.currentUser?.username || 'Аноним'
      };
      this.bookingService.addReview(newReview);
      this.closeModal();
      this.setTab('reviews');
    } else {
      alert('Пожалуйста, выберите рейтинг и напишите отзыв');
    }
  }

  confirmBooking() {
    if (!this.selectedSlot) return;

    if (this.currentUser) {
      this.doBook(this.currentUser.username);
    } else {
      this.isGuestModalOpen = true;
    }
  }

  closeGuestModal() {
    this.isGuestModalOpen = false;
    this.guestName = '';
    this.guestPhone = '';
    this.guestNameError = '';
    this.guestPhoneError = '';
  }

  submitGuestBooking() {
    this.guestNameError = '';
    this.guestPhoneError = '';

    const nameOk = this.guestName.trim().length >= 2;
    const phoneOk = /^[\d\s\+\-\(\)]{7,}$/.test(this.guestPhone.trim());

    if (!nameOk) this.guestNameError = 'Введите ваше имя (минимум 2 символа)';
    if (!phoneOk) this.guestPhoneError = 'Введите корректный номер телефона';

    if (!nameOk || !phoneOk) return;

    this.doBook(this.guestName.trim());
    this.closeGuestModal();
  }

  private doBook(patientName: string) {
    if (this.doctor && this.selectedSlot) {
      const newAppt: Appointment = {
        id:          Date.now(),
        doctorId:    this.doctor.id,
        doctorName:  this.doctor.name,
        clinicName:  this.doctor.clinic,
        patientName,
        date:        this.selectedDate,
        time:        this.selectedSlot
      };
      this.bookingService.bookAppointment(newAppt);
      alert(`✅ Запись подтверждена!\n\nПациент: ${patientName}\nДата: ${this.selectedDate} в ${this.selectedSlot}`);
      this.router.navigate(['/search']);
    }
  }

  goBack() { this.location.back(); }
}