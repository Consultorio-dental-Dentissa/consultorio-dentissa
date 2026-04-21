import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { CreateUserDto } from './dto/create-user.dto';
import type { ICreateUser } from './interfaces/create-user.interface';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/rol.enum';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { last } from 'rxjs';


@Injectable()
export class UsersService {

    constructor(
        private usersRepository: UsersRepository,
        private patientsRepository: PatientsRepository,
        private prisma: PrismaService
    ) { }


    async getAllUsers(): Promise<User[]> {
        return await this.usersRepository.getAll();
    }


    async getUserById(id: number) {

        const user = await this.usersRepository.getById(id);

        if (!user) {
            throw new NotFoundException('El usuario no se ha encontrado');
        }

        return user;
    }


    async createUser(user: ICreateUser) {

        const emailExists = await this.usersRepository.emailExists(user.email);

        if (emailExists) {
            throw new BadRequestException('Este correo ya esta registrado');
        }

        const phoneExists = await this.usersRepository.phoneExists(user.phone);

        if (phoneExists) {
            throw new BadRequestException('Este telefono ya esta registrado');
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        user.password = hashedPassword;


        /**
         * TODO: Buscar la forma de que si el usuario tiene rol de paciente, se registre el paciente
         * inmediatamente despues del usuario. De esto fallar, hacer un rollback a la base de datos
         * para no dejar al usuario registrado sin un registro de paciente relacionado.
         */

        if (user.role === Role.PACIENTE) {

            if (!user.patient) {
                throw new BadRequestException('Debes llenar todos los campos del paciente');
            }

            return await this.createUserAndPatient(user, user.patient);
        }

        return await this.usersRepository.create(user);
    }


    async createUserAndPatient(userData: CreateUserDto, patientData: CreatePatientDto) {

        try {
            return await this.prisma.$transaction(async (tx) => {

                const user = await this.usersRepository.create(userData, tx);
                patientData.user_id = user.id;

                await this.patientsRepository.create(patientData, tx);

                return user;
            });

        } catch (error) {
            console.log(error);
            throw new BadRequestException('Hubo un error al ingresar el usuario');
        }
    }

    async getUserByEmailWithPassword(email) {
        return await this.usersRepository.getUserByEmailWithPassword(email);
    }

    async updateUserStatus(id: number, status: boolean) {
        return await this.usersRepository.updateUserStatus(id, status)
    }
}
