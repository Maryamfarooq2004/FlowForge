import { NotificationType } from '../../models/Notification.model';

// ── Mock the Mongoose models + email transport (no live DB; repo convention) ──
jest.mock('../../models/Notification.model', () => ({
  Notification: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}));
jest.mock('../../models/Project.model', () => ({ Project: { findById: jest.fn() } }));
jest.mock('../../models/User.model', () => ({ User: { findById: jest.fn() } }));
jest.mock('../email.service', () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
  getFrontendUrl: () => 'http://localhost:5173',
}));

import {
  buildNotificationCopy,
  createNotification,
  notifyProjectOwner,
  listNotifications,
} from '../notification.service';
import { Notification } from '../../models/Notification.model';
import { Project } from '../../models/Project.model';
import { User } from '../../models/User.model';
import { sendNotificationEmail } from '../email.service';

const create = Notification.create as jest.Mock;
const find = Notification.find as jest.Mock;
const projectFindById = Project.findById as jest.Mock;
const userFindById = User.findById as jest.Mock;
const emailMock = sendNotificationEmail as jest.Mock;

const chainLean = (value: unknown) => ({ select: () => ({ lean: () => Promise.resolve(value) }) });

const ALL_TYPES: NotificationType[] = [
  'SPEC_READY', 'SPEC_APPROVED', 'GENERATION_STARTED', 'GENERATION_COMPLETED',
  'GENERATION_FAILED', 'EXPORT_READY', 'DEPLOY_LIVE',
];

beforeEach(() => {
  jest.clearAllMocks();
  // Default: create returns a fresh mutable doc; email resolves.
  create.mockImplementation(() => Promise.resolve({ emailStatus: 'none', save: jest.fn().mockResolvedValue(undefined) }));
  emailMock.mockResolvedValue(undefined);
});

describe('buildNotificationCopy', () => {
  it.each(ALL_TYPES)('produces valid copy for %s', (type) => {
    const copy = buildNotificationCopy(type, 'Al Shifa', 'p123');
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.body).toContain('Al Shifa');
    expect(copy.link.startsWith('/project/p123/')).toBe(true);
    expect(['in-app', 'email', 'both']).toContain(copy.channel);
  });

  it('emails on the milestone events, in-app only otherwise', () => {
    const both = ['GENERATION_COMPLETED', 'GENERATION_FAILED', 'DEPLOY_LIVE'] as NotificationType[];
    for (const t of ALL_TYPES) {
      expect(buildNotificationCopy(t, 'X', 'p').channel).toBe(both.includes(t) ? 'both' : 'in-app');
    }
  });
});

describe('createNotification', () => {
  it('creates an in-app notification and sends NO email', async () => {
    await createNotification({ userId: 'u1', type: 'SPEC_READY', title: 'T', body: 'B', channel: 'in-app' });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({ userId: 'u1', type: 'SPEC_READY', channel: 'in-app', emailStatus: 'none' });
    expect(emailMock).not.toHaveBeenCalled();
  });

  it('sends an email and marks emailStatus sent for a both-channel notification', async () => {
    userFindById.mockReturnValue(chainLean({ email: 'u@e.com' }));
    const doc: any = { emailStatus: 'none', save: jest.fn().mockResolvedValue(undefined) };
    create.mockResolvedValueOnce(doc);

    await createNotification({ userId: 'u1', type: 'GENERATION_COMPLETED', title: 'Done', body: 'Ready', link: '/project/p/artifacts', channel: 'both' });

    expect(emailMock).toHaveBeenCalledTimes(1);
    expect(emailMock.mock.calls[0][0]).toBe('u@e.com');
    expect(emailMock.mock.calls[0][1]).toMatchObject({ title: 'Done', body: 'Ready', actionUrl: 'http://localhost:5173/project/p/artifacts' });
    expect(doc.emailStatus).toBe('sent');
    expect(doc.save).toHaveBeenCalled();
  });

  it('marks emailStatus failed when the email throws — and never rethrows', async () => {
    userFindById.mockReturnValue(chainLean({ email: 'u@e.com' }));
    const doc: any = { emailStatus: 'none', save: jest.fn().mockResolvedValue(undefined) };
    create.mockResolvedValueOnce(doc);
    emailMock.mockRejectedValueOnce(new Error('smtp down'));

    await expect(
      createNotification({ userId: 'u1', type: 'DEPLOY_LIVE', title: 'Live', body: 'Up', channel: 'both' })
    ).resolves.toBeUndefined();
    expect(doc.emailStatus).toBe('failed');
  });

  it('skips email when the user has no address', async () => {
    userFindById.mockReturnValue(chainLean(null));
    await createNotification({ userId: 'ghost', type: 'DEPLOY_LIVE', title: 'L', body: 'B', channel: 'both' });
    expect(emailMock).not.toHaveBeenCalled();
  });

  it('never throws even if the DB write rejects', async () => {
    create.mockRejectedValueOnce(new Error('mongo down'));
    await expect(
      createNotification({ userId: 'u1', type: 'SPEC_READY', title: 'T', body: 'B' })
    ).resolves.toBeUndefined();
  });
});

describe('notifyProjectOwner', () => {
  it('resolves the owner + name and creates a notification with standard copy', async () => {
    projectFindById.mockReturnValue(chainLean({ userId: 'owner1', name: 'My Clinic' }));
    await notifyProjectOwner('p123', 'SPEC_APPROVED');

    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0][0];
    expect(arg).toMatchObject({ userId: 'owner1', projectId: 'p123', type: 'SPEC_APPROVED', channel: 'in-app' });
    expect(arg.body).toContain('My Clinic');
    expect(arg.link).toBe('/project/p123/alerts');
  });

  it('does nothing (no create) when the project is missing', async () => {
    projectFindById.mockReturnValue(chainLean(null));
    await notifyProjectOwner('missing', 'GENERATION_COMPLETED');
    expect(create).not.toHaveBeenCalled();
  });

  it('honors a channel override', async () => {
    projectFindById.mockReturnValue(chainLean({ userId: 'owner1', name: 'X' }));
    userFindById.mockReturnValue(chainLean({ email: 'u@e.com' }));
    await notifyProjectOwner('p1', 'SPEC_READY', { channelOverride: 'both' });
    expect(create.mock.calls[0][0].channel).toBe('both');
  });
});

describe('listNotifications', () => {
  let capturedLimit = 0;
  let capturedQuery: any = null;
  beforeEach(() => {
    find.mockImplementation((q: any) => {
      capturedQuery = q;
      return { sort: () => ({ limit: (n: number) => { capturedLimit = n; return Promise.resolve([]); } }) };
    });
  });

  it('clamps the limit to [1, 50]', async () => {
    await listNotifications('u1', { limit: 999 });
    expect(capturedLimit).toBe(50);
    await listNotifications('u1', { limit: 0 });
    expect(capturedLimit).toBe(1);
    await listNotifications('u1');
    expect(capturedLimit).toBe(20);
  });

  it('scopes to the user and applies a valid before-cursor', async () => {
    await listNotifications('u1', { before: '2026-01-01T00:00:00.000Z' });
    expect(capturedQuery.userId).toBe('u1');
    expect(capturedQuery.createdAt.$lt instanceof Date).toBe(true);
  });

  it('ignores an invalid before-cursor', async () => {
    await listNotifications('u1', { before: 'not-a-date' });
    expect(capturedQuery.createdAt).toBeUndefined();
  });
});
