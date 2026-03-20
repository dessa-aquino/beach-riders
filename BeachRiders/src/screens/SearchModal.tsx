import React from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { useBeachStore } from '../store/useBeachStore';
import LocationSearch from '../components/LocationSearch';
import { Beach } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: Props) {
  const { setSelectedBeach, addFavorite } = useBeachStore();

  const handleSelect = async (beach: Beach) => {
    await setSelectedBeach(beach);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <LocationSearch onSelect={handleSelect} onClose={onClose} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1426' },
});
