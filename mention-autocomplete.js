// MentionAutocompleteInput.js
// React Native CLI version (NOT Expo)

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';

import { api } from '../utils/api';

/* ---------------- Mention Parser ---------------- */

function findActiveMention(text, cursor) {
  const beforeCursor = text.slice(0, cursor);

  const match = beforeCursor.match(
    /(^|\s)@([a-zA-Z0-9_]{1,30})$/
  );

  if (!match) return null;

  const mentionText = match[2];

  const start =
    beforeCursor.lastIndexOf('@');

  return {
    start,
    end: cursor,
    match: mentionText,
  };
}

/* ---------------- Component ---------------- */

const MentionAutocompleteInput = ({
  value,
  onChangeText,
  placeholder = 'Write something...',
  multiline = true,
  style,
}) => {
  const inputRef = useRef(null);

  const [suggestions, setSuggestions] =
    useState([]);

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [selection, setSelection] =
    useState({
      start: 0,
      end: 0,
    });

  const debounceRef = useRef(null);

  /* ---------------- Fetch Suggestions ---------------- */

  const fetchSuggestions = async (
    query
  ) => {
    try {
      const res = await api.get(
        `/api/search?q=${encodeURIComponent(
          query
        )}&type=users`
      );

      const list =
        res?.success &&
        Array.isArray(res.data?.users)
          ? res.data.users
          : res?.success &&
            Array.isArray(res.data)
          ? res.data
          : [];

      const users = list
        .slice(0, 6)
        .map((u) => ({
          _id: u._id || u.id,
          username: u.username,
          profilePic: u.profilePic,
        }))
        .filter((u) => u.username);

      setSuggestions(users);
      setActiveIndex(0);
      setShowDropdown(users.length > 0);
    } catch (err) {
      console.log(
        'Mention search failed',
        err
      );
    }
  };

  /* ---------------- Text Change ---------------- */

  const handleChangeText = (text) => {
    onChangeText?.(text);

    const cursor = selection.start;

    const ctx = findActiveMention(
      text,
      cursor
    );

    if (!ctx || ctx.match.length < 1) {
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(
      () => {
        fetchSuggestions(ctx.match);
      },
      200
    );
  };

  /* ---------------- Apply Mention ---------------- */

  const applySelection = (user) => {
    if (!user) return;

    const cursor = selection.start;

    const ctx = findActiveMention(
      value,
      cursor
    );

    if (!ctx) return;

    const before = value.slice(
      0,
      ctx.start
    );

    const after = value.slice(ctx.end);

    const insertion = `@${user.username} `;

    const newText =
      before + insertion + after;

    onChangeText?.(newText);

    setShowDropdown(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  /* ---------------- Cleanup ---------------- */

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
    };
  }, []);

  /* ---------------- Render ---------------- */

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline={multiline}
        style={[styles.input, style]}
        selection={selection}
        onSelectionChange={(e) =>
          setSelection(
            e.nativeEvent.selection
          )
        }
      />

      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            keyExtractor={(item) =>
              item._id
            }
            renderItem={({
              item,
              index,
            }) => {
              const isActive =
                index === activeIndex;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.item,
                    isActive &&
                      styles.activeItem,
                  ]}
                  onPress={() =>
                    applySelection(item)
                  }
                >
                  {item.profilePic ? (
                    <Image
                      source={{
                        uri: item.profilePic,
                      }}
                      style={
                        styles.avatar
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.avatarPlaceholder
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {item.username
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <Text
                    style={styles.username}
                  >
                    @{item.username}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

export default MentionAutocompleteInput;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  input: {
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 50,
  },

  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,

    backgroundColor: '#1f2937',

    borderRadius: 14,

    overflow: 'hidden',

    zIndex: 999,

    borderWidth: 1,
    borderColor: '#374151',

    maxHeight: 280,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  activeItem: {
    backgroundColor: '#374151',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,

    marginRight: 12,
  },

  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,

    marginRight: 12,

    backgroundColor: '#4b5563',

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },

  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
