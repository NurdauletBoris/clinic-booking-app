import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Doctor, Appointment } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private doctors: Doctor[] = [
  { id: 1, name: 'Ильиных Андрей Александрович', specialty: 'Невролог (Невропатолог)', experience: 19, rating: 4.89,  price: 15000, clinic: 'Клиника ДОКТОР У ДОМА', address: 'микрорайон Шугыла, 340/4к5', photoUrl: 'https://idoctor.kz/images/doctors/1226001/1225718/OXee7cz9mICsMIwOrS5KIIn2n9R6DwS9xpZIzWhn_180x180.png', slots: ['08:30', '09:30', '10:30', '11:00', '11:30', '12:00'] },
  { id: 2, name: 'Тлеубаев Маулен Орынбасарович', specialty: 'ВОП (врач общей практики)', experience: 34, rating: 4.0,  price: 12000, clinic: 'KAZMED - Медицинский центр в Аксае', address: 'микрорайон Аксай-5, 12А', photoUrl: 'https://idoctor.kz/images/doctors/1229001/1228966/8LP0J5olbsYnngx4u1EWA9m2AjXP9bLCX5DYmnc3_180x180.png', slots: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'] },
  { id: 3, name: 'Айдарбек Айдана Бауржановна', specialty: 'Педиатр', experience: 6, rating: 4.89,  price: 18000, clinic: 'Uki - Многопрофильная клиника', address: 'проспект Аль-Фараби, 116/25', photoUrl: 'https://idoctor.kz/images/doctors/1225001/1225373/59u2d63kl1eC9C31g2sweDPbQDWKLHttG61WFoKL_180x180.png', slots: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
  { id: 4, name: 'Кирьянов Павел Алексеевич', specialty: 'Детский невролог', experience: 46, rating: 4.94,  price: 15000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/3001/3253/0yWfxdvWJV0btj4iFLrxNp1gsEoixAffh2roq6Oq_180x180.png', slots: ['10:00', '11:00', '11:30', '12:00', '12:30', '13:00'] },
  { id: 5, name: 'Гребенников Евгений Юрьевич', specialty: 'ЛОР (отоларинголог)', experience: 18, rating: 4.87,  price: 17500, clinic: 'LOR Expert', address: 'улица Шевченко, 157/6', photoUrl: 'https://idoctor.kz/images/doctors/4001/3646/DWdJwaPkahkcMxovL17cqRs6rQ8FiGs3pYS3dJwO_180x180.png', slots: ['08:00', '08:40', '09:20', '10:00', '10:40', '11:20'] },
  { id: 6, name: 'Давыдова Татьяна Игоревна', specialty: 'Ортодонт', experience: 26, rating: 4.79,  price: 10000, clinic: 'Demokrat', address: 'микрорайон Коктем-3, 24', photoUrl: 'https://idoctor.kz/images/doctors/1226001/1225951/i3tXJDJxvPIN8YIH2fytA5QFIC4HdbkE5XFm4Rou_180x180.png', slots: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30'] },
  { id: 7, name: 'Демченко Мария Владимировна', specialty: 'Аллерголог', experience: 15, rating: 4.9,  price: 13000, clinic: 'Allergo Clinic', address: 'ул. Навои, 208 (ЖК "Шахристан")', photoUrl: 'https://idoctor.kz/images/doctors/5001/5007/tf6QU6vr1dCeVEznSp0LfcJCJHaJr024ggY6BwyP_180x180.png', slots: ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30'] },
  { id: 8, name: 'Алимжанов Арман Ермекович', specialty: 'Нейрохирург', experience: 10, rating: 4.8,  price: 15000, clinic: 'Достар Мед', address: 'ул. Сеченова, д. 29/7', photoUrl: 'https://idoctor.kz/images/doctors/1001/849/2EZCPgjnvd3IPQuvg4ru5fG4x58Y7lW7zzXO01Ds_180x180.png', slots: ['15:00', '15:30', '16:00', '16:30', '17:00'] },
  { id: 9, name: 'Құдаймендинов Әмірбек Асқатұлы', specialty: 'Стоматолог', experience: 6, rating: 4.71, price: 9000, clinic: 'Dobro Dent', address: 'проспект Абая, 38', photoUrl: 'https://idoctor.kz/images/doctors/1227001/1226991/zLw7BF1isD9pz8vvM6vrLLTrDWdNDD6h39nRvhRb_180x180.png', slots: ['10:00', '10:30', '11:00', '11:30', '12:00'] },
  { id: 10, name: 'Нурмаганов Серик Балташевич', specialty: 'Челюстно-лицевой хирург', experience: 35, rating: 4.71,  price: 26000, clinic: 'Medical Park', address: 'ул. Розыбакиева, 105Б', photoUrl: 'https://idoctor.kz/images/doctors/15001/14569/T0qtawrmblXj1MUAv8aZAjpJK6Y5lQjUD7HtfBaC_180x180.png  ', slots: ['15:00', '16:00', '17:00', '18:00', '19:00'] }
];

  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  getDoctors(): Observable<Doctor[]> {
    return of(this.doctors);
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(d => d.id === id);
  }

  bookAppointment(appointment: Appointment) {
    const current = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...current, appointment]);
  }

  cancelAppointment(id: number) {
    const current = this.appointmentsSubject.value.filter(a => a.id !== id);
    this.appointmentsSubject.next(current);
  }
}