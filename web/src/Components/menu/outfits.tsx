import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Button, Divider, Group, Input, NumberInput, Stack, Text, Paper, Grid } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { TOutfitData } from '../../types/appearance';
import { IconCancel } from '../icons/IconCancel';
import { IconCheck } from '../icons/IconCheck';
import { IconPlus } from '../icons/IconPlus';
import { IconImport } from '../icons/IconImport';
import { Menu } from '@mantine/core';

const Outfits: React.FC = () => {
    // Inject animation keyframes once
    useEffect(() => {
        if (!document.getElementById('fadeScaleIn-keyframes')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'fadeScaleIn-keyframes';
            styleSheet.innerText = `
                @keyframes fadeScaleIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                `;
            document.head.appendChild(styleSheet);
        }
    }, []);
    const { outfits, locale, jobData, editOutfit, useOutfit, shareOutfit, itemOutfit, deleteOutfit, saveOutfit, importOutfit } = useAppearanceStore();

    // Separate personal and admin outfits
    const { personalOutfits, adminOutfits } = useMemo(() => {
        if (!outfits) return { personalOutfits: [], adminOutfits: [] };
        return {
            personalOutfits: outfits.filter(o => !o.jobname),
            adminOutfits: outfits.filter(o => o.jobname),
        };
    }, [outfits]);

    const [renameIndex, setRenameIndex] = useState<number>(-1);
    const [renameLabel, setRenameLabel] = useState<string>('');
    const [deleteIndex, setDeleteIndex] = useState<number>(-1);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isJobAdding, setIsJobAdding] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [newOutfitLabel, setNewOutfitLabel] = useState<string>('');
    const [newOutfitJobRank, setNewOutfitJobRank] = useState<number>(0);
    const [importOutfitId, setImportOutfitId] = useState<number>(0);
    const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

    const handleRename = (index: number) => {
        if (renameLabel.length > 0 && outfits && outfits[index]) {
            editOutfit({ ...outfits[index], label: renameLabel });
            setRenameIndex(-1);
            setRenameLabel('');
        }
    };

    const ShrinkText = ({ children }: { children: React.ReactNode }) => {
        const ref = useRef<HTMLSpanElement>(null);

        useEffect(() => {
            const el = ref.current;
            if (!el) return;

            let size = 16; // starting font size
            el.style.fontSize = size + "px";

            // Reduce until fits
            while (el.scrollWidth > el.clientWidth && size > 8) {
                size -= 1;
                el.style.fontSize = size + "px";
            }
        }, [children]);

        return (
            <span
                ref={ref}
                style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    minWidth: 0,
                    maxWidth: "100%",
                }}
            >
                {children}
            </span>
        );
    };


    const handleOutfitAction = (
        action: string,
        index: number,
        outfit?: TOutfitData,
        label?: string
    ) => {
        switch (action) {
            case 'use':
                if (outfit) useOutfit(outfit);
                break;
            case 'share':
                shareOutfit(index);
                break;
            case 'item':
                if (outfit) itemOutfit(outfit, renameLabel !== '' ? renameLabel : (label ?? ''));
                break;
            case 'delete':
                deleteOutfit(index);
                break;
            default:
                break;
        }
    };

    const resetNewOutfitFields = () => {
        setIsAdding(false);
        setIsJobAdding(false);
        setNewOutfitLabel('');
        setNewOutfitJobRank(0);
    };

    const resetImportFields = () => {
        setIsImporting(false);
        setImportOutfitId(0);
    };

    return (
        <Stack spacing="lg"
            className="appearance-scroll"
            style={{
                padding: '0.25rem 0.75rem',
                height: "100%",
                maxHeight: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingBottom: "2rem",
            }}>

            {/* Render personal outfits */}
            {personalOutfits && personalOutfits.length > 0 && (
                <>
                    <Text fw={700} size="lg" c="white" tt="uppercase" mb="md">
                        Personal Outfits
                    </Text>
                    {personalOutfits.map(({ label, outfit, id }: any, i: number) => (
                        <OutfitItem
                            key={id || i}
                            label={label}
                            outfit={outfit}
                            id={id}
                            index={i}
                            isJob={false}
                            isAdmin={false}
                            isBoss={jobData.isBoss}
                            locale={locale}
                            activeDropdownIndex={activeDropdownIndex}
                            setActiveDropdownIndex={setActiveDropdownIndex}
                            renameIndex={renameIndex}
                            setRenameIndex={setRenameIndex}
                            renameLabel={renameLabel}
                            setRenameLabel={setRenameLabel}
                            deleteIndex={deleteIndex}
                            setDeleteIndex={setDeleteIndex}
                            handleOutfitAction={handleOutfitAction}
                            handleRename={handleRename}
                        />
                    ))}
                    <Divider my="lg" />
                </>
            )}

            {/* Render admin/job outfits */}
            {adminOutfits && adminOutfits.length > 0 && (
                <>
                    <Text fw={700} size="lg" c="white" tt="uppercase" mb="md">
                        Job / Gang Outfits
                    </Text>
                    {adminOutfits.map(({ label, outfit, id, jobname }: any, i: number) => (
                        <OutfitItem
                            key={id || i}
                            label={label}
                            outfit={outfit}
                            id={id}
                            index={i}
                            isJob={true}
                            jobname={jobname}
                            isAdmin={false}
                            isBoss={jobData.isBoss}
                            locale={locale}
                            activeDropdownIndex={activeDropdownIndex}
                            setActiveDropdownIndex={setActiveDropdownIndex}
                            renameIndex={renameIndex}
                            setRenameIndex={setRenameIndex}
                            renameLabel={renameLabel}
                            setRenameLabel={setRenameLabel}
                            deleteIndex={deleteIndex}
                            setDeleteIndex={setDeleteIndex}
                            handleOutfitAction={handleOutfitAction}
                            handleRename={handleRename}
                        />
                    ))}
                    <Divider my="lg" />
                </>
            )}

            {/* New outfit buttons */}
            <OutfitCreation
                isAdding={isAdding}
                setIsAdding={setIsAdding}
                isJobAdding={isJobAdding}
                setIsJobAdding={setIsJobAdding}
                isImporting={isImporting}
                setIsImporting={setIsImporting}
                newOutfitLabel={newOutfitLabel}
                setNewOutfitLabel={setNewOutfitLabel}
                newOutfitJobRank={newOutfitJobRank}
                setNewOutfitJobRank={setNewOutfitJobRank}
                importOutfitId={importOutfitId}
                setImportOutfitId={setImportOutfitId}
                jobDataIsBoss={jobData.isBoss}
                locale={locale}
                onSavePersonal={() => {
                    if (newOutfitLabel.length > 0) {
                        saveOutfit(newOutfitLabel, null);
                        resetNewOutfitFields();
                    }
                }}
                onSaveJob={() => {
                    if (newOutfitLabel.length > 0) {
                        saveOutfit(newOutfitLabel, { name: jobData.name, rank: newOutfitJobRank });
                        resetNewOutfitFields();
                    }
                }}
                onImport={() => {
                    if (importOutfitId > 0) {
                        importOutfit(importOutfitId);
                        resetImportFields();
                    }
                }}
            />

            {!personalOutfits?.length && !adminOutfits?.length && (
                <Text fw={600} mb="sm" ta="center" tt="uppercase" size="sm" c="dimmed">
                    {locale?.NO_OUTFITS || "No outfits configured"}
                </Text>
            )}

        </Stack>
    );
};

// OutfitItem component
interface OutfitItemProps {
    label: string;
    outfit: TOutfitData;
    id: number | string;
    index: number;
    isJob: boolean;
    jobname?: string;
    isAdmin: boolean;
    isBoss: boolean;
    locale: any;
    activeDropdownIndex: number;
    setActiveDropdownIndex: (i: number) => void;
    renameIndex: number;
    setRenameIndex: (i: number) => void;
    renameLabel: string;
    setRenameLabel: (s: string) => void;
    deleteIndex: number;
    setDeleteIndex: (i: number) => void;
    handleOutfitAction: (action: string, index: number, outfit?: TOutfitData, label?: string) => void;
    handleRename: (index: number) => void;
}

const OutfitItem: React.FC<OutfitItemProps> = ({
    label, outfit, id, index, isJob, jobname, isAdmin, isBoss, locale,
    activeDropdownIndex, setActiveDropdownIndex, renameIndex, setRenameIndex,
    renameLabel, setRenameLabel, deleteIndex, setDeleteIndex,
    handleOutfitAction, handleRename,
}) => {
    return (
        <Box>
            <Text fw={600} mb="sm" size="sm" c="white">
                {isJob ? `${label} | ${jobname}` : label}
            </Text>
            <Button
                fullWidth
                radius="md"
                size="sm"
                style={{ fontWeight: 600, background: "rgba(0,0,0,0.6)" }}
                onClick={() => setActiveDropdownIndex(activeDropdownIndex === index ? -1 : index)}
            >
                {locale?.OPTIONS_TITLE ?? "Options"}
            </Button>
            {activeDropdownIndex === index && (
                <Paper
                    shadow="md"
                    radius="md"
                    p="md"
                    style={{
                        background: '#23272f',
                        marginTop: 10,
                        zIndex: 10,
                        animation: 'fadeScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    <Group spacing="xs" style={{ justifyContent: 'center' }}>
                        <Button size="xs" variant="light" color="blue" onClick={() => handleOutfitAction('use', index, outfit)}>
                            {locale?.USE_TITLE || 'Use'}
                        </Button>
                        <Button
                            size="xs"
                            variant="light"
                            color="yellow"
                            disabled={isJob && !isBoss}
                            onClick={() => { setRenameIndex(index); setRenameLabel(label); }}
                        >
                            {locale?.EDIT_TITLE || 'Edit'}
                        </Button>
                        {!isJob && (
                            <Button
                                size="xs"
                                variant="light"
                                color="teal"
                                onClick={() => handleOutfitAction('share', id as number)}
                            >
                                {locale?.SHAREOUTFIT_TITLE || 'Share'}
                            </Button>
                        )}
                        <Button size="xs" variant="light" color="grape" onClick={() => handleOutfitAction('item', index, outfit, label)}>
                            {locale?.ITEMOUTFIT_TITLE || 'Item'}
                        </Button>
                        <Button
                            size="xs"
                            variant="light"
                            color="red"
                            disabled={isJob && !isBoss}
                            onClick={() => setDeleteIndex(index)}
                        >
                            <IconCancel size={16} />
                        </Button>
                    </Group>

                    {renameIndex === index && (
                        <Group spacing="xs" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                            <Input
                                size="xs"
                                value={renameLabel}
                                onChange={e => setRenameLabel(e.currentTarget.value)}
                                placeholder="Rename outfit"
                            />
                            <Button size="xs" color="red" onClick={() => setRenameIndex(-1)}>
                                <IconCancel size={14} />
                            </Button>
                            <Button size="xs" color="green" onClick={() => handleRename(index)}>
                                <IconCheck size={14} />
                            </Button>
                        </Group>
                    )}

                    {deleteIndex === index && (
                        <Group spacing="xs" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                            <Button size="xs" onClick={() => setDeleteIndex(-1)}>
                                {locale?.CANCEL_TITLE || 'Cancel'}
                            </Button>
                            <Button size="xs" color="red" onClick={() => handleOutfitAction('delete', id as number)}>
                                {locale?.CONFIRMREM_SUBTITLE || 'Confirm'}
                            </Button>
                        </Group>
                    )}
                </Paper>
            )}
        </Box>
    );
};

// OutfitCreation component
interface OutfitCreationProps {
    isAdding: boolean;
    setIsAdding: (b: boolean) => void;
    isJobAdding: boolean;
    setIsJobAdding: (b: boolean) => void;
    isImporting: boolean;
    setIsImporting: (b: boolean) => void;
    newOutfitLabel: string;
    setNewOutfitLabel: (s: string) => void;
    newOutfitJobRank: number;
    setNewOutfitJobRank: (n: number) => void;
    importOutfitId: number;
    setImportOutfitId: (n: number) => void;
    jobDataIsBoss: boolean;
    locale: any;
    onSavePersonal: () => void;
    onSaveJob: () => void;
    onImport: () => void;
}

const OutfitCreation: React.FC<OutfitCreationProps> = ({
    isAdding, setIsAdding, isJobAdding, setIsJobAdding, isImporting, setIsImporting,
    newOutfitLabel, setNewOutfitLabel, newOutfitJobRank, setNewOutfitJobRank,
    importOutfitId, setImportOutfitId, jobDataIsBoss, locale,
    onSavePersonal, onSaveJob, onImport,
}) => {
    const resetNewOutfitFields = () => {
        setIsAdding(false);
        setIsJobAdding(false);
        setNewOutfitLabel('');
        setNewOutfitJobRank(0);
    };

    const resetImportFields = () => {
        setIsImporting(false);
        setImportOutfitId(0);
    };

    if (isAdding || isJobAdding) {
        return (
            <Box style={{ animation: 'fadeScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <Text fw={600} mb="sm" size="sm" c="white" tt="uppercase">
                    {isJobAdding ? (locale?.ADDJOBOUTFIT || 'Add Job Outfit') : (locale?.NEWOUTFIT_TITLE || 'New Outfit')}
                </Text>
                <Group spacing="xs">
                    <Input
                        size="sm"
                        placeholder="Outfit Label"
                        value={newOutfitLabel}
                        onChange={(e) => setNewOutfitLabel(e.currentTarget.value)}
                    />
                    {isJobAdding && jobDataIsBoss && (
                        <NumberInput
                            size="sm"
                            placeholder="Job Rank"
                            min={0}
                            value={newOutfitJobRank}
                            onChange={(val) => setNewOutfitJobRank(val || 0)}
                            style={{ width: 100 }}
                        />
                    )}
                    <Button size="xs" color="red" onClick={resetNewOutfitFields}>
                        <IconCancel size={14} />
                    </Button>
                    <Button
                        size="xs"
                        color="green"
                        onClick={isJobAdding ? onSaveJob : onSavePersonal}
                        disabled={newOutfitLabel.length === 0}
                    >
                        <IconCheck size={14} />
                    </Button>
                </Group>
            </Box>
        );
    }

    if (isImporting) {
        return (
            <Box style={{ animation: 'fadeScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <Text fw={600} mb="sm" size="sm" c="white" tt="uppercase">
                    {locale?.IMPORTOUTFIT_TITLE || 'Import Outfit'}
                </Text>
                <Group spacing="xs">
                    <Input
                        size="sm"
                        placeholder="Outfit Code"
                        type="number"
                        value={importOutfitId}
                        onChange={(e) => setImportOutfitId(parseInt(e.currentTarget.value) || 0)}
                    />
                    <Button size="xs" color="red" onClick={resetImportFields}>
                        <IconCancel size={14} />
                    </Button>
                    <Button
                        size="xs"
                        color="green"
                        onClick={onImport}
                        disabled={importOutfitId <= 0}
                    >
                        <IconCheck size={14} />
                    </Button>
                </Group>
            </Box>
        );
    }

    return (
        <Stack spacing="sm">
            <Button
                fullWidth
                size="sm"
                leftIcon={<IconPlus size={16} />}
                onClick={() => setIsAdding(true)}
            >
                {locale?.ADDOUTFIT_TITLE || 'Add Personal Outfit'}
            </Button>

            {jobDataIsBoss && (
                <Button
                    fullWidth
                    size="sm"
                    leftIcon={<IconPlus size={16} />}
                    onClick={() => setIsJobAdding(true)}
                    variant="light"
                >
                    {locale?.ADDJOBOUTFIT || 'Add Job Outfit'}
                </Button>
            )}

            <Button
                fullWidth
                size="sm"
                leftIcon={<IconImport size={16} />}
                onClick={() => setIsImporting(true)}
                variant="light"
            >
                {locale?.IMPORTOUTFIT_TITLE || 'Import Outfit'}
            </Button>
        </Stack>
    );
};

export default Outfits;
