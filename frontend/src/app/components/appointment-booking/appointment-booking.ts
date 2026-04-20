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
  isSubmittingReview = false;

  liveRating: number = 0;

  currentUser: AuthUser | null = null;

  isGuestModalOpen = false;
  guestName: string = '';
  guestPhone: string = '';
  guestNameError: string = '';
  guestPhoneError: string = '';

  bookedSlots: string[] = [];

  availableDates = [
    { label: 'Сегодня',    value: '2026-04-21' },
    { label: '22 апр, пн', value: '2026-04-22' },
    { label: '23 апр, вт', value: '2026-04-23' },
    { label: '24 апр, ср', value: '2026-04-24' },
    { label: '25 апр, чт', value: '2026-04-25' },
    { label: '26 апр, пт', value: '2026-04-26' },
  ];

  selectedDate: string = '2026-04-21';

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
          const isFirstLoad = !this.doctor;
          this.doctor     = found;
          this.liveRating = found.rating;

          if (isFirstLoad) {
            this.bookingService.fetchReviewsFromApi(found.name);
            this.loadBookedSlots();
          }
        }
      })
    );

    this.subs.add(
      this.bookingService.reviews$.subscribe(allReviews => {
        if (this.doctor) {
          this.doctorReviews = allReviews.filter(r => r.doctorName === this.doctor!.name);
          this.liveRating = this.bookingService.getLiveRating(this.doctor.name);
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

  setTab(tab: string) { this.activeTab = tab; }

  selectDate(dateValue: string) {
    this.selectedDate = dateValue;
    this.selectedSlot = '';
    this.loadBookedSlots();
  }

  selectSlot(slot: string) {
    if (this.bookedSlots.includes(slot)) return;
    this.selectedSlot = slot;
  }

  setRating(value: number)  { this.selectedRating = value; }
  openReviewModal()         { this.isModalOpen = true; }

  closeModal() {
    this.isModalOpen         = false;
    this.newReviewText       = '';
    this.selectedRating      = 0;
    this.isSubmittingReview  = false;
  }

  loadBookedSlots() {
    if (!this.doctor || !this.selectedDate) return;
    this.bookingService.getBookedSlots(this.doctor.id, this.selectedDate)
      .subscribe(slots => {
        this.bookedSlots = slots;
        if (this.bookedSlots.includes(this.selectedSlot)) {
          this.selectedSlot = '';
        }
      });
  }

  submitReview() {
    if (!this.doctor || !this.newReviewText.trim() || this.selectedRating === 0) {
      alert('Пожалуйста, выберите рейтинг и напишите отзыв');
      return;
    }
    if (this.isSubmittingReview) return;

    const newReview: Review = {
      comment:      this.newReviewText,
      doctorName:   this.doctor.name,
      specialty:    this.doctor.specialty,
      photo:        this.doctor.photoUrl,
      rating:       this.selectedRating,
      date:         '21 апреля 2026',
      reviewerName: this.currentUser?.username || 'Аноним',
    };

    this.isSubmittingReview = true;

    this.bookingService.addReview(newReview);
    this.closeModal();
    this.setTab('reviews');

    this.bookingService.addReviewViaApi(newReview).subscribe();
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
    this.guestName        = '';
    this.guestPhone       = '';
    this.guestNameError   = '';
    this.guestPhoneError  = '';
  }

  submitGuestBooking() {
    this.guestNameError  = '';
    this.guestPhoneError = '';

    const nameOk  = this.guestName.trim().length >= 2;
    const phoneOk = /^[\d\s\+\-\(\)]{7,}$/.test(this.guestPhone.trim());

    if (!nameOk)  this.guestNameError  = 'Введите ваше имя (минимум 2 символа)';
    if (!phoneOk) this.guestPhoneError = 'Введите корректный номер телефона';
    if (!nameOk || !phoneOk) return;

    this.doBook(this.guestName.trim());
    this.closeGuestModal();
  }

  private doBook(patientName: string) {
    if (!this.doctor || !this.selectedSlot) return;

    const newAppt: Appointment = {
      id:          Date.now(),
      doctorId:    this.doctor.id,
      doctorName:  this.doctor.name,
      clinicName:  this.doctor.clinic,
      patientName,
      date:        this.selectedDate,
      time:        this.selectedSlot,
    };

    this.bookingService.bookAppointmentViaApi(newAppt).subscribe(result => {
      if (result.success) {
        alert(`✅ Запись подтверждена!\n\nПациент: ${patientName}\nДата: ${this.selectedDate} в ${this.selectedSlot}`);
        this.router.navigate(['/search']);
      } else {
        alert(`❌ ${result.error}`);
        this.loadBookedSlots();
      }
    });
  }

  goBack() { this.location.back(); }
}