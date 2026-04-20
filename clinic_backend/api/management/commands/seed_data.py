"""
Management command: python manage.py seed_data

Seeds the database with:
  • All 20 doctors from booking.service.ts
  • 3 demo users (matching auth.service.ts mock DB)
  • 3 seed reviews
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Doctor, Review, UserProfile


DOCTORS = [
    dict(id=1,  name='Ильиных Андрей Александрович',      specialty='Невролог (Невропатолог)',       experience=19, rating=4.89, price=15000, clinic='Клиника ДОКТОР У ДОМА',              address='микрорайон Шугыла, 340/4к5',          photo_url='https://idoctor.kz/images/doctors/1226001/1225718/OXee7cz9mICsMIwOrS5KIIn2n9R6DwS9xpZIzWhn_180x180.png', slots='08:30,09:30,10:30,11:00,11:30,12:00'),
    dict(id=2,  name='Тлеубаев Маулен Орынбасарович',     specialty='ВОП (врач общей практики)',    experience=34, rating=4.0,  price=12000, clinic='KAZMED - Медицинский центр в Аксае',  address='микрорайон Аксай-5, 12А',             photo_url='https://idoctor.kz/images/doctors/1229001/1228966/tsNK0T38Pi50MhRqr1QicedP4nRngDlfEpICxJyx_200x200.png', slots='17:00,17:30,18:00,18:30,19:00,19:30,20:00'),
    dict(id=3,  name='Айдарбек Айдана Бауржановна',       specialty='Педиатр',                       experience=6,  rating=4.89, price=18000, clinic='Uki - Многопрофильная клиника',       address='проспект Аль-Фараби, 116/25',         photo_url='https://idoctor.kz/images/doctors/1225001/1225373/59u2d63kl1eC9C31g2sweDPbQDWKLHttG61WFoKL_180x180.png', slots='11:00,12:00,13:00,14:00,15:00,16:00'),
    dict(id=5,  name='Гребенников Евгений Юрьевич',       specialty='ЛОР (отоларинголог)',           experience=18, rating=4.87, price=17500, clinic='LOR Expert',                          address='улица Шевченко, 157/6',               photo_url='https://idoctor.kz/images/doctors/4001/3646/DWdJwaPkahkcMxovL17cqRs6rQ8FiGs3pYS3dJwO_180x180.png', slots='08:00,08:40,09:20,10:00,10:40,11:20'),
    dict(id=6,  name='Давыдова Татьяна Игоревна',         specialty='Ортодонт',                      experience=26, rating=4.79, price=10000, clinic='Demokrat',                             address='микрорайон Коктем-3, 24',             photo_url='https://idoctor.kz/images/doctors/1226001/1225951/i3tXJDJxvPIN8YIH2fytA5QFIC4HdbkE5XFm4Rou_180x180.png', slots='10:30,11:30,12:30,13:30,14:30,15:30'),
    dict(id=7,  name='Демченко Мария Владимировна',       specialty='Аллерголог',                    experience=15, rating=4.9,  price=13000, clinic='Allergo Clinic',                      address='ул. Навои, 208 (ЖК "Шахристан")',     photo_url='https://idoctor.kz/images/doctors/5001/5007/tf6QU6vr1dCeVEznSp0LfcJCJHaJr024ggY6BwyP_180x180.png', slots='10:30,11:30,12:30,13:30,14:30,15:30'),
    dict(id=8,  name='Алимжанов Арман Ермекович',         specialty='Нейрохирург',                   experience=10, rating=4.8,  price=15000, clinic='Достар Мед',                          address='ул. Сеченова, д. 29/7',               photo_url='https://idoctor.kz/images/doctors/1001/849/2EZCPgjnvd3IPQuvg4ru5fG4x58Y7lW7zzXO01Ds_180x180.png', slots='15:00,15:30,16:00,16:30,17:00'),
    dict(id=10, name='Нурмаганов Серик Балташевич',       specialty='Челюстно-лицевой хирург',       experience=35, rating=4.71, price=26000, clinic='Medical Park',                        address='ул. Розыбакиева, 105Б',               photo_url='https://idoctor.kz/images/doctors/15001/14569/T0qtawrmblXj1MUAv8aZAjpJK6Y5lQjUD7HtfBaC_200x200.png', slots='15:00,16:00,17:00,18:00,19:00'),
    dict(id=11, name='Кадирова Зайтунам Турсуновна',      specialty='Терапевт',                      experience=45, rating=5.0,  price=20000, clinic='KAZMED - Медицинский центр в Аксае',  address='микрорайон Аксай-5, 12А',             photo_url='https://idoctor.kz/images/doctors/1229001/1229283/GC5s0tiSEj92t9rc03REuuHKvwq1CVnBcPzbtLge_200x200.png', slots='08:00,08:30,09:00,09:30,10:00,10:30,11:00'),
    dict(id=12, name='Ли Мария Бонсиковна',               specialty='Терапевт',                      experience=45, rating=4.79, price=15000, clinic='Достар Мед',                          address='ул. Сеченова, д. 29/7',               photo_url='https://idoctor.kz/images/doctors/6001/6174/QoItCvRHRS15EvGlu8akcb9neP0C0YuLDrLMmxWE_200x200.png', slots='14:20,15:40,16:20,17:00'),
    dict(id=13, name='Сулейменов Ерлан Талгатович',       specialty='Хирург',                        experience=16, rating=4.93, price=18000, clinic='Достар Мед',                          address='ул. Сеченова, д. 29/7',               photo_url='https://idoctor.kz/images/doctors/8001/8169/lFb0cLUyxMhUV24uDziHSXxWsFbJMWFZHlIU8c8I_200x200.png', slots='10:00,10:30,11:00,11:30,12:00,12:30'),
    dict(id=14, name='Шейнберг Аркадий Борисович',        specialty='Хирург',                        experience=49, rating=4.65, price=18000, clinic='Семейный Доктор',                     address='Санаторная улица, 14',                photo_url='https://idoctor.kz/images/doctors/8001/7905/HbIYRcSm8Twzf1Mngs0XrTNrTV1CXVY0iN4Y496u_200x200.png', slots='10:30,11:00,11:30,12:00'),
    dict(id=15, name='Бишманов Рустем Какимжанович',      specialty='Уролог',                        experience=17, rating=4.75, price=25000, clinic='Uki - Многопрофильная клиника',       address='проспект Аль-Фараби, 116/25',         photo_url='https://idoctor.kz/images/doctors/3001/3411/cNxazLOPbff61cFUaqPhjjKBwazB4Np1QbOJ4GIF_200x200.png', slots='09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30'),
    dict(id=16, name='Кан Ольга Борисовна',               specialty='Уролог',                        experience=27, rating=4.70, price=13200, clinic='Medical Park',                        address='ул. Розыбакиева, 105Б',               photo_url='https://idoctor.kz/images/doctors/8001/8157/NCjEVmKdZ2cJCC8c4XLEXEq342mc25r3KI6O9FJk_200x200.png', slots='09:00,10:00,11:00,12:00'),
    dict(id=17, name='Лисеенко Игорь Васильевич',         specialty='Гинеколог',                     experience=33, rating=4.94, price=14000, clinic='Ақ Сенім',                            address='ул. Ораза Исаева, 111',               photo_url='https://idoctor.kz/images/doctors/2001/1565/BOHGcdcIGDXMbWb6003hSaqDFR5B0EKrcDqHxwIM_200x200.png', slots='08:30,09:30,10:30,11:00,12:30,13:30,14:00,14:30,15:30'),
    dict(id=18, name='Жаксылыкова Асель Амиралиевна',     specialty='Гинеколог',                     experience=16, rating=4.95, price=15000, clinic='OPEN Healthcare Kazakhstan',          address='ул. Яссауи, 13',                      photo_url='https://idoctor.kz/images/doctors/1228001/1228153/ExSabedvdoq7YYR8zifdE9D9aXZvBY5RAnuZq7U7_200x200.png', slots='09:00,11:30,15:00,15:30'),
    dict(id=19, name='Турсын Азамат Болатулы',            specialty='Мануальный терапевт',            experience=3,  rating=5.0,  price=6000,  clinic='Rekinetix',                          address='ул. Жанибекова, 42',                  photo_url='https://idoctor.kz/images/doctors/1229001/1228973/Ix5G1lUoow5XwNiFNPIicH8lnBfMyVXvSUaiPpKh_200x200.png', slots='09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30'),
    dict(id=20, name='Джаппаров Каримжан Ахметжанович',   specialty='Мануальный терапевт',            experience=6,  rating=4.89, price=20000, clinic='VIA Medical',                        address='ул. Нургисы Тлендиева, 258В',         photo_url='https://idoctor.kz/images/doctors/1225001/1224895/4mhg0Racd0goSS8kJoCrFbjNc7dRctBmxq75Ow5p_200x200.png', slots='09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30'),
    dict(id=21, name='Айтжанов Дидар Аккаевич',           specialty='Рентгенолог',                   experience=15, rating=4.23, price=7000,  clinic='DiVera',                             address='ул. Шагабутдинова, 150',              photo_url='https://idoctor.kz/images/doctors/1228001/1228158/91c900hGwFZizrtOSJE21Y2IZ1DQCnGcNv4Q9Puk_200x200.png', slots='08:00,08:30,09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,14:00,14:30'),
    dict(id=22, name='Жакупова Асия Валихановна',          specialty='Рентгенолог',                   experience=9,  rating=5.0,  price=6000,  clinic='Достар Мед',                         address='ул. Сеченова, д. 29/7',               photo_url='https://idoctor.kz/images/doctors/1225001/1224906/TXJhToEMDGdCmdsmRaKRK9QvyVnAmodR2xHwsczQ_200x200.png', slots='08:00,08:30,09:00,09:30,10:00,10:30,11:00,11:30,12:00'),
]

DEMO_USERS = [
    {'username': 'Daniyar', 'email': 'daniyar@example.com', 'password': 'password123'},
    {'username': 'Aizat',   'email': 'aizat@example.com',   'password': 'password123'},
    {'username': 'Nurzhan', 'email': 'nurzhan@example.com', 'password': 'password123'},
]

SEED_REVIEWS = [
    {
        'doctor_name': 'Бишманов Рустем Какимжанович',
        'reviewer':    'Daniyar',
        'comment':     'Очень внимательный врач, процедура прошла безболезненно и быстро. Рекомендую!',
        'rating':      5,
        'date':        '10 апреля 2026',
    },
    {
        'doctor_name': 'Кадирова Зайтунам Турсуновна',
        'reviewer':    'Aizat',
        'comment':     'Профессионал своего дела. Поставила диагноз, который не могли определить в других клиниках.',
        'rating':      5,
        'date':        '12 апреля 2026',
    },
    {
        'doctor_name': 'Сулейменов Ерлан Талгатович',
        'reviewer':    'Nurzhan',
        'comment':     'Спасибо доктору за чуткость и подробную консультацию. Теперь только к вам!',
        'rating':      5,
        'date':        '15 апреля 2026',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with doctors, demo users and sample reviews'

    def handle(self, *args, **options):
        self.stdout.write('🌱  Seeding database...')

        # ── Doctors ────────────────────────────────────────────────────────────
        created_doctors = 0
        for d in DOCTORS:
            _, created = Doctor.objects.update_or_create(
                id=d['id'],
                defaults={k: v for k, v in d.items() if k != 'id'},
            )
            if created:
                created_doctors += 1

        self.stdout.write(f'   ✔ {created_doctors} new doctors added '
                          f'({len(DOCTORS)} total)')

        # ── Demo users ─────────────────────────────────────────────────────────
        created_users = 0
        user_map: dict[str, User] = {}
        for u in DEMO_USERS:
            user, created = User.objects.get_or_create(
                email=u['email'],
                defaults={'username': u['username']},
            )
            if created:
                user.set_password(u['password'])
                user.save()
                UserProfile.objects.get_or_create(user=user)
                created_users += 1
            user_map[u['username']] = user

        self.stdout.write(f'   ✔ {created_users} new demo users created')

        # ── Seed reviews ───────────────────────────────────────────────────────
        created_reviews = 0
        for r in SEED_REVIEWS:
            try:
                doctor = Doctor.objects.get(name=r['doctor_name'])
            except Doctor.DoesNotExist:
                continue

            user = user_map.get(r['reviewer'])
            exists = Review.objects.filter(
                doctor=doctor, reviewer_name=r['reviewer']
            ).exists()
            if not exists:
                Review.objects.create(
                    doctor=doctor,
                    user=user,
                    reviewer_name=r['reviewer'],
                    comment=r['comment'],
                    rating=r['rating'],
                    date=r['date'],
                )
                created_reviews += 1

        self.stdout.write(f'   ✔ {created_reviews} seed reviews added')
        self.stdout.write(self.style.SUCCESS('✅  Done! Database is ready.'))
