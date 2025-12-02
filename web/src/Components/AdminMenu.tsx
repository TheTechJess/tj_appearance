import { FC, useEffect, useState } from 'react';
import { Tabs, ColorPicker, Button, Stack, Group, Text, TextInput, Select, ActionIcon, Modal, Checkbox } from '@mantine/core';
import { IconPalette, IconLock, IconPlus, IconTrash } from '@tabler/icons-react';
import { TriggerNuiCallback } from '../Utils/TriggerNuiCallback';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import { CameraShape } from './micro/CameraShape';

interface ThemeConfig {
  primaryColor: string; // Active tab color
  inactiveColor: string; // Inactive tab color
}

interface ShapeConfig {
  type: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
}

interface ClothingRestriction {
  id: string;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  type?: 'model' | 'clothing';
  part?: 'model' | 'drawable' | 'prop';
  category?: string;
  itemId: number;
  name?: string;
  texturesAll?: boolean;
  textures?: number[];
}

type PartType = 'model' | 'drawable' | 'prop';

export const AdminMenu: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
  });
  const [shape, setShape] = useState<ShapeConfig>({ type: 'hexagon' });
  const [restrictions, setRestrictions] = useState<ClothingRestriction[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRestriction, setNewRestriction] = useState<Partial<ClothingRestriction>>({
    gender: 'male',
    type: 'clothing',
  });

  const [texturesAll, setTexturesAll] = useState<boolean>(true);
  const [texturesInput, setTexturesInput] = useState<string>('');

  const categoryOptionsByPart: Record<PartType, { value: string; label: string }[]> = {
    model: [{ value: 'model', label: 'Model' }],
    drawable: [
      { value: 'masks', label: 'Masks' },
      { value: 'shirts', label: 'Undershirts' },
      { value: 'jackets', label: 'Tops/Jackets' },
      { value: 'vest', label: 'Vest' },
      { value: 'legs', label: 'Legs' },
      { value: 'shoes', label: 'Shoes' },
    ],
    prop: [
      { value: 'hats', label: 'Hats' },
      { value: 'glasses', label: 'Glasses' },
    ],
  };

  HandleNuiMessage<boolean>('setVisibleAdminMenu', (visible) => {
    console.log('[AdminMenu] setVisibleAdminMenu received:', visible);
    setIsVisible(visible);
  });

  HandleNuiMessage<ClothingRestriction[]>('setRestrictions', (data) => {
    setRestrictions(data);
  });

  // no JSON sets

  HandleNuiMessage<ThemeConfig>('setThemeConfig', (data) => {
    setTheme(data);
  });

  HandleNuiMessage<ShapeConfig>('setShapeConfig', (data) => {
    setShape(data);
  });

  useEffect(() => {}, [isVisible]);

  const handleSaveThemeAndShape = () => {
    TriggerNuiCallback('saveTheme', theme).then(() => {
      console.log('Theme saved');
    });
    TriggerNuiCallback('saveShape', shape).then(() => {
      console.log('Shape saved');
    });
  };

  const handleAddRestriction = () => {
    if (!newRestriction.itemId || (!newRestriction.job && !newRestriction.gang)) return;

    const part: PartType = (newRestriction.part as PartType) || 'drawable';
    const category = newRestriction.category;
    const textures = texturesAll
      ? undefined
      : texturesInput
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));

    const restriction: ClothingRestriction = {
      id: `${Date.now()}-${Math.random()}`,
      job: newRestriction.job,
      gang: newRestriction.gang,
      gender: newRestriction.gender || 'male',
      type: (part === 'model' ? 'model' : 'clothing'),
      part,
      category,
      itemId: newRestriction.itemId!,
      texturesAll,
      textures,
    };

    TriggerNuiCallback('addRestriction', restriction).then(() => {
      setRestrictions([...restrictions, restriction]);
      setAddModalOpen(false);
      setNewRestriction({ gender: 'male' });
      setTexturesAll(true);
      setTexturesInput('');
    });
  };

  const handleDeleteRestriction = (id: string) => {
    TriggerNuiCallback('deleteRestriction', id).then(() => {
      setRestrictions(restrictions.filter((r) => r.id !== id));
    });
  };

  const handleClose = () => {
    console.log('[AdminMenu] Closing admin menu');
    TriggerNuiCallback('closeAdminMenu', {});
    setIsVisible(false);
  };

  console.log('[AdminMenu] Render - isVisible:', isVisible);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          padding: '2rem',
          width: '80vw',
          maxWidth: 1200,
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <Group position="apart" mb="xl">
          <Text size="xl" fw={700} c="white">
            Appearance Admin Menu
          </Text>
          <Button onClick={handleClose} variant="subtle" color="red">
            Close
          </Button>
        </Group>

        <Tabs defaultValue="theme" color="blue">
          <Tabs.List>
            <Tabs.Tab value="theme">
              <IconPalette size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Appearance Settings
            </Tabs.Tab>
            <Tabs.Tab value="restrictions">
              <IconLock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Restrictions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theme" pt="xl">
            <Stack spacing="xl">
              <div>
                <Text c="white" fw={600} mb="md" size="sm">
                  Theme Colors
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <Text c="dimmed" size="xs" mb="xs">
                      Active Tab
                    </Text>
                    <ColorPicker
                      value={theme.primaryColor}
                      onChange={(color) => setTheme({ ...theme, primaryColor: color })}
                      format="hex"
                      fullWidth
                      swatchesPerRow={10}
                      swatches={[
                        '#ef4444',
                        '#f97316',
                        '#f59e0b',
                        '#eab308',
                        '#84cc16',
                        '#22c55e',
                        '#10b981',
                        '#14b8a6',
                        '#06b6d4',
                        '#0ea5e9',
                        '#3b82f6',
                        '#6366f1',
                        '#8b5cf6',
                        '#a855f7',
                        '#d946ef',
                        '#ec4899',
                        '#f43f5e',
                      ]}
                    />
                  </div>
                  <div>
                    <Text c="dimmed" size="xs" mb="xs">
                      Inactive Tab
                    </Text>
                    <ColorPicker
                      value={theme.inactiveColor}
                      onChange={(color) => setTheme({ ...theme, inactiveColor: color })}
                      format="hex"
                      fullWidth
                      swatchesPerRow={10}
                      swatches={['#171717', '#262626', '#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff']}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Text c="white" fw={600} mb="md" size="sm">
                  Camera Shape
                </Text>
                <Select
                  value={shape.type}
                  onChange={(value) => {
                    if (value === 'hexagon' || value === 'circle' || value === 'square' || value === 'diamond' || value === 'pentagon') {
                      setShape({ type: value });
                    }
                  }}
                  data={[
                    { value: 'hexagon', label: 'Hexagon' },
                    { value: 'circle', label: 'Circle' },
                    { value: 'square', label: 'Square' },
                    { value: 'diamond', label: 'Diamond' },
                    { value: 'pentagon', label: 'Pentagon' },
                  ]}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                  <div>
                    <Text c="dimmed" size="xs" mb="xs" ta="center">
                      Active Preview
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                      <div style={{ width: 80, height: 80 }}>
                        <CameraShape
                          type={shape.type}
                          stroke={theme.primaryColor}
                          fill={`${theme.primaryColor}33`}
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text c="dimmed" size="xs" mb="xs" ta="center">
                      Inactive Preview
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                      <div style={{ width: 80, height: 80 }}>
                        <CameraShape
                          type={shape.type}
                          stroke={theme.inactiveColor}
                          fill={`${theme.inactiveColor}33`}
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveThemeAndShape}
                fullWidth
                size="md"
                styles={{
                  root: {
                    backgroundColor: theme.primaryColor,
                    '&:hover': {
                      opacity: 0.9,
                      backgroundColor: theme.primaryColor,
                    },
                  },
                }}
              >
                Save Appearance Settings
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="restrictions" pt="xl">
            <Stack spacing="lg">
              <Group position="apart">
                <Text c="white" fw={500}>
                  Job/Gang Restrictions (split by gender)
                </Text>
                <Button onClick={() => setAddModalOpen(true)}>
                  <IconPlus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Add Restriction
                </Button>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Job/Gang</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Gender</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Part</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Textures</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restrictions.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                          No restrictions configured
                        </td>
                      </tr>
                    ) : (
                      restrictions.map((r, idx) => (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.75rem' }}>{r.job || r.gang}</td>
                          <td style={{ padding: '0.75rem' }}>{r.gender}</td>
                          <td style={{ padding: '0.75rem' }}>{r.part || r.type}</td>
                          <td style={{ padding: '0.75rem' }}>{r.category || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{r.itemId}</td>
                          <td style={{ padding: '0.75rem' }}>{r.texturesAll ? 'All' : (r.textures?.join(', ') || '-')}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <ActionIcon color="red" onClick={() => handleDeleteRestriction(r.id)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Advanced JSON sets removed per request */}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Modal
          opened={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add Restriction"
          centered
          zIndex={10000}
        >
          <Stack spacing="md">
            <TextInput
              label="Job Name (leave empty if gang)"
              placeholder="police"
              value={newRestriction.job || ''}
              onChange={(e) => setNewRestriction({ ...newRestriction, job: e.target.value || undefined, gang: undefined })}
            />
            <TextInput
              label="Gang Name (leave empty if job)"
              placeholder="ballas"
              value={newRestriction.gang || ''}
              onChange={(e) => setNewRestriction({ ...newRestriction, gang: e.target.value || undefined, job: undefined })}
            />
            <Select
              label="Gender"
              value={newRestriction.gender}
              onChange={(value) => {
                if (value === 'male' || value === 'female') {
                  setNewRestriction({ ...newRestriction, gender: value });
                }
              }}
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            {/** Type removed; Part determines behavior */}
            <Select
              label="Part"
              value={newRestriction.part || 'drawable'}
              onChange={(value) => {
                const part = (value as PartType) || 'drawable';
                setNewRestriction({
                  ...newRestriction,
                  part,
                });
              }}
              data={[
                { value: 'model', label: 'Model' },
                { value: 'drawable', label: 'Drawable (clothing component)' },
                { value: 'prop', label: 'Prop (hats/glasses)' },
              ]}
            />
            <Select
              label="Category"
              value={newRestriction.category || ''}
              onChange={(value) =>
                setNewRestriction({ ...newRestriction, category: value || undefined })
              }
              data={categoryOptionsByPart[(newRestriction.part as PartType) || 'drawable']}
              placeholder="Select category"
            />
            {(newRestriction.part || 'drawable') !== 'model' && (
              <>
                <Checkbox
                  label="All textures"
                  checked={texturesAll}
                  onChange={(e) => setTexturesAll(e.currentTarget.checked)}
                />
                {!texturesAll && (
                  <TextInput
                    label="Textures (comma-separated)"
                    placeholder="0,1,2,3"
                    value={texturesInput}
                    onChange={(e) => setTexturesInput(e.currentTarget.value)}
                  />
                )}
              </>
            )}
            <TextInput
              label="Item ID"
              type="number"
              placeholder="123"
              value={newRestriction.itemId?.toString() || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  setNewRestriction({ ...newRestriction, itemId: value });
                } else {
                  setNewRestriction({ ...newRestriction, itemId: undefined });
                }
              }}
            />
            
            <Group position="right" mt="md">
              <Button variant="subtle" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRestriction}>Add</Button>
            </Group>
          </Stack>
        </Modal>

        {/* JSON editor removed */}
      </div>
    </div>
  );
};
