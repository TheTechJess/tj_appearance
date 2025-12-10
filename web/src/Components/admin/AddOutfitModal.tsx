import { FC, useState } from 'react';
import { Modal, Stack, Group, Button, TextInput, Select, Text } from '@mantine/core';
import { TriggerNuiCallback } from '../../Utils/TriggerNuiCallback';

interface JobOutfit {
  id?: number;
  job?: string;
  gang?: string;
  gender: 'male' | 'female';
  outfitName: string;
  outfitData: any;
}

interface AddOutfitModalProps {
  opened: boolean;
  onClose: () => void;
  onAddOutfit: (outfit: JobOutfit) => void;
}

export const AddOutfitModal: FC<AddOutfitModalProps> = ({ opened, onClose, onAddOutfit }) => {
  const [newOutfit, setNewOutfit] = useState<Partial<JobOutfit>>({ gender: 'male' });

  const handleClose = () => {
    setNewOutfit({ gender: 'male' });
    onClose();
  };

  const handleAdd = () => {
    if (!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang)) return;

    TriggerNuiCallback('addOutfit', newOutfit).then((result: any) => {
      const newOutfitItem: JobOutfit = {
        ...newOutfit,
        ...result,
        id: Date.now(),
      } as JobOutfit;
      onAddOutfit(newOutfitItem);
      handleClose();
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Job/Gang Outfit"
      centered
      zIndex={10000}
    >
      <Stack spacing="md">
        <TextInput
          label="Outfit Name"
          placeholder="Police Uniform"
          value={newOutfit.outfitName || ''}
          onChange={(e) => setNewOutfit({ ...newOutfit, outfitName: e.target.value })}
        />
        <Select
          label="Gender"
          value={newOutfit.gender || 'male'}
          onChange={(value) => setNewOutfit({ ...newOutfit, gender: value as 'male' | 'female' })}
          data={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
        />
        <TextInput
          label="Job (Optional)"
          placeholder="police"
          description="Leave blank if this is for a gang"
          value={newOutfit.job || ''}
          onChange={(e) => setNewOutfit({ ...newOutfit, job: e.target.value || undefined })}
        />
        <TextInput
          label="Gang (Optional)"
          placeholder="ballas"
          description="Leave blank if this is for a job"
          value={newOutfit.gang || ''}
          onChange={(e) => setNewOutfit({ ...newOutfit, gang: e.target.value || undefined })}
        />
        <Text c="dimmed" size="xs">
          Note: Outfit appearance data will be captured from your current character when you save.
        </Text>
        <Group position="right" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!newOutfit.outfitName || (!newOutfit.job && !newOutfit.gang)}
          >
            Add
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
