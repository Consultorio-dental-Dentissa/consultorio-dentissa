import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserFormData } from "./user.schema";
import { FieldGroup } from "@/components/ui/field";
import { InputForm, SelectForm } from "@/components/common/input.component";
import { createUserSchema } from "./user.schema";
import { Button } from "@/components/ui/button";
import { Separator } from "../ui/separator";
import { Role } from "@/types/enums/rol.enum";
import type { SelectData } from "@/components/common/select.component";
import type { CreateUserDto } from "@/types/api/request/create-user.dto";


interface CreateUserFormProps {
    onSubmit: (data: CreateUserDto) => void;
    onCancel: () => void;
}


const ROLES: SelectData[] = [
    { value: Role.ADMINISTRADOR, data: "Administrador" },
    { value: Role.ASISTENTE, data: "Asistente" },
    { value: Role.PACIENTE, data: "Paciente" },
];


export function CreateUserForm({ onSubmit, onCancel }: CreateUserFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UserFormData>({
        resolver: zodResolver(createUserSchema),
    });

    const isPatient = watch("role") === Role.PACIENTE;

    const handleSubmitForm = (data: UserFormData) => {

        /**
         * INDICACION:
         * aqui convertimos los datos del formulario
         * al DTO de crear usuario
         */
        const createUserDto: CreateUserDto = {
            ...data
        };

        createUserDto.role !== Role.PACIENTE && delete createUserDto.patient;

        console.log("FORM DATA: ", data);
        console.log("DTO: ", createUserDto);

        onSubmit(createUserDto);
    };

    return (
        <form
            className="flex flex-col gap-7"
            onSubmit={handleSubmit(handleSubmitForm)}
        >
            <FieldGroup className="flex-row">
                <InputForm label="Nombre" placeholder="Ingresa tu nombre"
                    error={errors.name?.message}
                    registration={register("name")}
                />

                <InputForm label="Apellido" placeholder="Ingresa tu apellido"
                    error={errors.lastname?.message}
                    registration={register("lastname")}
                />
            </FieldGroup>

            <FieldGroup className="flex-row">
                <InputForm label="Correo electrónico" placeholder="Ingresa tu correo"
                    error={errors.email?.message}
                    registration={register("email")}
                />

                <InputForm label="Teléfono" placeholder="Ingresa tu teléfono"
                    error={errors.phone?.message}
                    registration={register("phone")}
                />
            </FieldGroup>

            <FieldGroup className="flex-row">
                <InputForm type="password" label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password?.message}
                    registration={register("password")}
                />

                <Controller control={control} name="role"
                    render={({ field }) => (
                        <SelectForm label="Rol" title="Roles" placeholder="Seleccione un rol"
                            DATA={ROLES}
                            onChange={field.onChange}
                            value={field.value}
                            error={errors.role?.message}
                        />
                    )}
                />
            </FieldGroup>

            {isPatient && (
                <>
                    <hr />
                    <FieldGroup className="flex-row">
                        <InputForm label="Dirección" placeholder="La dirección es obligatoria"
                            error={errors.patient?.address?.message}
                            registration={register("patient.address")}
                        />

                        <InputForm label="Teléfono de emergencia" placeholder="Ingrese su teléfono de emergencia"
                            error={errors.patient?.emergency_phone?.message}
                            registration={register("patient.emergency_phone")}
                        />
                    </FieldGroup>

                    <FieldGroup className="flex-row">
                        <InputForm type="date" label="Fecha de nacimiento" placeholder="Ingrese su fecha de nacimiento"
                            error={errors.patient?.birth_date?.message}
                            registration={register("patient.birth_date")}
                        />
                    </FieldGroup>
                </>
            )}

            <Separator />

            <div className="flex justify-end gap-2 mt-2">
                <Button variant="secondary" type="button" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Registrar usuario
                </Button>
            </div>
        </form>
    );
}
