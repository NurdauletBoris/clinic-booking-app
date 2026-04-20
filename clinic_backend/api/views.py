
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework                 import status
from rest_framework.decorators      import api_view, permission_classes
from rest_framework.permissions     import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response        import Response
from rest_framework.views           import APIView

from rest_framework_simplejwt.tokens        import RefreshToken
from rest_framework_simplejwt.exceptions    import TokenError

from .models       import Doctor, Appointment, Review
from .serializers  import (
    LoginSerializer,
    RegisterSerializer,
    DoctorSerializer,
    AppointmentSerializer,
    ReviewSerializer,
)



def _token_response(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    access  = str(refresh.access_token)
    return {
        'token': access,
        'user': {
            'username': user.username,
            'email':    user.email,
            'token':    access,
        },
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'message': 'Неверный email или пароль'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email    = serializer.validated_data['email'].lower().strip()
    password = serializer.validated_data['password']

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'message': 'Неверный email или пароль'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(request, username=user_obj.username, password=password)
    if user is None:
        return Response(
            {'message': 'Неверный email или пароль'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(_token_response(user), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Blacklist the refresh token so it can no longer be used.
    """
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # already blacklisted or invalid — treat as success

    return Response({'detail': 'Вы вышли из системы'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def booked_slots_view(request):
    
    doctor_id = request.query_params.get('doctorId')
    date      = request.query_params.get('date')

    if not doctor_id or not date:
        return Response([], status=status.HTTP_200_OK)

    booked = Appointment.objects.filter(
        doctor_id=doctor_id,
        date=date,
        status__in=['pending', 'confirmed']
    ).values_list('time', flat=True)

    return Response(list(booked), status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            errors    = serializer.errors
            first_msg = next(iter(errors.values()))[0]
            return Response(
                {'message': str(first_msg)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        return Response(_token_response(user), status=status.HTTP_201_CREATED)


class DoctorListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        qs        = Doctor.objects.active()
        specialty = request.query_params.get('specialty')
        q         = request.query_params.get('q')

        if specialty:
            qs = qs.filter(specialty__iexact=specialty)
        if q:
            qs = qs.filter(name__icontains=q)

        serializer = DoctorSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AppointmentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'message': 'Требуется авторизация'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        appointments = Appointment.objects.filter(user=request.user)
        serializer   = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = AppointmentSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            first_msg = next(iter(serializer.errors.values()))[0]
            return Response(
                {'message': str(first_msg)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doctor_id = request.data.get('doctorId')
        date      = request.data.get('date')
        time      = request.data.get('time')

        slot_taken = Appointment.objects.filter(
            doctor_id=doctor_id,
            date=date,
            time=time,
            status__in=['pending', 'confirmed']
        ).exists()

        if slot_taken:
            return Response(
                {'message': f'Время {time} на {date} уже занято. Выберите другое время.'},
                status=status.HTTP_409_CONFLICT,
            )

        appointment = serializer.save()
        return Response(
            AppointmentSerializer(appointment, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        try:
            return Appointment.objects.get(pk=pk, user=user)
        except Appointment.DoesNotExist:
            return None

    def get(self, request, pk):
        appt = self._get_object(pk, request.user)
        if not appt:
            return Response({'message': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AppointmentSerializer(appt).data)

    def put(self, request, pk):
        appt = self._get_object(pk, request.user)
        if not appt:
            return Response({'message': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AppointmentSerializer(
            appt, data=request.data, partial=True, context={'request': request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        appt = self._get_object(pk, request.user)
        if not appt:
            return Response({'message': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)
        appt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReviewView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        doctor_name = request.query_params.get('doctor')
        qs = Review.objects.all()
        if doctor_name:
            qs = qs.filter(doctor__name__icontains=doctor_name)
        serializer = ReviewSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
 
        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            first_msg = next(iter(serializer.errors.values()))[0]
            return Response(
                {'message': str(first_msg)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review = serializer.save()
        return Response(
            ReviewSerializer(review, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )