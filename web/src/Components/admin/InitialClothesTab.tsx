import { FC } from 'react';
import { Stack, Group, Text, Box, NumberInput, Accordion, TextInput } from '@mantine/core';
import { IconMars, IconVenus } from '@tabler/icons-react';

interface ClothingConfig {
  model: string;
  components: Array<{ drawable: number; texture: number }>;
  props: Array<{ drawable: number; texture: number }>;
  hair: { color: number; highlight: number; style: number; texture: number };
}

interface InitialClothesTabProps {
  initialClothes: {
    male: ClothingConfig;
    female: ClothingConfig;
  };
  setInitialClothes: (clothes: { male: ClothingConfig; female: ClothingConfig }) => void;
  locale: any;
}

export const InitialClothesTab: FC<InitialClothesTabProps> = ({
  initialClothes,
  setInitialClothes,
  locale,
}) => {
  return (
    <Stack spacing="md">
      <div>
        <Text c="white" fw={500} size="lg" mb={4}>
          {locale.ADMIN_INITIAL_CLOTHES_TITLE || 'Initial Player Clothes'}
        </Text>
        <Text c="dimmed" size="xs">
          {locale.ADMIN_INITIAL_CLOTHES_DESC || 'Set default clothing items that will be applied when a new character is created.'}
        </Text>
      </div>

      <Group grow spacing="md" align="flex-start">
        {/* Male Column */}
        <Box style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <Group mb="sm" spacing="xs">
            <IconMars size={18} color="#4dabf7" />
            <Text c="white" fw={600} size="sm">Male</Text>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.male.model}
                  onChange={(e) => {
                    setInitialClothes({
                      ...initialClothes,
                      male: { ...initialClothes.male, model: e.currentTarget.value }
                    });
                  }}
                  placeholder="mp_m_freemode_01"
                  description="Ped model name"
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="components">
              <Accordion.Control><Text size="sm" fw={500}>Components (12)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Face', 'Mask', 'Hair', 'Upper Body', 'Lower Body', 'Bag', 'Shoes', 'Scarf', 'Shirt', 'Armor', 'Decals', 'Jacket'].map((name, idx) => (
                    <Group key={`male-comp-${idx}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                      <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
                      <NumberInput
                        size="xs"
                        value={initialClothes.male.components[idx]?.drawable ?? 0}
                        onChange={(val) => {
                          const newComps = [...initialClothes.male.components];
                          newComps[idx] = { drawable: val as number, texture: newComps[idx]?.texture ?? 0 };
                          setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, components: newComps } });
                        }}
                        min={0}
                        style={{ width: '70px' }}
                        hideControls
                      />
                      <NumberInput
                        size="xs"
                        value={initialClothes.male.components[idx]?.texture ?? 0}
                        onChange={(val) => {
                          const newComps = [...initialClothes.male.components];
                          newComps[idx] = { drawable: newComps[idx]?.drawable ?? 0, texture: val as number };
                          setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, components: newComps } });
                        }}
                        min={0}
                        style={{ width: '70px' }}
                        hideControls
                      />
                    </Group>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="props">
              <Accordion.Control><Text size="sm" fw={500}>Props (5)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Hat', 'Glasses', 'Ear', 'Watch', 'Bracelet'].map((name, realIdx) => {
                    const idx = [0, 1, 2, 6, 7][realIdx];
                    return (
                      <Group key={`male-prop-${idx}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: realIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                        <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
                        <NumberInput
                          size="xs"
                          value={initialClothes.male.props[realIdx]?.drawable ?? -1}
                          onChange={(val) => {
                            const newProps = [...initialClothes.male.props];
                            newProps[realIdx] = { drawable: val as number, texture: newProps[realIdx]?.texture ?? -1 };
                            setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
                          }}
                          min={-1}
                          style={{ width: '70px' }}
                          hideControls
                        />
                        <NumberInput
                          size="xs"
                          value={initialClothes.male.props[realIdx]?.texture ?? -1}
                          onChange={(val) => {
                            const newProps = [...initialClothes.male.props];
                            newProps[realIdx] = { drawable: newProps[realIdx]?.drawable ?? -1, texture: val as number };
                            setInitialClothes({ ...initialClothes, male: { ...initialClothes.male, props: newProps } });
                          }}
                          min={-1}
                          style={{ width: '70px' }}
                          hideControls
                        />
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="hair">
              <Accordion.Control><Text size="sm" fw={500}>Hair</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Style', 'Texture', 'Color', 'Highlight'].map((name, idx) => {
                    const key = ['style', 'texture', 'color', 'highlight'][idx] as 'style' | 'texture' | 'color' | 'highlight';
                    return (
                      <Group key={`male-hair-${key}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                        <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{name}</Text>
                        <NumberInput
                          size="xs"
                          value={initialClothes.male.hair[key] ?? 0}
                          onChange={(val) => {
                            setInitialClothes({
                              ...initialClothes,
                              male: { ...initialClothes.male, hair: { ...initialClothes.male.hair, [key]: val as number } }
                            });
                          }}
                          min={0}
                          style={{ width: '150px' }}
                          hideControls
                        />
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>

        {/* Female Column */}
        <Box style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <Group mb="sm" spacing="xs">
            <IconVenus size={18} color="#ff6b9d" />
            <Text c="white" fw={600} size="sm">Female</Text>
          </Group>
          
          <Accordion chevronPosition="left" variant="separated">
            <Accordion.Item value="model">
              <Accordion.Control><Text size="sm" fw={500}>Model</Text></Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  size="xs"
                  value={initialClothes.female.model}
                  onChange={(e) => {
                    setInitialClothes({
                      ...initialClothes,
                      female: { ...initialClothes.female, model: e.currentTarget.value }
                    });
                  }}
                  placeholder="mp_f_freemode_01"
                  description="Ped model name"
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="components">
              <Accordion.Control><Text size="sm" fw={500}>Components (12)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Face', 'Mask', 'Hair', 'Upper Body', 'Lower Body', 'Bag', 'Shoes', 'Scarf', 'Shirt', 'Armor', 'Decals', 'Jacket'].map((name, idx) => (
                    <Group key={`female-comp-${idx}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                      <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
                      <NumberInput
                        size="xs"
                        value={initialClothes.female.components[idx]?.drawable ?? 0}
                        onChange={(val) => {
                          const newComps = [...initialClothes.female.components];
                          newComps[idx] = { drawable: val as number, texture: newComps[idx]?.texture ?? 0 };
                          setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, components: newComps } });
                        }}
                        min={0}
                        style={{ width: '70px' }}
                        hideControls
                      />
                      <NumberInput
                        size="xs"
                        value={initialClothes.female.components[idx]?.texture ?? 0}
                        onChange={(val) => {
                          const newComps = [...initialClothes.female.components];
                          newComps[idx] = { drawable: newComps[idx]?.drawable ?? 0, texture: val as number };
                          setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, components: newComps } });
                        }}
                        min={0}
                        style={{ width: '70px' }}
                        hideControls
                      />
                    </Group>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="props">
              <Accordion.Control><Text size="sm" fw={500}>Props (5)</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Hat', 'Glasses', 'Ear', 'Watch', 'Bracelet'].map((name, realIdx) => {
                    const idx = [0, 1, 2, 6, 7][realIdx];
                    return (
                      <Group key={`female-prop-${idx}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: realIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                        <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{idx}: {name}</Text>
                        <NumberInput
                          size="xs"
                          value={initialClothes.female.props[realIdx]?.drawable ?? -1}
                          onChange={(val) => {
                            const newProps = [...initialClothes.female.props];
                            newProps[realIdx] = { drawable: val as number, texture: newProps[realIdx]?.texture ?? -1 };
                            setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
                          }}
                          min={-1}
                          style={{ width: '70px' }}
                          hideControls
                        />
                        <NumberInput
                          size="xs"
                          value={initialClothes.female.props[realIdx]?.texture ?? -1}
                          onChange={(val) => {
                            const newProps = [...initialClothes.female.props];
                            newProps[realIdx] = { drawable: newProps[realIdx]?.drawable ?? -1, texture: val as number };
                            setInitialClothes({ ...initialClothes, female: { ...initialClothes.female, props: newProps } });
                          }}
                          min={-1}
                          style={{ width: '70px' }}
                          hideControls
                        />
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="hair">
              <Accordion.Control><Text size="sm" fw={500}>Hair</Text></Accordion.Control>
              <Accordion.Panel>
                <Stack spacing={4}>
                  {['Style', 'Texture', 'Color', 'Highlight'].map((name, idx) => {
                    const key = ['style', 'texture', 'color', 'highlight'][idx] as 'style' | 'texture' | 'color' | 'highlight';
                    return (
                      <Group key={`female-hair-${key}`} spacing={4} style={{ padding: '4px 8px', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 4 }}>
                        <Text c="dimmed" size="xs" style={{ width: '80px', flexShrink: 0 }}>{name}</Text>
                        <NumberInput
                          size="xs"
                          value={initialClothes.female.hair[key] ?? 0}
                          onChange={(val) => {
                            setInitialClothes({
                              ...initialClothes,
                              female: { ...initialClothes.female, hair: { ...initialClothes.female.hair, [key]: val as number } }
                            });
                          }}
                          min={0}
                          style={{ width: '150px' }}
                          hideControls
                        />
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </Group>
    </Stack>
  );
};
