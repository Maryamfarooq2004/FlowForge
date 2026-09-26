import React, { useState } from 'react';
import { PreviewThemeProvider } from './theme';
import { PreviewSidebar } from './PreviewSidebar';
import { PreviewDashboard } from './PreviewDashboard';
import { PreviewEntityList } from './PreviewEntityList';
import { PreviewRecordForm } from './PreviewRecordForm';
import { PreviewRecordDetail } from './PreviewRecordDetail';
import { useCreateRecord, useUpdateRecord, useDeleteRecord, useTransitionRecord } from '../../../hooks/usePreview';
import type { PreviewState, PreviewRecord } from '../../../types/preview.types';

type Screen = 'dashboard' | 'list' | 'create' | 'edit' | 'detail';
interface View {
  screen: Screen;
  entityKey?: string;
  recordId?: string;
}

export const PreviewRuntime: React.FC<{ projectId: string; state: PreviewState }> = ({ projectId, state }) => {
  const { meta, records, activeRoleKey } = state;
  const [view, setView] = useState<View>({ screen: 'dashboard' });

  const create = useCreateRecord(projectId);
  const update = useUpdateRecord(projectId);
  const remove = useDeleteRecord(projectId);
  const transition = useTransitionRecord(projectId);

  const entity = view.entityKey ? meta.entities.find((e) => e.key === view.entityKey) : undefined;
  const record = entity && view.recordId ? (records[entity.key] ?? []).find((r) => r.id === view.recordId) : undefined;
  const activeRoleName = meta.roles.find((r) => r.key === activeRoleKey)?.name ?? activeRoleKey;

  const goList = (key: string) => setView({ screen: 'list', entityKey: key });

  const submitCreate = async (data: Record<string, any>) => {
    if (!entity) return;
    try {
      await create.mutateAsync({ entityKey: entity.key, data });
      goList(entity.key);
    } catch { /* toasted by hook */ }
  };
  const submitEdit = async (data: Record<string, any>) => {
    if (!entity || !record) return;
    try {
      await update.mutateAsync({ entityKey: entity.key, recordId: record.id, data });
      setView({ screen: 'detail', entityKey: entity.key, recordId: record.id });
    } catch { /* toasted */ }
  };
  const doDelete = (r: PreviewRecord) => {
    if (!entity) return;
    if (window.confirm('Delete this record?')) remove.mutate({ entityKey: entity.key, recordId: r.id });
  };
  const doTransition = (to: string) => {
    if (!entity || !record) return;
    transition.mutate({ entityKey: entity.key, recordId: record.id, to });
  };

  const renderMain = () => {
    if (view.screen === 'dashboard' || !entity) {
      return <PreviewDashboard meta={meta} records={records} activeRoleName={activeRoleName} onOpenEntity={goList} />;
    }
    if (view.screen === 'create') {
      return (
        <PreviewRecordForm
          entity={entity}
          meta={meta}
          records={records}
          submitting={create.isPending}
          onCancel={() => goList(entity.key)}
          onSubmit={submitCreate}
        />
      );
    }
    if (view.screen === 'edit' && record) {
      return (
        <PreviewRecordForm
          entity={entity}
          meta={meta}
          records={records}
          initial={record}
          submitting={update.isPending}
          onCancel={() => setView({ screen: 'detail', entityKey: entity.key, recordId: record.id })}
          onSubmit={submitEdit}
        />
      );
    }
    if (view.screen === 'detail' && record) {
      return (
        <PreviewRecordDetail
          entity={entity}
          meta={meta}
          records={records}
          record={record}
          activeRoleKey={activeRoleKey}
          transitioning={transition.isPending}
          onBack={() => goList(entity.key)}
          onEdit={() => setView({ screen: 'edit', entityKey: entity.key, recordId: record.id })}
          onTransition={doTransition}
          onOpenRelated={(ek, rid) => setView({ screen: 'detail', entityKey: ek, recordId: rid })}
        />
      );
    }
    // list (default when an entity is selected)
    return (
      <PreviewEntityList
        entity={entity}
        meta={meta}
        records={records}
        onNew={() => setView({ screen: 'create', entityKey: entity.key })}
        onView={(r) => setView({ screen: 'detail', entityKey: entity.key, recordId: r.id })}
        onEdit={(r) => setView({ screen: 'edit', entityKey: entity.key, recordId: r.id })}
        onDelete={doDelete}
      />
    );
  };

  return (
    <PreviewThemeProvider value={meta.theme}>
      <div className="flex h-full bg-[#F8FAFC]" style={{ fontFamily: meta.theme.fonts.body }}>
        <PreviewSidebar
          meta={meta}
          records={records}
          screen={view.screen}
          entityKey={view.entityKey}
          onDashboard={() => setView({ screen: 'dashboard' })}
          onEntity={goList}
        />
        <main className="flex-1 overflow-y-auto p-8">{renderMain()}</main>
      </div>
    </PreviewThemeProvider>
  );
};
