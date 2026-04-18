import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Doctor, Appointment, Review } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  private doctors: Doctor[] = [
    { id: 1, name: 'Ильиных Андрей Александрович', specialty: 'Невролог (Невропатолог)', experience: 19, rating: 4.89, price: 15000, clinic: 'Клиника ДОКТОР У ДОМА', address: 'микрорайон Шугыла, 340/4к5', photoUrl: 'https://idoctor.kz/images/doctors/1226001/1225718/OXee7cz9mICsMIwOrS5KIIn2n9R6DwS9xpZIzWhn_180x180.png', slots: ['08:30', '09:30', '10:30', '11:00', '11:30', '12:00'] },
    { id: 2, name: 'Тлеубаев Маулен Орынбасарович', specialty: 'ВОП (врач общей практики)', experience: 34, rating: 4.0, price: 12000, clinic: 'KAZMED - Медицинский центр в Аксае', address: 'микрорайон Аксай-5, 12А', photoUrl: 'https://idoctor.kz/images/doctors/1229001/1228966/tsNK0T38Pi50MhRqr1QicedP4nRngDlfEpICxJyx_200x200.png', slots: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'] },
    { id: 3, name: 'Айдарбек Айдана Бауржановна', specialty: 'Педиатр', experience: 6, rating: 4.89, price: 18000, clinic: 'Uki - Многопрофильная клиника', address: 'проспект Аль-Фараби, 116/25', photoUrl: 'https://idoctor.kz/images/doctors/1225001/1225373/59u2d63kl1eC9C31g2sweDPbQDWKLHttG61WFoKL_180x180.png', slots: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
    { id: 5, name: 'Гребенников Евгений Юрьевич', specialty: 'ЛОР (отоларинголог)', experience: 18, rating: 4.87, price: 17500, clinic: 'LOR Expert', address: 'улица Шевченко, 157/6', photoUrl: 'https://idoctor.kz/images/doctors/4001/3646/DWdJwaPkahkcMxovL17cqRs6rQ8FiGs3pYS3dJwO_180x180.png', slots: ['08:00', '08:40', '09:20', '10:00', '10:40', '11:20'] },
    { id: 6, name: 'Давыдова Татьяна Игоревна', specialty: 'Ортодонт', experience: 26, rating: 4.79, price: 10000, clinic: 'Demokrat', address: 'микрорайон Коктем-3, 24', photoUrl: 'https://idoctor.kz/images/doctors/1226001/1225951/i3tXJDJxvPIN8YIH2fytA5QFIC4HdbkE5XFm4Rou_180x180.png', slots: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30'] },
    { id: 7, name: 'Демченко Мария Владимировна', specialty: 'Аллерголог', experience: 15, rating: 4.9, price: 13000, clinic: 'Allergo Clinic', address: 'ул. Навои, 208 (ЖК "Шахристан")', photoUrl: 'https://idoctor.kz/images/doctors/5001/5007/tf6QU6vr1dCeVEznSp0LfcJCJHaJr024ggY6BwyP_180x180.png', slots: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30'] },
    { id: 8, name: 'Алимжанов Арман Ермекович', specialty: 'Нейрохирург', experience: 10, rating: 4.8, price: 15000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/1001/849/2EZCPgjnvd3IPQuvg4ru5fG4x58Y7lW7zzXO01Ds_180x180.png', slots: ['15:00', '15:30', '16:00', '16:30', '17:00'] },
    { id: 10, name: 'Нурмаганов Серик Балташевич', specialty: 'Челюстно-лицевой хирург', experience: 35, rating: 4.71, price: 26000, clinic: 'Medical Park', address: 'ул. Розыбакиева, 105Б', photoUrl: 'https://idoctor.kz/images/doctors/15001/14569/T0qtawrmblXj1MUAv8aZAjpJK6Y5lQjUD7HtfBaC_180x180.png', slots: ['15:00', '16:00', '17:00', '18:00', '19:00'] },
    { id: 11, name: 'Кадирова Зайтунам Турсуновна', specialty: 'Терапевт', experience: 45, rating: 5.0, price: 20000, clinic: 'KAZMED - Медицинский центр в Аксае', address: 'микрорайон Аксай-5, 12А', photoUrl: 'https://idoctor.kz/images/doctors/1229001/1229283/GC5s0tiSEj92t9rc03REuuHKvwq1CVnBcPzbtLge_200x200.png', slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] },
    { id: 12, name: 'Ли Мария Бонсиковна', specialty: 'Терапевт', experience: 45, rating: 4.79, price: 15000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/6001/6174/QoItCvRHRS15EvGlu8akcb9neP0C0YuLDrLMmxWE_200x200.png', slots: ['14:20', '15:40', '16:20', '17:00'] },
    { id: 13, name: 'Сулейменов Ерлан Талгатович', specialty: 'Хирург', experience: 16, rating: 4.93, price: 18000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/8001/8169/lFb0cLUyxMhUV24uDziHSXxWsFbJMWFZHlIU8c8I_200x200.png', slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'] },
    { id: 14, name: 'Шейнберг Аркадий Борисович', specialty: 'Хирург', experience: 49, rating: 4.65, price: 18000, clinic: 'Семейный Доктор', address: 'Санаторная улица, 14', photoUrl: 'https://idoctor.kz/images/doctors/8001/7905/HbIYRcSm8Twzf1Mngs0XrTNrTV1CXVY0iN4Y496u_200x200.png', slots: ['10:30', '11:00', '11:30', '12:00'] },
    { id: 15, name: 'Бишманов Рустем Какимжанович', specialty: 'Уролог', experience: 17, rating: 4.75, price: 25000, clinic: 'Uki - Многопрофильная клиника', address: 'проспект Аль-Фараби, 116/25', photoUrl: 'https://idoctor.kz/images/doctors/3001/3411/cNxazLOPbff61cFUaqPhjjKBwazB4Np1QbOJ4GIF_200x200.png', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] },
    { id: 16, name: 'Кан Ольга Борисовна', specialty: 'Уролог', experience: 27, rating: 4.70, price: 13200, clinic: 'Medical Park', address: 'ул. Розыбакиева, 105Б', photoUrl: 'https://idoctor.kz/images/doctors/8001/8157/NCjEVmKdZ2cJCC8c4XLEXEq342mc25r3KI6O9FJk_200x200.png', slots: ['09:00', '10:00', '11:00', '12:00'] },
    { id: 17, name: 'Лисеенко Игорь Васильевич', specialty: 'Гинеколог', experience: 33, rating: 4.94, price: 14000, clinic: 'Ақ Сенім', address: 'ул. Ораза Исаева, 111', photoUrl: 'https://idoctor.kz/images/doctors/2001/1565/BOHGcdcIGDXMbWb6003hSaqDFR5B0EKrcDqHxwIM_200x200.png', slots: ['08:30', '09:30', '10:30', '11:00', '12:30', '13:30', '14:00', '14:30', '15:30'] },
    { id: 18, name: 'Жаксылыкова Асель Амиралиевна', specialty: 'Гинеколог', experience: 16, rating: 4.95, price: 15000, clinic: 'OPEN Healthcare Kazakhstan', address: 'ул. Яссауи, 13', photoUrl: 'https://idoctor.kz/images/doctors/1228001/1228153/ExSabedvdoq7YYR8zifdE9D9aXZvBY5RAnuZq7U7_200x200.png', slots: ['09:00', '11:30', '15:00', '15:30'] },
    { id: 19, name: 'Турсын Азамат Болатулы', specialty: 'Мануальный терапевт', experience: 3, rating: 5.0, price: 6000, clinic: 'Rekinetix', address: 'ул. Жанибекова, 42', photoUrl: 'https://idoctor.kz/images/doctors/1229001/1228973/Ix5G1lUoow5XwNiFNPIicH8lnBfMyVXvSUaiPpKh_200x200.png', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] },
    { id: 20, name: 'Джаппаров Каримжан Ахметжанович', specialty: 'Мануальный терапевт', experience: 6, rating: 4.89, price: 20000, clinic: 'VIA Medical', address: 'ул. Нургисы Тлендиева, 258В', photoUrl: 'https://idoctor.kz/images/doctors/1225001/1224895/4mhg0Racd0goSS8kJoCrFbjNc7dRctBmxq75Ow5p_200x200.png', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] },
    { id: 21, name: 'Айтжанов Дидар Аккаевич', specialty: 'Рентгенолог', experience: 15, rating: 4.23, price: 7000, clinic: 'DiVera', address: 'ул. Шагабутдинова, 150', photoUrl: 'https://idoctor.kz/images/doctors/1228001/1228158/91c900hGwFZizrtOSJE21Y2IZ1DQCnGcNv4Q9Puk_200x200.png', slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30'] },
    { id: 22, name: 'Жакупова Асия Валихановна', specialty: 'Рентгенолог', experience: 9, rating: 5.0, price: 6000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/1225001/1224906/TXJhToEMDGdCmdsmRaKRK9QvyVnAmodR2xHwsczQ_200x200.png', slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'] }
  ];

  private baseRatings: Map<string, { rating: number; count: number }> = new Map([
    ['Бишманов Рустем Какимжанович',    { rating: 4.75, count: 40 }],
    ['Кадирова Зайтунам Турсуновна',    { rating: 5.0,  count: 60 }],
    ['Сулейменов Ерлан Талгатович',     { rating: 4.93, count: 35 }],
  ]);

  private reviews: Review[] = [
    {
      doctorName: 'Бишманов Рустем Какимжанович',
      specialty: 'Уролог',
      comment: 'Очень внимательный врач, процедура прошла безболезненно и быстро. Рекомендую!',
      photo: 'https://idoctor.kz/images/doctors/1229001/1228832/MvW73Y6S9R9CAnfXv23rK38V_180x180.png',
      rating: 5
    },
    {
      doctorName: 'Кадирова Зайтунам Турсуновна',
      specialty: 'Терапевт',
      comment: 'Профессионал своего дела. Поставила диагноз, который не могли определить в других клиниках.',
      photo: 'https://idoctor.kz/images/doctors/1229001/1228490/KshYVpXm9F9CAnfXv23rK38V4vW73Y6S_180x180.png',
      rating: 5
    },
    {
      doctorName: 'Сулейменов Ерлан Талгатович',
      specialty: 'Хирург',
      comment: 'Спасибо доктору за чуткость и подробную консультацию. Теперь только к вам!',
      photo: 'https://idoctor.kz/images/doctors/1229001/1228741/JpXv3S2m9R9CAnfXv23rK38V4vW73Y6S_180x180.png',
      rating: 5
    }
  ];

  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  private reviewsSubject = new BehaviorSubject<Review[]>(this.reviews);
  reviews$ = this.reviewsSubject.asObservable();

  doctors$: Observable<Doctor[]> = this.reviewsSubject.pipe(
    map(allReviews => this.doctors.map(doctor => ({
      ...doctor,
      rating: this.calcRating(doctor.name, allReviews)
    })))
  );

  private calcRating(doctorName: string, allReviews: Review[]): number {
    const userReviews = allReviews.filter(r => r.doctorName === doctorName && r.rating != null);

    if (userReviews.length === 0) {
      return this.doctors.find(d => d.name === doctorName)?.rating ?? 0;
    }

    const base = this.baseRatings.get(doctorName);
    const userSum = userReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);

    if (base) {
      const total = (base.rating * base.count + userSum) / (base.count + userReviews.length);
      return Math.round(total * 100) / 100;
    }

    const avg = userSum / userReviews.length;
    return Math.round(avg * 100) / 100;
  }

  getDoctors(): Observable<Doctor[]> {
    return this.doctors$;
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(d => d.id === id);
  }

  getLiveRating(doctorName: string): number {
    return this.calcRating(doctorName, this.reviewsSubject.value);
  }

  bookAppointment(appointment: Appointment) {
    const current = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...current, appointment]);
  }

  cancelAppointment(id: number) {
    const current = this.appointmentsSubject.value.filter(a => a.id !== id);
    this.appointmentsSubject.next(current);
  }

  addReview(newReview: Review) {
    const currentReviews = [...this.reviewsSubject.value, newReview];
    this.reviewsSubject.next(currentReviews);
  }

  getDoctorsFromApi(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>('/api/doctors').pipe(
      catchError(err => {
        console.error('Не удалось загрузить врачей с сервера:', err);
        return this.doctors$;
      })
    );
  }

  bookAppointmentViaApi(appointment: Appointment): Observable<{ success: boolean; error?: string }> {
    return this.http.post<Appointment>('/api/appointments', appointment).pipe(
      map(() => {
        this.bookAppointment(appointment);
        return { success: true };
      }),
      catchError(err => {
        console.error('Ошибка при записи на приём:', err);
        const error = err.error?.message || 'Не удалось записаться. Попробуйте позже.';
        return of({ success: false, error });
      })
    );
  }

  addReviewViaApi(review: Review): Observable<{ success: boolean; error?: string }> {
    return this.http.post<Review>('/api/reviews', review).pipe(
      map(() => {
        this.addReview(review);
        return { success: true };
      }),
      catchError(err => {
        console.error('Ошибка при отправке отзыва:', err);
        const error = err.error?.message || 'Не удалось отправить отзыв. Попробуйте позже.';
        return of({ success: false, error });
      })
    );
  }
}