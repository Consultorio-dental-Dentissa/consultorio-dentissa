
import { Controller, NotFoundException } from '@nestjs/common';
import { Get, Post, Body } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('usuarios')
export class UsuariosController {

    @Get()
    get() {
        return 'Hola';
    }


    @Post() 
    post(@Body() datos : any) {
        
    }

}
