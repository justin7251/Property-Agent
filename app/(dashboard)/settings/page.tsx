'use client';

import { type ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import type { CompanySettingsPatch } from '../../../types/companySettings';
import {
  getCompanySettings,
  getCompanyUsersPage,
  inviteUser,
  type CompanyUserRole,
  type CompanyUserSummary,
  updateCompanySettings,
  updateUserRoleServer,
} from '../../../services/firebase';

type FormState = {
  companyName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: string;
};

const INITIAL_FORM: FormState = {
  companyName: '',
  logoUrl: '',
  contactEmail: '',
  contactPhone: '',
  timezone: 'UTC',
  currency: 'USD',
};

const TIMEZONE_OPTIONS = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const TEAM_ROLE_OPTIONS: CompanyUserRole[] = ['owner', 'admin', 'team_lead', 'agent', 'landlord', 'contractor'];

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [teamUsers, setTeamUsers] = useState<CompanyUserSummary[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingMoreTeam, setLoadingMoreTeam] = useState(false);
  const [teamCursor, setTeamCursor] = useState<string | null>(null);
  const [hasMoreTeam, setHasMoreTeam] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyUserRole>('agent');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState('');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = await getCompanySettings();
        if (cancelled) return;
        setForm({
          companyName: settings.companyName,
          logoUrl: settings.logoUrl,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          timezone: settings.timezone,
          currency: settings.currency,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load company settings.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingTeam(true);
      try {
        const users = await getCompanyUsersPage({ pageSize: 25 });
        if (!cancelled) {
          setTeamUsers(users.items);
          setTeamCursor(users.nextCursor);
          setHasMoreTeam(users.hasMore);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load team users.');
        }
      } finally {
        if (!cancelled) setLoadingTeam(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMoreTeamUsers() {
    if (!teamCursor || !hasMoreTeam || loadingMoreTeam) return;
    setLoadingMoreTeam(true);
    try {
      const page = await getCompanyUsersPage({ pageSize: 25, cursor: teamCursor });
      setTeamUsers((prev) => [...prev, ...page.items]);
      setTeamCursor(page.nextCursor);
      setHasMoreTeam(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more team users.');
    } finally {
      setLoadingMoreTeam(false);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const patch: CompanySettingsPatch = {
      companyName: form.companyName,
      logoUrl: form.logoUrl,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      timezone: form.timezone,
      currency: form.currency,
    };

    try {
      await updateCompanySettings(patch);
      setSuccess('Company settings updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company settings.');
    } finally {
      setSaving(false);
    }
  }

  async function onInviteUser() {
    setInviteLoading(true);
    setError(null);
    setSuccess(null);
    setLastInviteUrl('');
    try {
      const invite = await inviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('agent');
      setLastInviteUrl(invite.inviteUrl);
      setSuccess('Invitation created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user.');
    } finally {
      setInviteLoading(false);
    }
  }

  async function onUpdateRole(userId: string, role: CompanyUserRole) {
    setUpdatingRoleId(userId);
    setError(null);
    setSuccess(null);
    try {
      await updateUserRoleServer(userId, role);
      const users = await getCompanyUsersPage({ pageSize: 25 });
      setTeamUsers(users.items);
      setTeamCursor(users.nextCursor);
      setHasMoreTeam(users.hasMore);
      setSuccess('User role updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setUpdatingRoleId(null);
    }
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="300px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Text fontSize="42px" fontWeight="800" mb={2}>Company Settings</Text>
      <Text color="gray.600" mb={4}>
        Configure your company profile, branding, and operational defaults.
      </Text>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={6}>
        {error ? (
          <Box mb={4} p={3} borderRadius="md" bg="#fee2e2" color="#991b1b" border="1px solid #fecaca">
            {error}
          </Box>
        ) : null}
        {success ? (
          <Box mb={4} p={3} borderRadius="md" bg="#dcfce7" color="#166534" border="1px solid #bbf7d0">
            {success}
          </Box>
        ) : null}

        <Flex gap={4} direction={{ base: 'column', md: 'row' }} mb={3}>
          <Box flex="1">
            <Text mb={1}>Company Name</Text>
            <Input value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} placeholder="Acme Properties" />
          </Box>
          <Box flex="1">
            <Text mb={1}>Logo URL</Text>
            <Input value={form.logoUrl} onChange={(e) => setField('logoUrl', e.target.value)} placeholder="https://..." />
          </Box>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', md: 'row' }} mb={3}>
          <Box flex="1">
            <Text mb={1}>Contact Email</Text>
            <Input value={form.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} placeholder="support@company.com" />
          </Box>
          <Box flex="1">
            <Text mb={1}>Contact Phone</Text>
            <Input value={form.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} placeholder="+1 (555) 000-1234" />
          </Box>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Text mb={1}>Timezone</Text>
            <Box
              as="select"
              value={form.timezone}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setField('timezone', e.target.value)}
              style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Box>
          </Box>
          <Box flex="1">
            <Text mb={1}>Currency</Text>
            <Box
              as="select"
              value={form.currency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setField('currency', e.target.value)}
              style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Box>
          </Box>
        </Flex>

        <Flex justify="flex-end" mt={5}>
          <Button colorScheme="blue" onClick={onSave} loading={saving}>
            Save Changes
          </Button>
        </Flex>
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="2xl" p={6} mt={4}>
        <Text fontSize="30px" fontWeight="700" mb={3}>Team Management</Text>
        <Text color="gray.600" mb={4}>Invite users and assign company roles.</Text>

        <Flex gap={3} direction={{ base: 'column', md: 'row' }} mb={5}>
          <Box flex="1">
            <Text mb={1}>Invite Email</Text>
            <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="new.user@company.com" />
          </Box>
          <Box w={{ base: '100%', md: '220px' }}>
            <Text mb={1}>Role</Text>
            <Box
              as="select"
              value={inviteRole}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value as CompanyUserRole)}
              style={{ width: '100%', height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
            >
              {TEAM_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Box>
          </Box>
          <Flex align="end">
            <Button colorScheme="blue" onClick={onInviteUser} loading={inviteLoading}>
              Invite User
            </Button>
          </Flex>
        </Flex>

        {lastInviteUrl ? (
          <Box mb={5}>
            <Text mb={1}>Invite Link</Text>
            <Input value={lastInviteUrl} readOnly />
          </Box>
        ) : null}

        {loadingTeam ? (
          <Spinner />
        ) : (
          <>
            <Box overflowX="auto">
              <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
              <Box as="thead">
                <Box as="tr">
                  {['Name', 'Email', 'Role', 'Action'].map((header) => (
                    <Box key={header} as="th" textAlign="left" py={2} px={2}>
                      <Text fontSize="sm" color="gray.600">{header}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {teamUsers.map((user) => (
                  <Box key={user.id} as="tr">
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{user.name || '-'}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{user.email || '-'}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Box
                        as="select"
                        value={user.role}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdateRole(user.id, e.target.value as CompanyUserRole)}
                        style={{ width: '180px', height: '36px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px' }}
                        disabled={updatingRoleId === user.id}
                      >
                        {TEAM_ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </Box>
                    </Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Text color="gray.500">{updatingRoleId === user.id ? 'Updating...' : 'Ready'}</Text>
                    </Box>
                  </Box>
                ))}
                {teamUsers.length === 0 ? (
                  <Box as="tr">
                    <Box as="td" py={3} px={2} borderTop="1px solid" borderColor="gray.100" colSpan={4}>
                      <Text color="gray.500">No users found for this company.</Text>
                    </Box>
                  </Box>
                ) : null}
              </Box>
              </Box>
            </Box>
            {hasMoreTeam ? (
              <Box mt={4}>
                <Button variant="outline" onClick={loadMoreTeamUsers} loading={loadingMoreTeam}>
                  Load More Team Users
                </Button>
              </Box>
            ) : null}
          </>
        )}
      </Box>
    </Box>
  );
}
