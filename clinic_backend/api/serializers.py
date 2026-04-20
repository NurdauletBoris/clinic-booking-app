from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Doctor, Appointment, Review, UserProfile

class LoginSerializer(serializers.Serializer):

    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    
    username = serializers.CharField(min_length=2, max_length=150)
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone    = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value: str) -> str:
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'Пользователь с таким email уже существует'
            )
        return value

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Пользователь с таким именем уже существует'
            )
        return value

    def create(self, validated_data: dict) -> User:
        phone = validated_data.pop('phone', '')
        user  = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, phone=phone)
        return user


class DoctorSerializer(serializers.ModelSerializer):

    photoUrl = serializers.URLField(source='photo_url', read_only=True)
    slots    = serializers.SerializerMethodField()
    rating   = serializers.DecimalField(
        max_digits=4, decimal_places=2, coerce_to_string=False
    )

    class Meta:
        model  = Doctor
        fields = [
            'id', 'name', 'specialty', 'experience',
            'rating', 'price', 'clinic', 'address',
            'photoUrl', 'slots',
        ]

    def get_slots(self, obj: Doctor) -> list:
        return obj.get_slots_list()


class AppointmentSerializer(serializers.ModelSerializer):

    doctorId    = serializers.IntegerField(source='doctor_id', write_only=True)
    doctorName  = serializers.CharField(source='doctor.name',      read_only=True)
    clinicName  = serializers.CharField(source='doctor.clinic',    read_only=True)
    patientName = serializers.CharField(source='patient_name')

    class Meta:
        model  = Appointment
        fields = [
            'id', 'doctorId', 'doctorName', 'clinicName',
            'patientName', 'date', 'time', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'doctorName', 'clinicName', 'status', 'created_at']

    def validate_doctorId(self, value: int) -> int:
        if not Doctor.objects.filter(id=value).exists():
            raise serializers.ValidationError('Врач не найден')
        return value

    def create(self, validated_data: dict) -> Appointment:
        request = self.context.get('request')
        user    = request.user if request and request.user.is_authenticated else None
        return Appointment.objects.create(user=user, **validated_data)


class ReviewSerializer(serializers.ModelSerializer):
   
    doctorName   = serializers.CharField(write_only=True)
    specialty    = serializers.CharField(write_only=True)  
    photo        = serializers.CharField(write_only=True)   
    reviewerName = serializers.CharField(
        source='reviewer_name', required=False, allow_blank=True
    )

    doctor_name_out  = serializers.CharField(source='doctor.name',      read_only=True)
    specialty_out    = serializers.CharField(source='doctor.specialty',  read_only=True)
    photo_out        = serializers.CharField(source='doctor.photo_url',  read_only=True)

    class Meta:
        model  = Review
        fields = [
            'id',
            'doctorName',    
            'specialty',     
            'photo',         
            'doctor_name_out',
            'specialty_out',
            'photo_out',
            'reviewerName',
            'comment',
            'rating',
            'date',
            'created_at',
        ]
        read_only_fields = ['id', 'doctor_name_out', 'specialty_out', 'photo_out', 'created_at']

    def validate(self, attrs: dict) -> dict:
        doctor_name = attrs.pop('doctorName', '')
        attrs.pop('specialty', None)
        attrs.pop('photo', None)

        try:
            doctor = Doctor.objects.get(name=doctor_name)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError({'doctorName': 'Врач не найден'})

        attrs['doctor'] = doctor
        return attrs

    def create(self, validated_data: dict) -> Review:
        request = self.context.get('request')
        user    = request.user if request and request.user.is_authenticated else None

        if user and not validated_data.get('reviewer_name'):
            validated_data['reviewer_name'] = user.username

        return Review.objects.create(user=user, **validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializes the extra profile fields alongside the user."""

    username = serializers.CharField(source='user.username', read_only=True)
    email    = serializers.EmailField(source='user.email',   read_only=True)

    class Meta:
        model  = UserProfile
        fields = ['username', 'email', 'phone']
