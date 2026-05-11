// BottomTabBar.js
// React Native CLI version (NOT Expo)

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

// npm install react-native-vector-icons
import Icon from 'react-native-vector-icons/Feather';

/* ---------------- Tabs ---------------- */

const tabs = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: 'home',
  },
  {
    id: 'clubs',
    label: 'Club',
    path: '/clubs',
    icon: 'users',
  },
  {
    id: 'maps',
    label: 'Maps',
    path: '/maps',
    icon: 'map-pin',
  },
  {
    id: 'search',
    label: 'Search',
    path: '/search',
    icon: 'search',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: 'user',
  },
];

/* ---------------- Component ---------------- */

const BottomTabBar = ({
  activeTab,
  navigate,
}) => {
  return (
    <>
      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive =
            tab.id === activeTab;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() =>
                navigate?.(tab.path)
              }
            >
              <Icon
                name={tab.icon}
                size={22}
                color={
                  isActive
                    ? '#E53935'
                    : '#9ca3af'
                }
              />

              <Text
                style={[
                  styles.tabLabel,
                  isActive &&
                    styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>

              {isActive && (
                <View
                  style={styles.activeDot}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default BottomTabBar;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  spacer: {
    height: 82,
  },

  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    backgroundColor: '#0d1117',

    borderTopWidth: 1,
    borderTopColor: '#1f2937',

    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 28 : 14,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  activeLabel: {
    color: '#E53935',
    fontWeight: '700',
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,

    backgroundColor: '#E53935',

    marginTop: 4,
  },
});
