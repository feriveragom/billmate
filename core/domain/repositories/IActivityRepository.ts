import { Activity } from '../entities';

export interface IActivityRepository {
    getAll(): Promise<Activity[]>;
    getArchived(): Promise<Activity[]>;
    archive(id: string): Promise<void>;
    unarchive(id: string): Promise<void>;
}
