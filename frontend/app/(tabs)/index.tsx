import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import MediaItem from '@/components/media-item';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Media = {
  source: any;
  isVideo?: boolean;
};

// Initial media items
const INITIAL_MEDIA: Media[] = [
  { source: require('@/assets/images/partial-react-logo.png') },
  { source: require('@/assets/images/partial-react-logo.png') },
  { source: require('@/assets/images/partial-react-logo.png') },
];

export default function HomeScreen() {
  const [mediaItems, setMediaItems] = useState<Media[]>(INITIAL_MEDIA);
  const [saved, setSaved] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const flatListRef = useRef<FlatList<Media>>(null);

  const handleSave = () => {
    setSaved(!saved);
    console.log('Saved button pressed!');
  };

  // Called when visible items change (for autoplay)
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length === 0) return;

      const index = viewableItems[0].index ?? 0;
      setActiveIndex(index);
      console.log('Visible item index:', index, 'Total items:', mediaItems.length, 'HasReachedEnd:', hasReachedEnd, 'LoadCount:', loadCount);

      // Check if we've reached the last item and no more media can be loaded
      if (index === mediaItems.length - 1) {
        console.log('At last item! Checking if we can load more...');
        
        if (loadCount >= 3) {
          console.log('Load limit reached, preparing to loop back to top...');
          setTimeout(() => {
            console.log('Looping back to top now!');
            flatListRef.current?.scrollToIndex({ 
              index: 0, 
              animated: false
            });
            setActiveIndex(0);
          }, 1500);
        } else {
          console.log('Can still load more media, not looping yet');
        }
      }
    },
    [mediaItems.length, loadCount, hasReachedEnd]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Load more media when reaching the end
  const loadMoreMedia = useCallback(() => {
    if (isLoading) {
      console.log('📱 Already loading, skipping...');
      return;
    }

    if (loadCount >= 3) { // Reduced to 3 for easier testing
      console.log('Maximum load count reached (3), no more events to load.');
      console.log('Setting hasReachedEnd to true - looping will now be enabled');
      setHasReachedEnd(true);
      return;
    }

    console.log(`Loading more media... (Load count: ${loadCount + 1}/3)`);
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const moreMedia: Media[] = [
        { source: require('@/assets/images/partial-react-logo.png') },
        { source: require('@/assets/images/partial-react-logo.png') },
      ];

      setMediaItems((prev) => {
        const newItems = [...prev, ...moreMedia];
        console.log('More media loaded successfully. Total items:', newItems.length);
        return newItems;
      });
      setLoadCount((prev) => prev + 1);
      setIsLoading(false);
    }, 500);
  }, [loadCount, isLoading]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mediaItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <MediaItem source={item.source} isVideo={item.isVideo} play={index === activeIndex} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        snapToAlignment="start"
        decelerationRate="fast"
        removeClippedSubviews={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={loadMoreMedia}
        onEndReachedThreshold={0.3}
      />

      {/* Overlay header */}
      <View style={styles.overlayHeader}>
        <Text style={styles.headerText}>Events</Text>
      </View>

      {/* Overlay save button */}
      <View style={styles.overlaySaveButton}>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>{saved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
        
        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Items: {mediaItems.length} | Loads: {loadCount}/3
          </Text>
          <Text style={styles.debugText}>
            Active: {activeIndex} | End: {hasReachedEnd ? 'Yes' : 'No'}
          </Text>
          {isLoading && (
            <Text style={styles.debugText}>Loading...</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlaySaveButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  debugInfo: {
    alignItems: 'flex-end',
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 2,
    borderRadius: 2,
    marginBottom: 2,
  },
});