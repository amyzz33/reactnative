// StoryTray.js
// React Native CLI version (NOT Expo)

import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import { storyApi } from '../utils/storyApi';
import { getCurrentUser } from '../utils/auth';

/* ---------------- Component ---------------- */

const StoryTray = ({
  onCompose,
  onOpen,
}) => {
  const [loading, setLoading] =
    useState(true);

  const [groups, setGroups] =
    useState([]);

  const me = getCurrentUser();

  const myId = me?.id;

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await storyApi.feed();

      const data =
        res?.success &&
        Array.isArray(res.data)
          ? res.data
          : [];

      setGroups(data);
    } catch (err) {
      console.log(
        'Failed to load stories',
        err
      );

      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Split Own + Others ---------------- */

  const myGroup = groups.find(
    (g) =>
      String(
        g.user?._id || g.user?.id
      ) === String(myId)
  );

  const otherGroups = groups.filter(
    (g) =>
      String(
        g.user?._id || g.user?.id
      ) !== String(myId)
  );

  /* ---------------- Long Press ---------------- */

  const handleOwnPress = () => {
    if (myGroup) {
      onOpen?.(String(myId));
    } else {
      onCompose?.();
    }
  };

  const handleOwnLongPress = () => {
    onCompose?.();
  };

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          color="#E53935"
        />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.row
        }
      >
        {/* Your Story */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.storyItem}
          onPress={handleOwnPress}
          onLongPress={
            handleOwnLongPress
          }
          delayLongPress={500}
        >
          <View
            style={[
              styles.storyRing,
              styles.composeRing,
            ]}
          >
            {myGroup?.user
              ?.profilePic ? (
              <Image
                source={{
                  uri:
                    myGroup.user
                      .profilePic,
                }}
                style={
                  styles.storyImage
                }
              />
            ) : (
              <View
                style={
                  styles.emptyStory
                }
              />
            )}

            <View style={styles.plus}>
              <Text
                style={
                  styles.plusText
                }
              >
                +
              </Text>
            </View>
          </View>

          <Text style={styles.storyName}>
            Your story
          </Text>
        </TouchableOpacity>

        {/* Other Stories */}
        {otherGroups.map((g) => {
          const u = g.user || {};

          const username =
            u.username || 'rider';

          const userId = String(
            u._id || u.id || ''
          );

          return (
            <TouchableOpacity
              key={userId}
              activeOpacity={0.85}
              style={styles.storyItem}
              onPress={() =>
                onOpen?.(userId)
              }
            >
              <View
                style={[
                  styles.storyRing,
                  g.allViewed
                    ? styles.viewedRing
                    : styles.freshRing,
                ]}
              >
                {u.profilePic ? (
                  <Image
                    source={{
                      uri:
                        u.profilePic,
                    }}
                    style={
                      styles.storyImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.fallback
                    }
                  >
                    <Text
                      style={
                        styles.fallbackText
                      }
                    >
                      {username
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={
                  styles.storyName
                }
              >
                {username}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default StoryTray;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: '#0d1117',
  },

  loading: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    paddingHorizontal: 12,
  },

  storyItem: {
    alignItems: 'center',
    width: 78,
    marginRight: 14,
  },

  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,

    justifyContent: 'center',
    alignItems: 'center',

    padding: 3,
  },

  composeRing: {
    borderWidth: 2,
    borderColor: '#374151',
  },

  freshRing: {
    borderWidth: 2.5,
    borderColor: '#E53935',
  },

  viewedRing: {
    borderWidth: 2.5,
    borderColor: '#4b5563',
  },

  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },

  emptyStory: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1f2937',
  },

  plus: {
    position: 'absolute',
    bottom: -2,
    right: -2,

    width: 24,
    height: 24,
    borderRadius: 12,

    backgroundColor: '#E53935',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 2,
    borderColor: '#0d1117',
  },

  plusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },

  storyName: {
    marginTop: 8,
    color: '#f9fafb',
    fontSize: 12,
    textAlign: 'center',
  },

  fallback: {
    width: '100%',
    height: '100%',
    borderRadius: 999,

    backgroundColor: '#374151',

    justifyContent: 'center',
    alignItems: 'center',
  },

  fallbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
});
