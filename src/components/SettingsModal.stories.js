import SettingsModal from './SettingsModal.svelte';

export default {
  title: 'Components/SettingsModal',
  component: SettingsModal,
  tags: ['autodocs'],
};

export const Closed = {
  args: {
    isOpen: false,
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    onReload: () => console.log('Reload clicked'),
  },
};

export const Open = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close clicked'),
    onSave: () => console.log('Save clicked'),
    onReload: () => console.log('Reload clicked'),
  },
};
