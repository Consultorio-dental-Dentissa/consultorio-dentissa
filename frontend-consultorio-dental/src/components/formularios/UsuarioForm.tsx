// components/features/usuarios/UsuarioForm.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "../ui/field"
import { Rol } from "@/types/enums/rol-enum"
import { useState } from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface UsuarioFormProps {
    onSubmit: () => void
    onCancel: () => void
}

export default function UsuarioForm({ onSubmit, onCancel }: UsuarioFormProps) {

    const [esPaciente, setEsPaciente] = useState(false);

    return (
        <div className="flex flex-col gap-7">
            <FieldGroup className="flex-row">
                <Field>
                    <Label>Nombre</Label>
                    <Input placeholder="Ingresa tu nombre"></Input>
                </Field>
                <Field>
                    <Label>Apellido</Label>
                    <Input placeholder="Ingresa tu apellido"></Input>
                </Field>
            </FieldGroup>
            <FieldGroup className="flex-row">
                <Field>
                    <Label>Correo electronico</Label>
                    <Input placeholder="paciente@gmail.com"></Input>
                </Field>
                <Field>
                    <Label>Telefono</Label>
                    <Input placeholder="+53 485 594 4736"></Input>
                </Field>
            </FieldGroup>

            <FieldGroup className="flex-row">
                <Field>
                    <Label>Contraseña</Label>
                    <Input placeholder="......" type="password"></Input>
                </Field>
                <Field>
                    <Label>Rol</Label>
                    <Select onValueChange={(rol) => rol === Rol.PACIENTE ? setEsPaciente(true) : setEsPaciente(false)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccioné un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                                <SelectItem value="ASISTENTE">Asistente</SelectItem>
                                <SelectItem value="PACIENTE">Paciente</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </FieldGroup>
            <hr />
            {
                esPaciente && (
                    <>
                        <FieldGroup className="flex-row">
                            <Field>
                                <Label>Direccion</Label>
                                <Input placeholder="ingrese su dirección"></Input>
                            </Field>
                            <Field>
                                <Label>Telefono de emergencia</Label>
                                <Input placeholder="+52 394 586 5848"></Input>
                            </Field>
                        </FieldGroup>

                        <FieldGroup className="flex-row">
                            <Field>
                                <Label>Fecha de nacimiento</Label>
                                <Input type="date"></Input>
                            </Field>
                        </FieldGroup>
                    </>
                )
            }

            <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button onClick={onSubmit}>Crear usuario</Button>
            </div>
        </div>
    )
}