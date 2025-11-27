import { Activity } from '../../domain/entities';
import { IActivityRepository } from '../../domain/repositories';

export class ActivityUseCases {
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
