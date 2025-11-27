import { Activity } from '../../domain/entities';
import { IActivityRepository } from '../../domain/repositories';
import { initialActivities } from '../../../lib/mockData';

export class MockActivityRepository implements IActivityRepository {
    private activities: Activity[];
    private archivedActivities: Activity[];

    constructor() {
        this.activities = [...initialActivities];
        this.archivedActivities = [];
    }

    async getAll(): Promise<Activity[]> {
        return [...this.activities];
    }

    async getArchived(): Promise<Activity[]> {
        return [...this.archivedActivities];
    }

    async archive(id: string): Promise<void> {
        const activity = this.activities.find(a => a.id === id);
        if (activity) {
            this.activities = this.activities.filter(a => a.id !== id);
            this.archivedActivities.push(activity);
        }
    }

    async unarchive(id: string): Promise<void> {
        const activity = this.archivedActivities.find(a => a.id === id);
        if (activity) {
            this.archivedActivities = this.archivedActivities.filter(a => a.id !== id);
            this.activities.push(activity);
        }
    }
}
