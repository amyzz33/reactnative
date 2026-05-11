// ClubCard.js
// React Native version of the Bikers Hub club card component (without Expo)

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';

// Replace with your own helper if needed
const formatCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return `${count}`;
};

const PLACEHOLDER_COLORS = ['#1f2937', '#374151'];

const ClubCard = ({ club, mode = 'discover', onPress, onJoin }) => {
  const coverImage = club?.coverImage;
  const name = club?.name || 'Unnamed Club';

  const privacy = club?.privacy || 'public';

  const membersCount =
    club?.membersCount != null
      ? club.membersCount
      : Array.isArray(club?.members)
      ? club.members.length
      : 0;

  const CardContent = () => (
    <View style={styles.overlay}>
      <Text style={styles.name}>{name}</Text>

      {mode !== 'manage' && (
        <>
          <Text style={styles.meta}>
            {privacy} · {formatCount(membersCount)}
          </Text>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoin?.(club)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(club)}
      style={styles.card}
    >
      {coverImage ? (
        <ImageBackground
          source={{ uri: coverImage }}
          style={styles.background}
          imageStyle={styles.image}
        >
          <CardContent />
        </ImageBackground>
      ) : (
        <View
          style={[
            styles.background,
            {
              backgroundColor: PLACEHOLDER_COLORS[0],
            },
          ]}
        >
          <CardContent />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ClubCard;

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },

  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  image: {
    borderRadius: 16,
  },

  overlay: {
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  meta: {
    color: '#d1d5db',
    fontSize: 13,
    marginTop: 4,
  },

  joinButton: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  joinButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
});
