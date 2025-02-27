import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getUserSavedTracks, removeUserSavedTrack, saveUserTrack } from '../services/spotifyApi';
import Layout from '../components/Layout';
import MobileTrackItem from '../components/MobileTrackItem';
import AddSongModal from '../components/AddSongModal';

const formatDuration = (durationMs: number): string => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const SavedTracksPage: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracks = async () => {
    setRefreshing(true);
    try {
      const data = await getUserSavedTracks(true);
      const formatted = data.items.map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        albumArt: item.track.album.images[0]?.url,
        addedAt: new Date(item.added_at).toLocaleDateString(),
        duration: formatDuration(item.track.duration_ms)
      }));
      setTracks(formatted);
      setFilteredTracks(formatted);
    } catch (error) {
      console.error('Failed to load saved tracks', error);
      Toast.show({ type: 'error', text1: 'Failed to load saved tracks' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTracks(tracks);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(lowerQuery) ||
          track.artist.toLowerCase().includes(lowerQuery)
      );
      setFilteredTracks(filtered);
    }
  }, [searchQuery, tracks]);

const handleRemove = async (trackId: string) => {
  const trackToRemove = tracks.find((t) => t.id === trackId);
  if (!trackToRemove) return;
  setTracks((prev) => prev.filter((t) => t.id !== trackId));
  setFilteredTracks((prev) => prev.filter((t) => t.id !== trackId));
  try {
    await removeUserSavedTrack(trackId);
    Toast.show({
      type: 'undo',
      props: {
        trackTitle: trackToRemove.title,
        onUndo: () => undoRemoval(trackToRemove),
      },
      visibilityTime: 5000,
    });
  } catch (error) {
    console.error('Error removing track', error);
    Toast.show({ type: 'error', text1: 'Error removing track' });
  }
};

  const undoRemoval = async (track: any) => {
    try {
      await saveUserTrack(track.id);
      setTracks((prev) => [track, ...prev]);
      setFilteredTracks((prev) => [track, ...prev]);
      Toast.show({ type: 'success', text1: `Re-added "${track.title}"` });
    } catch (error) {
      console.error('Error re-adding track', error);
      Toast.show({ type: 'error', text1: 'Error re-adding track' });
    }
  };

  const handleSongAdded = (newTrack: any) => {
    setTracks((prev) => [newTrack, ...prev]);
    setFilteredTracks((prev) => [newTrack, ...prev]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <MobileTrackItem
      id={item.id}
      title={item.title}
      artist={item.artist}
      albumArt={item.albumArt}
      onRemove={handleRemove}
    />
  );

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.heading}>Saved Tracks</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or artist"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {refreshing && (
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 16 }} />
        )}
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTracks} tintColor="#fff" />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
        <AddSongModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSongAdded={handleSongAdded}
          existingTrackIds={tracks.map((track) => track.id)}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  searchInput: {
    backgroundColor: '#282828',
    borderRadius: 4,
    padding: 8,
    color: '#fff',
    marginBottom: 16
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#1ed760',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fabText: {
    fontSize: 24,
    color: '#fff'
  }
});

export default SavedTracksPage;
