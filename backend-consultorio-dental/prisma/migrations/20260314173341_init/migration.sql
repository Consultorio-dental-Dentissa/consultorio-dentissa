BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[usuarios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [apellido] NVARCHAR(1000) NOT NULL,
    [correo] NVARCHAR(1000) NOT NULL,
    [contraseña] NVARCHAR(1000) NOT NULL,
    [telefono] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [usuarios_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [rol_id] INT NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [usuarios_activo_df] DEFAULT 1,
    CONSTRAINT [usuarios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [usuarios_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rol] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_rol_key] UNIQUE NONCLUSTERED ([rol])
);

-- CreateTable
CREATE TABLE [dbo].[pacientes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [direccion] NVARCHAR(1000) NOT NULL,
    [fecha_nacimiento] DATETIME2 NOT NULL,
    [telefono_emergencia] NVARCHAR(1000),
    [usuario_id] INT NOT NULL,
    CONSTRAINT [pacientes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [pacientes_usuario_id_key] UNIQUE NONCLUSTERED ([usuario_id])
);

-- CreateTable
CREATE TABLE [dbo].[servicios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [duracion_minutos] INT NOT NULL,
    [precio] DECIMAL(10,2) NOT NULL,
    [descripcion] NVARCHAR(max) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [servicios_activo_df] DEFAULT 1,
    CONSTRAINT [servicios_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[imagenes_servicio] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(max) NOT NULL,
    [ubicacion] NVARCHAR(max),
    [servicio_id] INT NOT NULL,
    CONSTRAINT [imagenes_servicio_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[citas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fecha] DATETIME2 NOT NULL,
    [hora] TIME NOT NULL,
    [duracion_minutos] INT NOT NULL,
    [estado] NVARCHAR(1000) NOT NULL CONSTRAINT [citas_estado_df] DEFAULT 'PENDIENTE',
    [nota_previa] NVARCHAR(max) NOT NULL,
    [motivo] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [citas_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [citas_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [paciente_id] INT NOT NULL,
    [servicio_id] INT NOT NULL,
    CONSTRAINT [citas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[consultas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [notas] NVARCHAR(max) NOT NULL,
    [observaciones] NVARCHAR(max) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [consultas_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [cita_id] INT NOT NULL,
    CONSTRAINT [consultas_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [consultas_cita_id_key] UNIQUE NONCLUSTERED ([cita_id])
);

-- CreateTable
CREATE TABLE [dbo].[imagenes_consultas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(max) NOT NULL,
    [ubicacion] NVARCHAR(max),
    [consulta_id] INT NOT NULL,
    CONSTRAINT [imagenes_consultas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ofertas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(max) NOT NULL,
    [fecha_inicio] DATETIME2 NOT NULL,
    [fecha_fin] DATETIME2 NOT NULL,
    [activa] BIT NOT NULL CONSTRAINT [ofertas_activa_df] DEFAULT 0,
    CONSTRAINT [ofertas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ofertas_servicios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [oferta_id] INT NOT NULL,
    [servicio_id] INT NOT NULL,
    CONSTRAINT [ofertas_servicios_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[horarios_disponibles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dia_semana] INT NOT NULL,
    [hora_inicio] TIME NOT NULL,
    [hora_fin] TIME NOT NULL,
    [estado] BIT NOT NULL,
    CONSTRAINT [horarios_disponibles_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[fechas_bloqueadas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fecha] DATETIME2 NOT NULL,
    [motivo] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [fechas_bloqueadas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[preguntas_frecuentes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [pregunta] NVARCHAR(max) NOT NULL,
    [respuesta] NVARCHAR(max) NOT NULL,
    CONSTRAINT [preguntas_frecuentes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notificaciones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tipo] NVARCHAR(1000) NOT NULL,
    [mensaje] NVARCHAR(1000) NOT NULL,
    [leida] BIT NOT NULL CONSTRAINT [notificaciones_leida_df] DEFAULT 0,
    [usuario_id] INT NOT NULL,
    [cita_id] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [notificaciones_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notificaciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[usuarios] ADD CONSTRAINT [usuarios_rol_id_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[pacientes] ADD CONSTRAINT [pacientes_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[imagenes_servicio] ADD CONSTRAINT [imagenes_servicio_servicio_id_fkey] FOREIGN KEY ([servicio_id]) REFERENCES [dbo].[servicios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[citas] ADD CONSTRAINT [citas_paciente_id_fkey] FOREIGN KEY ([paciente_id]) REFERENCES [dbo].[pacientes]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[citas] ADD CONSTRAINT [citas_servicio_id_fkey] FOREIGN KEY ([servicio_id]) REFERENCES [dbo].[servicios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[consultas] ADD CONSTRAINT [consultas_cita_id_fkey] FOREIGN KEY ([cita_id]) REFERENCES [dbo].[citas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[imagenes_consultas] ADD CONSTRAINT [imagenes_consultas_consulta_id_fkey] FOREIGN KEY ([consulta_id]) REFERENCES [dbo].[consultas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ofertas_servicios] ADD CONSTRAINT [ofertas_servicios_oferta_id_fkey] FOREIGN KEY ([oferta_id]) REFERENCES [dbo].[ofertas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ofertas_servicios] ADD CONSTRAINT [ofertas_servicios_servicio_id_fkey] FOREIGN KEY ([servicio_id]) REFERENCES [dbo].[servicios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[notificaciones] ADD CONSTRAINT [notificaciones_cita_id_fkey] FOREIGN KEY ([cita_id]) REFERENCES [dbo].[citas]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[notificaciones] ADD CONSTRAINT [notificaciones_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
