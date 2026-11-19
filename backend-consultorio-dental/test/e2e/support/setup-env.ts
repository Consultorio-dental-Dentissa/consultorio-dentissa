// Se ejecuta en cada archivo de prueba ANTES de importar la app (los modulos
// leen process.env al cargarse). Reutiliza los valores fijados por global-setup.
import { applyTestEnv, buildUrls } from './env';

applyTestEnv(buildUrls());
