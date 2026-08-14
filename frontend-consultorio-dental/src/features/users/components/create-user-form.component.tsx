import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";
import { InputForm, SelectForm } from "@/components/shared/input.component";
import { createUserSchema } from "@/features/users/components/user.schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/features/users/types/rol.enum";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUser } from "../hooks/use-users";
import type { SelectData } from "@/components/shared/select.component";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { UserFormData } from "@/features/users/components/user.schema";
import toast from "react-hot-toast";


const ROLES_SELECT_DATA: SelectData[] = [
    { value: Role.ADMINISTRADOR, data: "Administrador" },
    { value: Role.ASISTENTE, data: "Asistente" },
    { value: Role.PACIENTE, data: "Paciente" },
];


export function CreateUserForm({ onSubmit, onCancel }: { onSubmit: () => void, onCancel: () => void }) {

    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(createUserSchema),
        mode: 'onChange'
    });

    const createUserMutation = useCreateUser();

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

        createUserMutation.mutate(createUserDto, {
            onSuccess: () => {
                onSubmit();
                toast.success('Has registrado un usuario correctamente');
            },
            onError: (error) => toast.error(error.message)
        });
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
                            DATA={ROLES_SELECT_DATA}
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
                <Button variant="secondary" type="button" onClick={() => onCancel()}>
                    Cancelar
                </Button>
                
                <Button variant="primary" type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending && <Spinner />} Registrar usuario
                </Button>
            </div>
        </form>
    );
}
