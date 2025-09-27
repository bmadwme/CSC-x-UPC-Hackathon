import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode  } from 'expo-av';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type MediaItemProps = {
  source: any; // Can be local require() or remote URL
  isVideo?: boolean;
  play?: boolean; // autoplay if visible
};

export default function MediaItem({ source, isVideo = false, play = false }: MediaItemProps) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (play) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [play, isVideo]);

  return (
    <View style={styles.container}>
      {isVideo ? (
        <Video
          ref={videoRef}
          source={source}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={play}
        />
      ) : (
        <Image source={source} style={styles.media} resizeMode="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    height: '100%',
    width: '100%',
  },
});
