import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { searchTracks, saveUserTrack } from '../services/spotifyApi';
import { Track } from '../types';

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
  onSongAdded: (track: Track) => void;
  existingTrackIds: string[];
}

const AddSongModal: React.FC<AddSongModalProps> = ({
  open,
  onClose,
  onSongAdded,
  existingTrackIds,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const data = await searchTracks(query);
      const formatted = data.tracks.items.map((item: any) => ({
        id: item.id,
        title: item.name,
        artist: item.artists[0].name,
        albumArt: item.album.images[0]?.url,
        album: item.album.name || '',
        addedAt: '',
        duration: '',
      }));
      setResults(formatted);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error searching tracks',
      });
    }
  };

  const handleAdd = async (track: Track) => {
    try {
      await saveUserTrack(track.id);
      onSongAdded(track);
      Toast.show({
        type: 'success',
        text1: `Added "${track.title}"`,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error adding track',
      });
    }
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add a Song</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a song"
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.resultsContainer}>
            {results.map((track) => {
              const alreadySaved = existingTrackIds.includes(track.id);
              return (
                <View key={track.id} style={styles.resultItem}>
                  <View style={styles.resultLeft}>
                    <Image
                      source={{ uri: track.albumArt }}
                      style={styles.avatar}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackArtist}>{track.artist}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      alreadySaved && styles.disabledButton,
                    ]}
                    disabled={alreadySaved}
                    onPress={() => handleAdd(track)}
                  >
                    <Text style={styles.buttonText}>
                      {alreadySaved ? 'Saved' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 100
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#282828',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: 'white',
    marginRight: 8,
    minHeight: 40
  },
  searchButton: {
    backgroundColor: '#1ED760',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#282828',
    borderBottomWidth: 1,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textContainer: {
    flexShrink: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#1ED760',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#24472d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'flex-end',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    color: 'white',
  },
});

export default AddSongModal;
