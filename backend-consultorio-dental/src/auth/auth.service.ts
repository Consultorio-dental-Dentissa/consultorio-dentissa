import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {

    /*
    iniciar_session(datos, response) {
        
        if (!datos.correo || !datos.contraseña) {
            throw new BadRequestException('Los datos no son correctos');
        }

        const token = 'Token-de-ejemplo';

        response.cookie("token", token, {
            httpOnly: true,
            secure: process.env["ON_PRODUCTION"],
            sameSite: "lax",
            maxAge: 1000 * 9
        });

        return {
            estado: true,
            token: token,
            message: 'Bienvenido',
            usuario: {
                id: 1,
                nombre: 'Nombre-de-ejemplo',
                correo: datos.correo
            }
        }
    }
        */

}
