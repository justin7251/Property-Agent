import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import {
  LuBell,
  LuChartBar,
  LuChevronDown,
  LuHouse,
  LuLayoutDashboard,
  LuLogOut,
  LuMail,
  LuMessageSquare,
  LuSettings,
  LuUsers,
} from 'react-icons/lu';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { key: 'properties', label: 'Properties', icon: LuHouse },
  { key: 'inquiries', label: 'Inquiries', icon: LuMessageSquare },
  { key: 'agents', label: 'Agents', icon: LuUsers },
  { key: 'reports', label: 'Reports', icon: LuChartBar },
  { key: 'settings', label: 'Settings', icon: LuSettings },
];

const INITIAL_PROPERTIES = [
  { id: 1, title: 'Luxury Condo', city: 'Downtown', price: 2500, beds: 2, status: 'Available', agent: 'Sarah Johnson' },
  { id: 2, title: 'Skyline Apartment', city: 'Midtown', price: 2200, beds: 1, status: 'Occupied', agent: 'Michael Chen' },
  { id: 3, title: 'Riverside Loft', city: 'Downtown', price: 3100, beds: 3, status: 'Available', agent: 'Joy Hudson' },
  { id: 4, title: 'Elm Townhouse', city: 'Uptown', price: 2800, beds: 2, status: 'Maintenance', agent: 'Maila Luson' },
];

const INITIAL_INQUIRIES = [
  { id: 1, client: 'Sarah Johnson', type: 'Lead', status: 'New', priority: 'Normal', message: 'Can I schedule a tour this week?' },
  { id: 2, client: 'Michael Chen', type: 'Maintenance', status: 'In Progress', priority: 'High', message: 'Water leak in kitchen sink.' },
  { id: 3, client: 'Lucia Tiide', type: 'Lead', status: 'New', priority: 'Normal', message: 'Is parking included?' },
  { id: 4, client: 'Data K Plea', type: 'Maintenance', status: 'Resolved', priority: 'Critical', message: 'Power outage in unit 12B.' },
];

const INITIAL_AGENTS = [
  { id: 1, name: 'Sarah Johnson', region: 'Downtown', active: true, leadsClosed: 12, responseTime: '11m' },
  { id: 2, name: 'Michael Chen', region: 'Midtown', active: true, leadsClosed: 9, responseTime: '14m' },
  { id: 3, name: 'Joy Hudson', region: 'Uptown', active: false, leadsClosed: 7, responseTime: '21m' },
  { id: 4, name: 'Maila Luson', region: 'Downtown', active: true, leadsClosed: 10, responseTime: '9m' },
];

function Initials({ name }) {
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Box
      w="32px"
      h="32px"
      borderRadius="full"
      bg="blue.100"
      color="blue.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="12px"
      fontWeight="700"
      flexShrink={0}
    >
      {initials}
    </Box>
  );
}

function Pill({ children, bg = '#EFF6FF', color = '#1D4ED8' }) {
  return (
    <Box as="span" px={2.5} py={1} borderRadius="full" fontSize="12px" bg={bg} color={color} border="1px solid rgba(0,0,0,0.06)">
      {children}
    </Box>
  );
}

export default function AgentDashboard() {
  const router = useRouter();
  const [section, setSection] = useState('dashboard');

  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('All');

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [inquiryFilter, setInquiryFilter] = useState('All');

  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [agentRegion, setAgentRegion] = useState('All');
  const [reportRange, setReportRange] = useState('30d');
  const [settings, setSettings] = useState({
    realtimeSync: true,
    aiTriage: true,
    autoReply: false,
    emailAlerts: true,
    weeklyDigest: true,
    theme: 'Light',
  });

  const filteredProperties = useMemo(
    () =>
      properties.filter((p) => {
        const matchSearch = `${p.title} ${p.city} ${p.agent}`.toLowerCase().includes(propertySearch.toLowerCase());
        const matchFilter = propertyFilter === 'All' || p.status === propertyFilter;
        return matchSearch && matchFilter;
      }),
    [properties, propertySearch, propertyFilter]
  );

  const filteredInquiries = useMemo(
    () => inquiries.filter((i) => (inquiryFilter === 'All' ? true : i.status === inquiryFilter)),
    [inquiries, inquiryFilter]
  );

  const filteredAgents = useMemo(
    () => agents.filter((a) => (agentRegion === 'All' ? true : a.region === agentRegion)),
    [agents, agentRegion]
  );

  const availableUnits = properties.filter((p) => p.status === 'Available').length;
  const totalRevenue = properties.reduce((sum, p) => sum + p.price, 0);
  const totalClients = inquiries.length + 8492;

  function togglePropertyStatus(id) {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.status === 'Available') return { ...p, status: 'Occupied' };
        if (p.status === 'Occupied') return { ...p, status: 'Maintenance' };
        return { ...p, status: 'Available' };
      })
    );
  }

  function updateInquiryStatus(id, nextStatus) {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: nextStatus } : i)));
  }

  function toggleAgentActive(id) {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }

  function renderDashboard() {
    return (
      <>
        <Flex align="center" justify="space-between" mb={4}>
          <Text fontSize="20px" fontWeight="700">
            Properties Overview
          </Text>
          <Button size="sm" variant="outline">
            All months <Icon as={LuChevronDown} />
          </Button>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mb={4}>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
            <Text fontSize="sm" color="gray.500">Available Units</Text>
            <Text fontSize="32px" fontWeight="700">{availableUnits}</Text>
          </Box>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
            <Text fontSize="sm" color="gray.500">Revenue</Text>
            <Text fontSize="32px" fontWeight="700">${(totalRevenue / 1000).toFixed(1)}k</Text>
          </Box>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
            <Text fontSize="sm" color="gray.500">Total Clients</Text>
            <Text fontSize="32px" fontWeight="700">{totalClients.toLocaleString()}</Text>
          </Box>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', xl: 'row' }}>
          <Box flex="1.1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} minH="260px">
            <Text fontWeight="700" mb={3}>Map Snapshot</Text>
            <Box h="220px" borderRadius="lg" bg="linear-gradient(135deg,#E2E8F0,#CBD5E1)" />
          </Box>
          <Box flex="1.4" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
            <Text fontWeight="700" mb={3}>Recent Inquiries</Text>
            <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
              <Box as="thead">
                <Box as="tr">
                  <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Client</Box>
                  <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Type</Box>
                  <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Status</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {inquiries.slice(0, 5).map((item) => (
                  <Box as="tr" key={item.id}>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{item.client}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{item.type}</Box>
                    <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                      <Pill>{item.status}</Pill>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Flex>
      </>
    );
  }

  function renderProperties() {
    return (
      <>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
          <Text fontSize="22px" fontWeight="700">Properties</Text>
          <Flex gap={2} w={{ base: '100%', md: 'auto' }}>
            <Box
              as="input"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Search title, city, agent"
              px={3}
              py={2}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              minW={{ md: '260px' }}
              w="100%"
            />
            <Box
              as="select"
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              px={3}
              py={2}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <option>All</option>
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </Box>
          </Flex>
        </Flex>

        <Flex direction="column" gap={3}>
          {filteredProperties.map((p) => (
            <Flex key={p.id} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} justify="space-between" align="center" wrap="wrap" gap={3}>
              <Box>
                <Text fontWeight="700">{p.title} - {p.city}</Text>
                <Text fontSize="sm" color="gray.600">${p.price}/mo • {p.beds} beds • Agent: {p.agent}</Text>
              </Box>
              <Flex align="center" gap={2}>
                <Pill bg={p.status === 'Available' ? '#ECFDF5' : p.status === 'Occupied' ? '#EFF6FF' : '#FFF7ED'} color={p.status === 'Available' ? '#047857' : p.status === 'Occupied' ? '#1D4ED8' : '#C2410C'}>
                  {p.status}
                </Pill>
                <Button size="sm" variant="outline" onClick={() => togglePropertyStatus(p.id)}>Cycle Status</Button>
              </Flex>
            </Flex>
          ))}
          {filteredProperties.length === 0 && <Text color="gray.500">No properties match the current filters.</Text>}
        </Flex>
      </>
    );
  }

  function renderInquiries() {
    return (
      <>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
          <Text fontSize="22px" fontWeight="700">Inquiries</Text>
          <Box
            as="select"
            value={inquiryFilter}
            onChange={(e) => setInquiryFilter(e.target.value)}
            px={3}
            py={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <option>All</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </Box>
        </Flex>

        <Flex direction="column" gap={3}>
          {filteredInquiries.map((i) => (
            <Box key={i.id} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
              <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
                <Box>
                  <Text fontWeight="700">{i.client}</Text>
                  <Text fontSize="sm" color="gray.600">{i.type} • Priority: {i.priority}</Text>
                  <Text mt={1}>{i.message}</Text>
                </Box>
                <Flex gap={2} align="center">
                  <Pill bg={i.status === 'Resolved' ? '#ECFDF5' : '#EFF6FF'} color={i.status === 'Resolved' ? '#047857' : '#1D4ED8'}>
                    {i.status}
                  </Pill>
                  <Button size="sm" variant="outline" onClick={() => updateInquiryStatus(i.id, 'In Progress')}>Start</Button>
                  <Button size="sm" onClick={() => updateInquiryStatus(i.id, 'Resolved')}>Resolve</Button>
                </Flex>
              </Flex>
            </Box>
          ))}
          {filteredInquiries.length === 0 && <Text color="gray.500">No inquiries for this status.</Text>}
        </Flex>
      </>
    );
  }

  function renderAgents() {
    const activeCount = agents.filter((a) => a.active).length;
    return (
      <>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
          <Box>
            <Text fontSize="22px" fontWeight="700">Agents</Text>
            <Text color="gray.600">{activeCount} active of {agents.length}</Text>
          </Box>
          <Box
            as="select"
            value={agentRegion}
            onChange={(e) => setAgentRegion(e.target.value)}
            px={3}
            py={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <option>All</option>
            <option>Downtown</option>
            <option>Midtown</option>
            <option>Uptown</option>
          </Box>
        </Flex>

        <Flex direction="column" gap={3}>
          {filteredAgents.map((a) => (
            <Flex key={a.id} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} justify="space-between" align="center" wrap="wrap" gap={3}>
              <Flex align="center" gap={3}>
                <Initials name={a.name} />
                <Box>
                  <Text fontWeight="700">{a.name}</Text>
                  <Text fontSize="sm" color="gray.600">{a.region} • {a.leadsClosed} deals • {a.responseTime} avg response</Text>
                </Box>
              </Flex>
              <Flex align="center" gap={2}>
                <Pill bg={a.active ? '#ECFDF5' : '#FEF2F2'} color={a.active ? '#047857' : '#B91C1C'}>
                  {a.active ? 'Active' : 'Inactive'}
                </Pill>
                <Button size="sm" variant="outline" onClick={() => toggleAgentActive(a.id)}>
                  {a.active ? 'Deactivate' : 'Activate'}
                </Button>
              </Flex>
            </Flex>
          ))}
          {filteredAgents.length === 0 && <Text color="gray.500">No agents in this region.</Text>}
        </Flex>
      </>
    );
  }

  function renderContent() {
    if (section === 'properties') return renderProperties();
    if (section === 'inquiries') return renderInquiries();
    if (section === 'agents') return renderAgents();
    if (section === 'reports') return renderReports();
    if (section === 'settings') return renderSettings();
    return renderDashboard();
  }

  function logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('propestate_auth');
    }
    router.push('/login');
  }

  function renderReports() {
    const closedDeals = agents.reduce((sum, a) => sum + a.leadsClosed, 0);
    const activeAgents = agents.filter((a) => a.active).length;
    const openInquiries = inquiries.filter((i) => i.status !== 'Resolved').length;
    const avgRent = Math.round(properties.reduce((sum, p) => sum + p.price, 0) / Math.max(1, properties.length));

    const multiplier = reportRange === '7d' ? 0.35 : reportRange === '90d' ? 2.8 : 1;
    const projectedRevenue = Math.round(avgRent * closedDeals * multiplier);

    return (
      <>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
          <Text fontSize="22px" fontWeight="700">Reports</Text>
          <Box
            as="select"
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            px={3}
            py={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Box>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mb={4}>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
            <Text fontSize="sm" color="gray.500">Closed Deals</Text>
            <Text fontSize="30px" fontWeight="700">{Math.round(closedDeals * multiplier)}</Text>
          </Box>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
            <Text fontSize="sm" color="gray.500">Projected Revenue</Text>
            <Text fontSize="30px" fontWeight="700">${projectedRevenue.toLocaleString()}</Text>
          </Box>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
            <Text fontSize="sm" color="gray.500">Open Inquiries</Text>
            <Text fontSize="30px" fontWeight="700">{openInquiries}</Text>
          </Box>
          <Box flex="1" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
            <Text fontSize="sm" color="gray.500">Active Agents</Text>
            <Text fontSize="30px" fontWeight="700">{activeAgents}</Text>
          </Box>
        </Flex>

        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
          <Text fontWeight="700" mb={3}>Team Performance</Text>
          <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
            <Box as="thead">
              <Box as="tr">
                <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Agent</Box>
                <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Region</Box>
                <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Deals</Box>
                <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Avg Response</Box>
                <Box as="th" textAlign="left" py={2} px={2} fontSize="12px" color="gray.500">Status</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {agents.map((a) => (
                <Box as="tr" key={a.id}>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{a.name}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{a.region}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{Math.round(a.leadsClosed * multiplier)}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">{a.responseTime}</Box>
                  <Box as="td" py={2} px={2} borderTop="1px solid" borderColor="gray.100">
                    <Pill bg={a.active ? '#ECFDF5' : '#FEF2F2'} color={a.active ? '#047857' : '#B91C1C'}>
                      {a.active ? 'Active' : 'Inactive'}
                    </Pill>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  function toggleSetting(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderSettings() {
    return (
      <>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
          <Text fontSize="22px" fontWeight="700">Settings</Text>
          <Button size="sm">Save Changes</Button>
        </Flex>

        <Flex direction="column" gap={3}>
          {[
            { key: 'realtimeSync', label: 'Real-time Sync', desc: 'Keep properties, inquiries, and agents synchronized live.' },
            { key: 'aiTriage', label: 'AI Maintenance Triage', desc: 'Classify maintenance messages with urgency and summary.' },
            { key: 'autoReply', label: 'Auto Draft Replies', desc: 'Generate contextual reply drafts for leads and maintenance.' },
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notification emails for high-priority events.' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Send weekly KPI summary to management.' },
          ].map((item) => (
            <Flex key={item.key} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} justify="space-between" align="center" wrap="wrap" gap={3}>
              <Box>
                <Text fontWeight="700">{item.label}</Text>
                <Text fontSize="sm" color="gray.600">{item.desc}</Text>
              </Box>
              <Button size="sm" variant={settings[item.key] ? 'solid' : 'outline'} onClick={() => toggleSetting(item.key)}>
                {settings[item.key] ? 'Enabled' : 'Disabled'}
              </Button>
            </Flex>
          ))}

          <Flex bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Text fontWeight="700">Theme</Text>
              <Text fontSize="sm" color="gray.600">Switch between light and dark appearance presets.</Text>
            </Box>
            <Box
              as="select"
              value={settings.theme}
              onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
              px={3}
              py={2}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <option>Light</option>
              <option>Dark</option>
            </Box>
          </Flex>
        </Flex>
      </>
    );
  }

  return (
    <Flex minH="100vh" bg="#F4F7FB">
      <Box
        w={{ base: '86px', md: '210px' }}
        minH="100vh"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.100"
        display="flex"
        flexDir="column"
        py={6}
        px={{ base: 2, md: 4 }}
        gap={1}
        flexShrink={0}
      >
        {NAV_ITEMS.map((item) => {
          const active = section === item.key;
          return (
            <Button
              key={item.key}
              onClick={() => setSection(item.key)}
              justifyContent={{ base: 'center', md: 'start' }}
              leftIcon={<Icon as={item.icon} />}
              variant={active ? 'solid' : 'ghost'}
              colorScheme={active ? 'blue' : 'gray'}
              fontSize="sm"
              borderRadius="xl"
              h="44px"
            >
              <Box display={{ base: 'none', md: 'block' }}>{item.label}</Box>
            </Button>
          );
        })}
        <Box flex="1" />
        <Button
          justifyContent={{ base: 'center', md: 'start' }}
          leftIcon={<Icon as={LuLogOut} />}
          variant="ghost"
          borderRadius="xl"
          onClick={logout}
        >
          <Box display={{ base: 'none', md: 'block' }}>Logout</Box>
        </Button>
      </Box>

      <Box flex="1" p={{ base: 4, md: 6 }}>
        <Flex align="center" justify="space-between" mb={5}>
          <Text fontSize="34px" fontWeight="800" letterSpacing="-0.5px">
            Dashboard
          </Text>
          <Flex align="center" gap={3}>
            <Icon as={LuMail} boxSize={5} color="gray.500" />
            <Icon as={LuBell} boxSize={5} color="gray.500" />
            <Flex align="center" gap={2}>
              <Initials name="Admin User" />
              <Icon as={LuChevronDown} boxSize={4} color="gray.500" />
            </Flex>
          </Flex>
        </Flex>
        {renderContent()}
      </Box>
    </Flex>
  );
}
