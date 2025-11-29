import { Activity } from '@/core/domain/entities';
import { IActivityRepository } from '@/core/domain/repositories/IActivityRepository';

export class FirebaseActivityRepository implements IActivityRepository {

    async getAll(): Promise<Activity[]> {
        // TODO: Implement Firebase query
        console.log('[MOCK] FirebaseActivityRepository.getAll()');
        return [];
    }

    async getArchived(): Promise<Activity[]> {
        // TODO: Implement Firebase query for archived
        console.log('[MOCK] FirebaseActivityRepository.getArchived()');
        return [];
    }

    async archive(id: string): Promise<void> {
        // TODO: Implement Firebase update
        console.log('[MOCK] FirebaseActivityRepository.archive()', id);
    }

    async unarchive(id: string): Promise<void> {
        // TODO: Implement Firebase update
        console.log('[MOCK] FirebaseActivityRepository.unarchive()', id);
    }
}
