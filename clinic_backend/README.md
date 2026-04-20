# Clinic Booking — Django Backend

A Django + DRF backend for the Angular **Clinic Booking** frontend.

---

## Quick Start

```bash
# 1. Create & activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
python manage.py migrate

# 4. Seed the database (doctors + demo users + sample reviews)
python manage.py seed_data

# 5. (Optional) Create a superuser for /admin
python manage.py createsuperuser

# 6. Start the server
python manage.py runserver
```

The API is now live at **http://localhost:8000/api/**

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login → returns JWT |
| POST | `/api/auth/logout` | Public | Blacklist refresh token |
| GET | `/api/doctors` | Public | List all active doctors |
| GET | `/api/doctors?specialty=Терапевт` | Public | Filter by specialty |
| GET | `/api/doctors?q=Кадирова` | Public | Search by name |
| POST | `/api/appointments` | Optional | Book an appointment |
| GET | `/api/appointments` | Required | My appointments |
| PUT | `/api/appointments/<id>/` | Required | Update appointment |
| DELETE | `/api/appointments/<id>/` | Required | Cancel appointment |
| POST | `/api/reviews` | Optional | Submit a review |
| GET | `/api/reviews` | Public | All reviews |
| GET | `/api/reviews?doctor=<name>` | Public | Reviews for a doctor |

---

## Auth Flow

All endpoints that require auth expect:
```
Authorization: Bearer <access_token>
```

The Angular interceptor (`auth.interceptor.ts`) adds this header automatically.

Login/Register response shape (matches `AuthService` exactly):
```json
{
  "token": "<jwt_access_token>",
  "user": {
    "username": "Daniyar",
    "email": "daniyar@example.com",
    "token": "<jwt_access_token>"
  }
}
```

---

## Demo Accounts (seeded)

| Username | Email | Password |
|----------|-------|----------|
| Daniyar | daniyar@example.com | password123 |
| Aizat | aizat@example.com | password123 |
| Nurzhan | nurzhan@example.com | password123 |

---

## Connecting to Angular

Switch `auth.service.ts` to use the real API by replacing the mock calls:

```typescript
// login.ts  ────────────────────────────────────────────────────
// BEFORE (mock):
const result = this.auth.login(payload);

// AFTER (real API):
this.auth.loginViaApi(payload).subscribe(result => {
  this.loading = false;
  if (result.success) this.router.navigate(['/']);
  else this.error = result.error || 'Ошибка входа';
});

// register.ts ───────────────────────────────────────────────────
// BEFORE (mock):
const result = this.auth.register(payload);

// AFTER (real API):
this.auth.registerViaApi(payload).subscribe(result => {
  this.loading = false;
  if (result.success) this.router.navigate(['/']);
  else this.serverError = result.error || 'Ошибка регистрации';
});
```

The `loginViaApi()` and `registerViaApi()` methods are already implemented in
`auth.service.ts` — just swap the call sites in the components.

For doctors, in `booking.service.ts` the `getDoctorsFromApi()` method is ready.

---

## Architecture

### Models (4 required)
| Model | Purpose |
|-------|---------|
| `Doctor` | Medical professional with custom `ActiveDoctorManager` |
| `Appointment` | Booking (FK → Doctor, FK → User) |
| `Review` | Patient review (FK → Doctor, FK → User) |
| `UserProfile` | Extended user data, phone (OneToOne → User) |

### Serializers
| Type | Class | Purpose |
|------|-------|---------|
| `serializers.Serializer` | `LoginSerializer` | Validate login credentials |
| `serializers.Serializer` | `RegisterSerializer` | Validate & create user |
| `serializers.ModelSerializer` | `DoctorSerializer` | Doctor CRUD |
| `serializers.ModelSerializer` | `AppointmentSerializer` | Appointment CRUD |
| `serializers.ModelSerializer` | `ReviewSerializer` | Review creation |
| `serializers.ModelSerializer` | `UserProfileSerializer` | Profile read |

### Views
| Type | View | Endpoint |
|------|------|----------|
| FBV | `login_view` | POST `/api/auth/login` |
| FBV | `logout_view` | POST `/api/auth/logout` |
| CBV (APIView) | `RegisterView` | POST `/api/auth/register` |
| CBV (APIView) | `DoctorListView` | GET `/api/doctors` |
| CBV (APIView) | `AppointmentView` | POST/GET `/api/appointments` |
| CBV (APIView) | `AppointmentDetailView` | PUT/DELETE `/api/appointments/<id>/` |
| CBV (APIView) | `ReviewView` | POST/GET `/api/reviews` |

---

## Postman

Import `ClinicBooking_API.postman_collection.json` into Postman.
The Login/Register tests auto-set the `token` collection variable so all
subsequent requests are authenticated automatically.

---

## Admin Panel

Visit **http://localhost:8000/admin** after `createsuperuser` to manage
doctors, appointments, reviews and users via the Django admin interface.
