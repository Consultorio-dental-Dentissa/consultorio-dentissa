// ModalCrearUsuario.tsx
import {
    Modal, Box, Typography, TextField,
    Select, MenuItem, FormControl, InputLabel,
    Button, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const roles = [
    { value: 'PACIENTE', label: 'Paciente' },
    { value: 'DENTISTA', label: 'Dentista' },
    { value: 'ADMIN', label: 'Administrador' },
]

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
}

interface Props {
    open: boolean
    onClose: () => void
    onSubmit: () => void
}

export default function ModalCrearUsuario({ open, onClose, onSubmit }: Props) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>

                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={500}>
                        Crear usuario
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Formulario */}
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" gap={2}>
                        <TextField label="Nombre" fullWidth size="small" />
                        <TextField label="Apellido" fullWidth size="small" />
                    </Box>
                    <Box display="flex" gap={2}>
                        <TextField label="Teléfono" fullWidth size="small" />
                        <FormControl fullWidth size="small">
                            <InputLabel>Rol</InputLabel>
                            <Select label="Rol" defaultValue="">
                                {roles.map(rol => (
                                    <MenuItem key={rol.value} value={rol.value}>
                                        {rol.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField label="Correo electrónico" type="email" fullWidth size="small" />
                    <TextField label="Contraseña" type="password" fullWidth size="small" />
                </Box>

                {/* Acciones */}
                <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={onSubmit}>
                        Crear usuario
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}