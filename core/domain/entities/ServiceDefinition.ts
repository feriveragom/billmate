export interface ServiceDefinition {
    id: string;
    userId: string; // Propietario del servicio
    name: string;
    icon: string;
    color: string;
    category?: string;
    isSystemService?: boolean; // Indica si es un servicio predefinido del sistema
}
