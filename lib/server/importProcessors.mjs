import { parseImportEnvelope, sanitizePropertyImportRow, sanitizeUserImportRow } from './importValidation.mjs';

function canAssignRole(actorRole, targetRole) {
  if (actorRole === 'superadmin') return true;
  if (targetRole === 'superadmin') return false;
  if (actorRole === 'owner') {
    return targetRole === 'admin' || targetRole === 'team_lead' || targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  if (actorRole === 'admin') {
    return targetRole === 'team_lead' || targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  if (actorRole === 'team_lead') {
    return targetRole === 'agent' || targetRole === 'landlord' || targetRole === 'contractor';
  }
  return false;
}

function assertCanAssignRole(actor, targetRole) {
  if (!canAssignRole(actor.role, targetRole)) {
    throw new Error(`Forbidden: cannot assign role ${targetRole}.`);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function getImportAudit(options) {
  const byKeyId = typeof options?.importedByKeyId === 'string' ? options.importedByKeyId.trim() : '';
  if (!byKeyId) return { source: 'api_import', importedByKeyId: null };
  return { source: 'api_key_import', importedByKeyId: byKeyId };
}

export async function processPropertiesImport({ actor, payload, deps }) {
  const envelope = parseImportEnvelope(payload, 200);
  const audit = getImportAudit(payload);
  const key = envelope.idempotencyKey;
  if (key) {
    const existing = await deps.readIdempotentResponse(actor.companyId, 'properties_import', key);
    if (existing) return existing;
  }

  let succeeded = 0;
  const failed = [];
  for (let index = 0; index < envelope.rows.length; index += 1) {
    const row = envelope.rows[index];
    const parsed = sanitizePropertyImportRow(row);
    if (!parsed.ok) {
      failed.push({ index, error: parsed.error });
      continue;
    }

    try {
      const agent = await deps.getDoc('agents', parsed.value.agentId);
      if (!agent.exists || agent.data.companyId !== actor.companyId) throw new Error('agents record not found.');
      const landlord = await deps.getDoc('landlords', parsed.value.landlordId);
      if (!landlord.exists || landlord.data.companyId !== actor.companyId) throw new Error('landlords record not found.');

      const rowObj = row && typeof row === 'object' ? row : {};
      const recordId = typeof rowObj.id === 'string' ? rowObj.id.trim() : '';
      const now = nowIso();
      if (recordId) {
        const existing = await deps.getDoc('properties', recordId);
        if (existing.exists) {
          if (!actor.isPlatformSuperadmin && existing.data.companyId !== actor.companyId) {
            throw new Error('Cross-company property update is forbidden.');
          }
          await deps.updateDoc('properties', recordId, {
            ...parsed.value,
            companyId: actor.companyId,
            updatedAt: now,
            updatedBy: actor.userId,
            source: audit.source,
            importedByKeyId: audit.importedByKeyId || undefined,
          });
        } else {
          await deps.setDoc('properties', recordId, {
            ...parsed.value,
            companyId: actor.companyId,
            createdAt: parsed.value.createdAt || now,
            updatedAt: now,
            updatedBy: actor.userId,
            source: audit.source,
            importedByKeyId: audit.importedByKeyId || undefined,
          });
        }
      } else {
        await deps.addDoc('properties', {
          ...parsed.value,
          companyId: actor.companyId,
          createdAt: parsed.value.createdAt || now,
          updatedAt: now,
          updatedBy: actor.userId,
          source: audit.source,
          importedByKeyId: audit.importedByKeyId || undefined,
        });
      }
      succeeded += 1;
    } catch (error) {
      failed.push({
        index,
        id: typeof row?.id === 'string' ? row.id : undefined,
        error: error instanceof Error ? error.message : 'Failed to import property row.',
      });
    }
  }

  const result = {
    accepted: envelope.rows.length,
    processed: envelope.rows.length,
    succeeded,
    failed,
  };

  if (key) {
    await deps.writeIdempotentResponse(actor.companyId, actor.userId, 'properties_import', key, 200, result);
  }
  return { status: 200, payload: result };
}

export async function processUsersImport({ actor, payload, deps }) {
  const envelope = parseImportEnvelope(payload, 200);
  const audit = getImportAudit(payload);
  const key = envelope.idempotencyKey;
  if (key) {
    const existing = await deps.readIdempotentResponse(actor.companyId, 'users_import', key);
    if (existing) return existing;
  }

  let succeeded = 0;
  const failed = [];
  for (let index = 0; index < envelope.rows.length; index += 1) {
    const row = envelope.rows[index];
    const parsed = sanitizeUserImportRow(row);
    if (!parsed.ok) {
      failed.push({ index, error: parsed.error });
      continue;
    }

    try {
      assertCanAssignRole(actor, parsed.value.role);
      const now = nowIso();
      const recordId = parsed.value.uid || deps.newId('users');
      const existing = await deps.getDoc('users', recordId);
      if (existing.exists) {
        if (!actor.isPlatformSuperadmin && existing.data.companyId !== actor.companyId) {
          throw new Error('Cross-company user update is forbidden.');
        }
        if (existing.data.role === 'superadmin') {
          throw new Error('Cannot modify superadmin via import.');
        }
        await deps.setDoc(
          'users',
          recordId,
          {
            uid: recordId,
            name: parsed.value.name,
            email: parsed.value.email,
            role: parsed.value.role,
            companyId: actor.companyId,
            updatedAt: now,
            updatedBy: actor.userId,
            source: audit.source,
            importedByKeyId: audit.importedByKeyId || undefined,
          },
          { merge: true }
        );
      } else {
        await deps.setDoc('users', recordId, {
          uid: recordId,
          name: parsed.value.name,
          email: parsed.value.email,
          role: parsed.value.role,
          companyId: actor.companyId,
          createdAt: now,
          updatedAt: now,
          updatedBy: actor.userId,
          source: audit.source,
          importedByKeyId: audit.importedByKeyId || undefined,
        });
      }
      succeeded += 1;
    } catch (error) {
      failed.push({
        index,
        id: parsed.value.uid || undefined,
        error: error instanceof Error ? error.message : 'Failed to import user row.',
      });
    }
  }

  const result = {
    accepted: envelope.rows.length,
    processed: envelope.rows.length,
    succeeded,
    failed,
  };

  if (key) {
    await deps.writeIdempotentResponse(actor.companyId, actor.userId, 'users_import', key, 200, result);
  }
  return { status: 200, payload: result };
}
