// Mock the Mongoose models (no live DB; repo convention).
jest.mock('../../models/User.model', () => ({ User: { countDocuments: jest.fn(), find: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('../../models/Project.model', () => ({ Project: { countDocuments: jest.fn(), aggregate: jest.fn(), find: jest.fn() } }));
jest.mock('../../models/GenerationRun.model', () => ({ GenerationRun: { countDocuments: jest.fn(), aggregate: jest.fn() } }));
jest.mock('../../models/DeploymentRecord.model', () => ({ DeploymentRecord: { countDocuments: jest.fn(), find: jest.fn() } }));
jest.mock('../../models/Notification.model', () => ({ Notification: { countDocuments: jest.fn() } }));
jest.mock('../../models/AuditLog.model', () => ({ AuditLog: { find: jest.fn(), aggregate: jest.fn() } }));

import { getStatsService, listUsersService, setUserRoleService } from '../admin.service';
import { User } from '../../models/User.model';
import { Project } from '../../models/Project.model';
import { GenerationRun } from '../../models/GenerationRun.model';
import { DeploymentRecord } from '../../models/DeploymentRecord.model';
import { Notification } from '../../models/Notification.model';

const userCount = User.countDocuments as jest.Mock;
const userFind = User.find as jest.Mock;
const userUpdate = User.findByIdAndUpdate as jest.Mock;
const projCount = Project.countDocuments as jest.Mock;
const projAgg = Project.aggregate as jest.Mock;
const genCount = GenerationRun.countDocuments as jest.Mock;
const genAgg = GenerationRun.aggregate as jest.Mock;
const depCount = DeploymentRecord.countDocuments as jest.Mock;
const notifCount = Notification.countDocuments as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('getStatsService', () => {
  it('assembles counts + maps project statuses + rounds avg duration', async () => {
    userCount.mockResolvedValue(10);
    projCount.mockResolvedValue(4);
    projAgg.mockResolvedValue([{ _id: 'LIVE', n: 3 }, { _id: 'INTAKE', n: 1 }, { _id: 'BOGUS', n: 9 }]);
    genCount.mockResolvedValue(2);
    genAgg.mockResolvedValue([{ avg: 4500.7 }]);
    depCount.mockResolvedValue(1);
    notifCount.mockResolvedValue(7);

    const stats = await getStatsService();
    expect(stats.users.total).toBe(10);
    expect(stats.projects.byStatus.LIVE).toBe(3);
    expect(stats.projects.byStatus.INTAKE).toBe(1);
    expect(stats.projects.byStatus.PREVIEW).toBe(0);
    expect(stats.projects.byStatus).not.toHaveProperty('BOGUS');
    expect(stats.generations.avgDurationMs).toBe(4501);
    expect(stats.deployments.exported).toBe(1);
    expect(stats.notifications.sent).toBe(7);
  });
});

describe('listUsersService', () => {
  const chain = (rows: any[]) => ({
    select: () => ({ sort: () => ({ skip: () => ({ limit: () => ({ lean: () => Promise.resolve(rows) }) }) }) }),
  });

  it('clamps the limit and attaches project counts', async () => {
    userCount.mockResolvedValue(1);
    userFind.mockReturnValue(chain([{ _id: 'u1', fullName: 'Ann', email: 'ann@x.com', organizationType: 'clinic', role: 'user', isEmailVerified: true, createdAt: new Date() }]));
    projAgg.mockResolvedValue([{ _id: 'u1', n: 5 }]);

    const res = await listUsersService({ limit: 999 });
    expect(res.limit).toBe(50);
    expect(res.total).toBe(1);
    expect(res.users[0].id).toBe('u1');
    expect(res.users[0].projectCount).toBe(5);
  });

  it('builds a case-insensitive search query', async () => {
    userCount.mockResolvedValue(0);
    userFind.mockReturnValue(chain([]));
    projAgg.mockResolvedValue([]);
    await listUsersService({ search: 'a.b+c', page: 2 });
    const q = userCount.mock.calls[0][0];
    expect(q.$or).toBeDefined();
    expect(q.$or[0].fullName instanceof RegExp).toBe(true);
  });
});

describe('setUserRoleService', () => {
  it('rejects an invalid role', async () => {
    await expect(setUserRoleService('a', 'b', 'superuser')).rejects.toThrow(/user.*admin/i);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('blocks self-demotion', async () => {
    await expect(setUserRoleService('same', 'same', 'user')).rejects.toThrow(/own admin/i);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('promotes a user', async () => {
    userUpdate.mockReturnValue({ select: () => Promise.resolve({ id: 'u2', email: 'u2@x.com', role: 'admin' }) });
    const user = await setUserRoleService('admin1', 'u2', 'admin');
    expect(userUpdate).toHaveBeenCalledWith('u2', { role: 'admin' }, { new: true });
    expect((user as any).role).toBe('admin');
  });

  it('throws when the target user is missing', async () => {
    userUpdate.mockReturnValue({ select: () => Promise.resolve(null) });
    await expect(setUserRoleService('admin1', 'ghost', 'admin')).rejects.toThrow(/not found/i);
  });
});
