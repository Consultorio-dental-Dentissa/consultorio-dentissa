/** Estilos del sitio público extraídos de docs/DISEÑO-FINAL/Propuesta A - Sitio Web.dc.html. */
export const publicStyles = {
    /** Botón primario: rosa #fc7186, hover #ec5d73 + halo rosa como "Registrarse". */
    primaryButton:
        "bg-primary text-white transition-[box-shadow,background-color] duration-[250ms] hover:bg-primary-hover hover:text-white hover:shadow-cta-hover",
    /** Botón secundario del sitio: gris #f1f2f4, hover #e6e8eb. */
    outlineButton: "bg-fill text-foreground transition-colors hover:bg-[#e6e8eb] hover:text-foreground",
} as const;
