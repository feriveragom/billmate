import { UserProfile } from '../entities/Admin';

export interface IUserRepository {
    getAll(): Promise<UserProfile[]>;
    updateStatus(userId: string, isActive: boolean): Promise<void>;
    updateRole(userId: string, newRole: string): Promise<void>;
    getById(userId: string): Promise<UserProfile | null>;
}
