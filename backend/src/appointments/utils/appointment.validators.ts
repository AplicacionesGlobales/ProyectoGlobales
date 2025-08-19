
// src/appointments/utils/appointment.validators.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { APPOINTMENT_CONSTANTS } from './appointment.constants';

export function IsValidAppointmentTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidAppointmentTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          
          // Debe ser en el futuro
          return date > new Date();
        },
        defaultMessage(args: ValidationArguments) {
          return 'La fecha de la cita debe ser válida y en el futuro';
        }
      }
    });
  };
}

export function IsValidDuration(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDuration',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && 
                 value >= APPOINTMENT_CONSTANTS.DURATION.MIN && 
                 value <= APPOINTMENT_CONSTANTS.DURATION.MAX;
        },
        defaultMessage(args: ValidationArguments) {
          return `La duración debe estar entre ${APPOINTMENT_CONSTANTS.DURATION.MIN} y ${APPOINTMENT_CONSTANTS.DURATION.MAX} minutos`;
        }
      }
    });
  };
}