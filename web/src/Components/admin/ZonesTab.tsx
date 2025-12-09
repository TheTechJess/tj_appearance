import { FC } from 'react';
import { Stack, Group, Text, Button, Select, Box, Badge, ActionIcon } from '@mantine/core';
import { IconPlus, IconChevronDown, IconTrash } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface Zone {
  id?: number;
  type: 'clothing' | 'barber' | 'tattoo' | 'surgeon';
  coords: { x: number; y: number; z: number; heading?: number };
  polyzone?: { x: number; y: number }[];
  showBlip: boolean;
  job?: string;
  gang?: string;
  name?: string;
}

interface ZonesTabProps {
  zones: Zone[];
  setZones: (zones: Zone[]) => void;
  newZoneType: Zone['type'];
  setNewZoneType: (type: Zone['type']) => void;
  setEditingZone: (zone: Zone | null) => void;
  setPolyzonePointsInput: (input: string) => void;
  setAddZoneModalOpen: (open: boolean) => void;
}

export const ZonesTab: FC<ZonesTabProps> = ({
  zones,
  setZones,
  newZoneType,
  setNewZoneType,
  setEditingZone,
  setPolyzonePointsInput,
  setAddZoneModalOpen,
}) => {
  return (
    <Stack spacing="lg">
      <Group position="apart">
        <Text c="white" fw={500}>
          Appearance Zones
        </Text>
        <Group>
          <Select
            value={newZoneType}
            onChange={(v) => setNewZoneType((v as Zone['type']) || 'clothing')}
            data={[
              { value: 'clothing', label: 'Clothing' },
              { value: 'barber', label: 'Barber' },
              { value: 'tattoo', label: 'Tattoo' },
              { value: 'surgeon', label: 'Surgeon' },
            ]}
            placeholder="Select zone type"
          />
          <Button onClick={() => {
            setEditingZone({
              type: newZoneType,
              coords: { x: 0, y: 0, z: 0, heading: 0 },
              showBlip: true
            });
            setAddZoneModalOpen(true);
          }}>
            <IconPlus size={16} style={{ marginRight: 8 }} />
            Add Zone
          </Button>
        </Group>
      </Group>

      {zones.length === 0 ? (
        <Box style={{ padding: '2rem', textAlign: 'center', color: '#888', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          No zones configured
        </Box>
      ) : (
        <Stack spacing="xs">
          {zones.map((zone, idx) => (
            <Group
              key={zone.id || idx}
              position="apart"
              style={{
                padding: '1rem',
                backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div>
                <Group spacing="sm" mb={4}>
                  <Badge size="sm" color="blue" variant="light" tt="capitalize">
                    {zone.type}
                  </Badge>
                  {zone.job && <Badge size="xs" color="green">Job: {zone.job}</Badge>}
                  {zone.gang && <Badge size="xs" color="purple">Gang: {zone.gang}</Badge>}
                  {!zone.showBlip && <Badge size="xs" color="gray">Blip Hidden</Badge>}
                </Group>
                <Text c="white" size="sm">
                  {zone.name || 'Unnamed Zone'}
                </Text>
                <Text c="dimmed" size="xs">
                  Coords: {zone.coords.x.toFixed(2)}, {zone.coords.y.toFixed(2)}, {zone.coords.z.toFixed(2)}
                  {zone.polyzone && ` • ${zone.polyzone.length} polyzone points`}
                </Text>
              </div>
              <Group>
                <ActionIcon 
                  color="blue"
                  onClick={() => {
                    setEditingZone(zone);
                    setPolyzonePointsInput(zone.polyzone ? JSON.stringify(zone.polyzone) : '');
                    setAddZoneModalOpen(true);
                  }}
                >
                  <IconChevronDown size={16} />
                </ActionIcon>
                <ActionIcon 
                  color="red"
                  onClick={() => {
                    TriggerNuiCallback('deleteZone', zone.id).then(() => {
                      setZones(zones.filter(z => z.id !== zone.id));
                    });
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
