import { FC, useState, useEffect } from 'react';
import { Box, TextInput, Button, Stack, Text, Grid, Divider } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { TColours, THairColour, THeadOverlay } from '../../types/appearance';
import { NumberStepper } from '../micro/NumberStepper';
import { ColourDropdown } from '../micro/ColourDropdown';


// Styled Number Stepper Component

export const Hair: FC = () => {

    const {
        appearance,
        blacklist,
        locale,
        isValid,
        setDrawable,
        setHairColour,
        setHeadOverlay,
    } = useAppearanceStore();

    const updateHeadOverlay = (newOverlay: THeadOverlay[keyof THeadOverlay]) => {
        setHeadOverlay(newOverlay);
    };

    const drawables = appearance?.drawables
    const drawTotal = appearance?.drawTotal
    const headOverlay = appearance?.headOverlay as THeadOverlay;
    const headOverlayTotal = appearance?.headOverlayTotal;
    const hairColor = appearance?.hairColour;


    return (
        <Stack spacing="lg"
            className="appearance-scroll"
            style={{
                padding: '0.25rem 0.75rem',
                width: '18rem',
                maxWidth: '400px',
                height: "100%",
                maxHeight: "100%",
                overflowY: "auto",   // browser scroll only
                overflowX: "hidden",
                paddingBottom: "2rem",  // ⬅️ Add bottom padding here
            }}>
            {drawTotal && drawTotal?.hair?.total > 0 ? (
                <>
                    {/* HAIR */}
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.HAIR_TITLE || 'Mother'}</Text>
                        <Grid gutter="sm">
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.DESIGN_SUBTITLE || 'Design'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {drawTotal.hair.total}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables?.hair.value || 0}
                                        min={0}
                                        max={drawTotal.hair.total}
                                        onChange={(value: number) => {
                                            if (drawables && drawables.hair) {
                                                drawables.hair.texture = 0;
                                                setDrawable(drawables.hair, value);
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <Text size="sm" c="dimmed">{locale.TEXTURE_SUBTITLE || 'Texture'}</Text>
                                        <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {drawTotal.hair.textures}</Text>
                                    </Box>
                                    <NumberStepper
                                        value={drawables?.hair.texture || 0}
                                        min={0}
                                        max={drawTotal.hair.textures}
                                        onChange={(value: number) => {
                                            if (drawables && drawables.hair) {
                                                setDrawable(drawables.hair, value, true);
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Box>

                    <Grid gutter="sm">
                        <Grid.Col span={6}>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={hairColor?.Colour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // Type guard: check if value is THairColour
                                        if (value && typeof value === 'object' && 'highlight' in value && 'Colour' in value) {
                                            setHairColour(value as THairColour);
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={hairColor?.highlight || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // Type guard: check if value is THairColour
                                        if (value && typeof value === 'object' && 'highlight' in value && 'Colour' in value) {
                                            setHairColour(value as THairColour);
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>
                </>
            ) : null}


            {headOverlay?.FacialHair?.overlayValue !== undefined && typeof headOverlayTotal?.FacialHair === 'number' && headOverlayTotal.FacialHair > 0 ? (
                <>
                    {/* FACIAL HAIR */}
                    <Divider />
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.FACIALHAIR_TITLE || 'Mother'}</Text>

                        <Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <Text size="sm" c="dimmed">{locale.TEXTURE_SUBTITLE || 'Texture'}</Text>
                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.FacialHair}</Text>
                            </Box>
                            <NumberStepper
                                value={drawables?.hair.texture || 0}
                                min={0}
                                max={headOverlayTotal.FacialHair}
                                onChange={(value: number) => {
                                    if (headOverlay && headOverlay.FacialHair) {
                                        updateHeadOverlay({
                                            ...(headOverlay.FacialHair || {}),
                                            overlayValue: value,
                                        })
                                    }
                                }}
                            />
                        </Box>

                    </Box>


                    <Grid gutter="sm">
                        <Grid.Col span={6}>
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.FacialHair.firstColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.FacialHair) {
                                            updateHeadOverlay({
                                                ...(headOverlay.FacialHair || {}),
                                                firstColour: firstColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={6}>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.FacialHair.secondColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const secondColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.FacialHair) {
                                            updateHeadOverlay({
                                                ...(headOverlay.FacialHair || {}),
                                                secondColour: secondColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>

                    <Box>
                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                            <Text size="sm" c="dimmed" ta="right">
                                {locale.OPACITY_SUBTITLE || 'Opacity'}
                            </Text>
                        </Box>
                        <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.01}
                                value={headOverlay.FacialHair.overlayOpacity ?? 0}
                                onChange={(e) =>
                                    setHeadOverlay({
                                        ...(headOverlay.FacialHair || {}),
                                        overlayOpacity: parseFloat(e.target.value),
                                    })
                                }
                                style={{
                                    flex: 1,
                                    accentColor: '#5c7cfa',
                                    height: '0.375rem',
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>
                    </Box>


                </>
            ) : null}

            {headOverlay?.ChestHair?.overlayValue !== undefined && typeof headOverlayTotal?.ChestHair === 'number' && headOverlayTotal.ChestHair > 0 ? (
                <>
                    {/* CHEST HAIR */}
                    <Divider />
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.CHESTHAIR_TITLE || 'Mother'}</Text>

                        <Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <Text size="sm" c="dimmed">{locale.TEXTURE_SUBTITLE || 'Texture'}</Text>
                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.ChestHair}</Text>
                            </Box>
                            <NumberStepper
                                value={drawables?.hair.texture || 0}
                                min={0}
                                max={headOverlayTotal.ChestHair}
                                onChange={(value: number) => {
                                    if (headOverlay && headOverlay.ChestHair) {
                                        updateHeadOverlay({
                                            ...(headOverlay.ChestHair || {}),
                                            overlayValue: value,
                                        })
                                    }
                                }}
                            />
                        </Box>

                    </Box>


                    <Grid gutter="sm">
                        <Grid.Col span={6}>
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.ChestHair.firstColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.ChestHair) {
                                            updateHeadOverlay({
                                                ...(headOverlay.ChestHair || {}),
                                                firstColour: firstColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={6}>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.ChestHair.secondColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const secondColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.ChestHair) {
                                            updateHeadOverlay({
                                                ...(headOverlay.ChestHair || {}),
                                                secondColour: secondColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>

                    <Box>
                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                            <Text size="sm" c="dimmed" ta="right">
                                {locale.OPACITY_SUBTITLE || 'Opacity'}
                            </Text>
                        </Box>
                        <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.01}
                                value={headOverlay.ChestHair.overlayOpacity ?? 0}
                                onChange={(e) =>
                                    setHeadOverlay({
                                        ...(headOverlay.ChestHair || {}),
                                        overlayOpacity: parseFloat(e.target.value),
                                    })
                                }
                                style={{
                                    flex: 1,
                                    accentColor: '#5c7cfa',
                                    height: '0.375rem',
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>
                    </Box>


                </>
            ) : null}

            {headOverlay?.Eyebrows?.overlayValue !== undefined && typeof headOverlayTotal?.Eyebrows === 'number' && headOverlayTotal.Eyebrows > 0 ? (
                <>
                    {/* CHEST HAIR */}
                    <Divider />
                    <Box>
                        <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.EYEBROWS_TITLE || 'Mother'}</Text>

                        <Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <Text size="sm" c="dimmed">{locale.TEXTURE_SUBTITLE || 'Texture'}</Text>
                                <Text size="sm" c="dimmed">{locale.TOTAL_SUBTITLE || 'Total'}: {headOverlayTotal.Eyebrows}</Text>
                            </Box>
                            <NumberStepper
                                value={drawables?.hair.texture || 0}
                                min={0}
                                max={headOverlayTotal.Eyebrows}
                                onChange={(value: number) => {
                                    if (headOverlay && headOverlay.Eyebrows) {
                                        updateHeadOverlay({
                                            ...(headOverlay.Eyebrows || {}),
                                            overlayValue: value,
                                        })
                                    }
                                }}
                            />
                        </Box>

                    </Box>


                    <Grid gutter="sm">
                        <Grid.Col span={6}>
                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.COLOUR_SUBTITLE || 'Colour'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.Eyebrows.firstColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const firstColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.Eyebrows) {
                                            updateHeadOverlay({
                                                ...(headOverlay.Eyebrows || {}),
                                                firstColour: firstColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={6}>

                            <Box>
                                <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '6px' }}>
                                    <Text size="sm" c="dimmed">{locale.HIGHLIGHT_SUBTITLE || 'Hightlight'}</Text>
                                </Box>
                                <ColourDropdown
                                    colourType="hair"
                                    index={headOverlay?.Eyebrows.secondColour || 0}
                                    value={null}
                                    onChange={(value) => {
                                        // value is expected to be an object, extract the number
                                        const secondColourValue = typeof value === 'object' && value !== null && 'index' in value
                                            ? (value as any).index
                                            : typeof value === 'number'
                                                ? value
                                                : 0;
                                        if (headOverlay && headOverlay.Eyebrows) {
                                            updateHeadOverlay({
                                                ...(headOverlay.Eyebrows || {}),
                                                secondColour: secondColourValue,
                                            })
                                        }
                                    }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>

                    <Box>
                        <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                            <Text size="sm" c="dimmed" ta="right">
                                {locale.OPACITY_SUBTITLE || 'Opacity'}
                            </Text>
                        </Box>
                        <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.01}
                                value={headOverlay.Eyebrows.overlayOpacity ?? 0}
                                onChange={(e) =>
                                    setHeadOverlay({
                                        ...(headOverlay.Eyebrows || {}),
                                        overlayOpacity: parseFloat(e.target.value),
                                    })
                                }
                                style={{
                                    flex: 1,
                                    accentColor: '#5c7cfa',
                                    height: '0.375rem',
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>
                    </Box>


                </>
            ) : null}
        </Stack>
    )
};

export default Hair;

