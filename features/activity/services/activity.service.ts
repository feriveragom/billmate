import { Activity } from '@/core/domain/entities';
import { IActivityRepository } from '@/core/domain/repositories';

export class ActivityService {
    constructor(private repository: IActivityRepository) { }

    async getAll(): Promise<Activity[]> {
        return this.repository.getAll();
    }

    async getArchived(): Promise<Activity[]> {
        return this.repository.getArchived();
    }

    async archive(id: string): Promise<void> {
        await this.repository.archive(id);
    }

    async unarchive(id: string): Promise<void> {
        await this.repository.unarchive(id);
    }
}

