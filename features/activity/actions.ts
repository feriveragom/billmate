'use server';

import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';
import { ActivityService } from './services/activity.service';

export async function getAllActivities() {
    const repo = RepositoryFactory.getActivityRepository();
    const service = new ActivityService(repo);
    return await service.getAll();
}

export async function getArchivedActivities() {
    const repo = RepositoryFactory.getActivityRepository();
    const service = new ActivityService(repo);
    return await service.getArchived();
}

export async function archiveActivity(id: string) {
    const repo = RepositoryFactory.getActivityRepository();
    const service = new ActivityService(repo);
    return await service.archive(id);
}

export async function unarchiveActivity(id: string) {
    const repo = RepositoryFactory.getActivityRepository();
    const service = new ActivityService(repo);
    return await service.unarchive(id);
}
