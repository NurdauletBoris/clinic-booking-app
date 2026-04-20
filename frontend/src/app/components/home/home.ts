import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Review, Doctor } from '../../models/doctor.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  categories: { name: string, icon: string }[] = [];
  recentReviews: Review[] = [];
  allDoctors: Doctor[] = [];

  currentUser: AuthUser | null = null;

  isModalOpen = false;
  selectedDoctorIndex: number | null = null;
  newReviewText: string = '';
  selectedRating: number = 0;

  private subs = new Subscription();

  private iconMap: { [key: string]: string } = {
    'Аллерголог':               'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPFlD_Mrbv6AyQkhhEKmQTlK92EahYKnxvTw&s',
    'ЛОР (отоларинголог)':     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2pDRVrvlSi8wb18h90TZQ5a1dWHKI5eJ1jQ&s',
    'Педиатр':                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTngh1zjF_C1BCKLdREBV-WEI99Z_yylt0Wlg&s',
    'Невролог (Невропатолог)':  'https://cdn-icons-png.flaticon.com/512/15442/15442657.png',
    'ВОП (врач общей практики)':'https://cdn-icons-png.flaticon.com/512/3304/3304567.png',
    'Ортодонт':                 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGQbuWkKAX6rvQUEEM235JkGAZSBiNqbzXtw&s',
    'Челюстно-лицевой хирург': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWZAaHecD36Pj6qZOaARsa_B_MPEApHwYthg&s',
    'Нейрохирург':              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZaTYMGN9N0XY1fadusbCxT9BLTFSYcpsZaA&s',
    'Терапевт':                 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtIsFIpFSi0Izwovmem3eYAT_GxPOfrh-GJg&s',
    'Хирург':                   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9I7JGgOE0f1BmN7-lXIpuExvKfMbJh6ZvAw&s',
    'Уролог':                   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzAQu6BjQaTYDd7mP67GqDqkXjxf-FaVsa8g&s',
    'Гинеколог':                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt8HImSB3rTLND9uWyvq8Qc9OwX1XVuDS_Bg&s',
    'Мануальный терапевт':      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWN14JQaBeE0pZUrSLlHT-y4O54NGsIm1R7Q&s',
    'Рентгенолог':              'https://cdn-icons-png.flaticon.com/512/3461/3461591.png',
  };

  symptoms = [
    { label: 'Общее недомогание',     specialty: 'Терапевт' },
    { label: 'Аллергия и зуд',        specialty: 'Аллерголог' },
    { label: 'Болит ухо или горло',   specialty: 'ЛОР (отоларинголог)' },
    { label: 'Нужна справка ребенку', specialty: 'Педиатр' },
    { label: 'Боли в спине или шее',  specialty: 'Невролог (Невропатолог)' },
    { label: 'Нужна операция',        specialty: 'Хирург' },
    { label: 'Женское здоровье',      specialty: 'Гинеколог' },
    { label: 'Мужское здоровье',      specialty: 'Уролог' },
    { label: 'Сделать рентген',       specialty: 'Рентгенолог' },
    { label: 'Проблемы с прикусом',   specialty: 'Ортодонт' },
  ];

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.subs.add(
      this.bookingService.getDoctors().subscribe(doctors => {
        this.allDoctors = doctors;
        const uniqueNames = [...new Set(doctors.map(d => d.specialty))].sort();
        this.categories = uniqueNames.map(name => ({
          name,
          icon: this.iconMap[name] || 'https://cdn-icons-png.flaticon.com/512/387/387561.png',
        }));
      })
    );

    this.subs.add(
      this.bookingService.reviews$.subscribe(reviews => {
        this.recentReviews = reviews.slice(-3).reverse();
      })
    );

    this.bookingService.fetchAllReviewsFromApi();
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  logout() { this.authService.logout(); }

  get userInitials(): string {
    if (!this.currentUser) return '';
    return this.currentUser.username.slice(0, 2).toUpperCase();
  }

  leaveReview()  { this.isModalOpen = true; }

  closeModal() {
    this.isModalOpen         = false;
    this.selectedDoctorIndex = null;
    this.newReviewText       = '';
    this.selectedRating      = 0;
  }

  setRating(value: number) { this.selectedRating = value; }

  submitReview() {
    if (this.selectedDoctorIndex === null || !this.newReviewText.trim()) {
      alert('Пожалуйста, выберите врача и напишите отзыв');
      return;
    }

    const selectedDoctor = this.allDoctors[this.selectedDoctorIndex];
    const newReview: Review = {
      comment:      this.newReviewText,
      doctorName:   selectedDoctor.name,
      specialty:    selectedDoctor.specialty,
      photo:        selectedDoctor.photoUrl,
      rating:       this.selectedRating || undefined,
      date:         '17 апреля 2026',
      reviewerName: this.currentUser?.username || 'Аноним',
    };

    this.bookingService.addReviewViaApi(newReview).subscribe(result => {
      if (result.success) {
        this.closeModal();
      } else {
        alert(`Ошибка при отправке отзыва: ${result.error}`);
      }
    });
  }

  selectSymptom(specialty: string) {
    this.router.navigate(['/search'], { queryParams: { specialty } });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  filterByCategory(name: string) {
    this.router.navigate(['/search'], { queryParams: { specialty: name } });
  }

  handleIconError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/387/387561.png';
  }
}