import { FC, useState, useEffect } from 'react';
import { Box, TextInput, Button, Stack, Text, Grid, NumberInput } from '@mantine/core';
import { Divider } from '../micro/Divider';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { TValue, THeadStructure, THeadOverlay, THeadOverlayTotal } from '../../types/appearance';


export const Face: FC = () => {

    // Styled Number Stepper Component
    const NumberStepper: FC<{
        value: number;
        min: number;
        max: number;
        onChange: (value: number) => void;
    }> = ({ value, min, max, onChange }) => {
        const [isLeftHovered, setIsLeftHovered] = useState(false);
        const [isRightHovered, setIsRightHovered] = useState(false);
        const [inputValue, setInputValue] = useState(value.toString());

        useEffect(() => {
            setInputValue(value.toString());
        }, [value]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
        };

        const handleInputBlur = () => {
            const numValue = parseInt(inputValue);
            if (!isNaN(numValue)) {
                const clampedValue = Math.max(min, Math.min(max, numValue));
                onChange(clampedValue);
                setInputValue(clampedValue.toString());
            } else {
                setInputValue(value.toString());
            }
        };

        const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleInputBlur();
                (e.target as HTMLInputElement).blur();
            }
        };

        return (
            <Box style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
                <Button
                    size="xs"
                    variant="default"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    onMouseEnter={() => setIsLeftHovered(true)}
                    onMouseLeave={() => setIsLeftHovered(false)}
                    style={{
                        minWidth: '2rem',
                        height: '2.125rem',
                        padding: '0',
                        backgroundColor: isLeftHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    ◂
                </Button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyPress={handleKeyPress}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '0',
                        textAlign: 'center',
                        flex: 1,
                        height: '2.125rem',
                        width: '4rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        outline: 'none',
                        borderRadius: '0.125rem'
                    }}
                />
                <Button
                    size="xs"
                    variant="default"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    onMouseEnter={() => setIsRightHovered(true)}
                    onMouseLeave={() => setIsRightHovered(false)}
                    style={{
                        minWidth: '2rem',
                        height: '2.125rem',
                        padding: '0',
                        backgroundColor: isRightHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    ▸
                </Button>
            </Box>
        );
    };

    const {
        appearance,
        locale,

        setHeadStructure,
        setHeadOverlay,
    } = useAppearanceStore();

    const [data, setData] = useState<THeadStructure>(appearance?.headStructure as THeadStructure || {});
    const [headdata, setHeadData] = useState<THeadOverlay>(appearance?.headOverlay as THeadOverlay || {});
    const headOverlayTotal = appearance?.headOverlayTotal as THeadOverlayTotal
    const [currentPedIndex, setCurrentPedIndex] = useState(appearance?.modelIndex || 0);
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    return (
        <Stack spacing="lg" style={{ padding: '0.25rem 0.75rem' }}>

            {data ? (
                <>
                    {headdata?.Ageing?.overlayValue !== null && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.AGEING_SUBTITLE || 'Cheeks'}</Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.BONEWIDTH_SUBTITLE || 'Depth'}</Text>
                                            </Box>
                                            <NumberStepper
                                                value={headdata.Ageing.overlayValue || 0}
                                                min={0}
                                                max={headOverlayTotal.Ageing}
                                                onChange={(val) => setHeadOverlay({ ...headdata.Ageing, overlayValue: val })}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.OPACITY_SUBTITLE || 'Depth'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Cheekbone_Width.value || 0}
                                                    onChange={(e) => setHeadOverlay({
                                                        ...headdata.Ageing,
                                                        overlayOpacity: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                            </Box>
                        </>
                    )}
                    {data.Cheekbone_High && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.CHEEKS_TITLE || 'Cheeks'}</Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.BONEHEIGHT_SUBTITLE || 'Bone Height'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Cheekbone_High.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Cheekbone_High,
                                                        value: Number(e.target.value)
                                                    })}

                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.BONEWIDTH_SUBTITLE || 'Depth'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Cheekbone_Width.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Cheekbone_Width,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                            </Box>
                        </>
                    )}

                    {data.EyeBrow_Height && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.EYEBROW_TITLE || 'Eyebrow'}</Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.HEIGHT_SUBTITLE || 'Width'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.EyeBrow_Height.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.EyeBrow_Height,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.DEPTH_SUBTITLE || 'Depth'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.EyeBrow_Forward.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.EyeBrow_Forward,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                            </Box>
                        </>
                    )}

                    {data.Eyes_Openning && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.EYES_TITLE || 'Eyes'}</Text>
                                <Box>

                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right"> {locale.SQUINT_SUBTITLE || 'Width'}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Eyes_Openning.value || 0}
                                            onChange={(e) => setHeadStructure({
                                                        ...data.Eyes_Openning,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </Box>
                                </Box>

                            </Box>
                        </>
                    )}

                    {data.Lips_Thickness && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.LIPS_TITLE || 'Eyes'}</Text>
                                <Box>

                                    <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                        <Text size="sm" c="dimmed" ta="right"> {locale.THICKNESS_SUBTITLE || 'Width'}</Text>
                                    </Box>
                                    <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min={-1}
                                            max={1}
                                            step={0.01}
                                            value={data.Lips_Thickness.value || 0}
                                                                                        onChange={(e) => setHeadStructure({
                                                        ...data.Lips_Thickness,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                            style={{
                                                flex: 1,
                                                accentColor: '#5c7cfa',
                                                height: '0.375rem',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </Box>
                                </Box>

                            </Box>
                        </>
                    )}

                    {data.Nose_Width && (
                        <>
                            <Divider />
                            <Box>
                                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.NOSE_TITLE || 'NOSE'}</Text>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.WIDTH_SUBTITLE || 'Width'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Width.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Width,
                                                        value: parseFloat(e.target.value)
                                                    })}

                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.PEAKHEIGHT_SUBTITLE || 'Peak Length'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Height.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Peak_Height,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.BONEHEIGHT_SUBTITLE || 'Bone Height'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Bone_Height.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Bone_Height,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col span={6}>

                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.PEAKLENGTH_SUBTITLE || 'Peak Length'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Length.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Peak_Length,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>

                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                <Box>
                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.BONETWIST_SUBTITLE || 'Bone Twist'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Bone_Twist.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Bone_Twist,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col span={6}>

                                            <Box style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.625rem' }}>
                                                <Text size="sm" c="dimmed" ta="right"> {locale.PEAKLOWERING_SUBTITLE || 'Peak Lowering'}</Text>
                                            </Box>
                                            <Box style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <input
                                                    type="range"
                                                    min={-1}
                                                    max={1}
                                                    step={0.01}
                                                    value={data.Nose_Peak_Lowering.value || 0}
                                                    onChange={(e) => setHeadStructure({
                                                        ...data.Nose_Peak_Lowering,
                                                        value: parseFloat(e.target.value)
                                                    })}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#5c7cfa',
                                                        height: '0.375rem',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Box>

                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Box>
                        </>

                    )}

                </>
            ) : (
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{locale.NO_FACEMENU || 'You can\'t modify your face'}</Text>
            )}





        </Stack>
    );
}


export default Face;