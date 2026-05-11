// CommentsModal.js
// React Native version of the Bikers Hub comments modal (without Expo)

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { api } from '../utils/api';
import { getCurrentUser } from '../utils/auth';

const CommentsModal = ({
  visible,
  postId,
  onClose,
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    if (!postId) return;

    setLoading(true);

    try {
      const res = await api.get(
        `/api/comments/${postId}?page=1&limit=50`
      );

      let fetchedComments = [];

      if (res.success && Array.isArray(res.data)) {
        fetchedComments = res.data;
      } else if (
        res.success &&
        res.data &&
        Array.isArray(res.data.comments)
      ) {
        fetchedComments = res.data.comments;
      }

      setComments(fetchedComments);
    } catch (err) {
      console.log('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    const content = commentText.trim();

    if (!content || !postId || sending) return;

    setSending(true);
    setCommentText('');

    try {
      const res = await api.post(
        `/api/comments/${postId}`,
        { content }
      );

      if (res.success) {
        loadComments();
      }
    } catch (err) {
      console.log('Failed to submit comment', err);
      setCommentText(content);
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({ item }) => {
    if (item.isDeleted) {
      return (
        <View style={styles.commentItem}>
          <View style={styles.avatarPlaceholder} />

          <View style={styles.commentBody}>
            <Text style={styles.deletedText}>
              [deleted]
            </Text>
          </View>
        </View>
      );
    }

    const author = item.author || {};

    const rawPic = author.profilePic;

    const profilePic = rawPic
      ? typeof rawPic === 'string'
        ? rawPic
        : rawPic.url || ''
      : '';

    const likesCount = Array.isArray(item.likes)
      ? item.likes.length
      : 0;

    return (
      <View style={styles.commentItem}>
        {profilePic ? (
          <Image
            source={{ uri: profilePic }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}

        <View style={styles.commentBody}>
          <Text style={styles.commentContent}>
            <Text style={styles.author}>
              {author.username || 'Unknown'}{' '}
            </Text>

            <Text style={styles.commentText}>
              {item.content || ''}
            </Text>
          </Text>

          <Text style={styles.meta}>
            {formatTimeAgo(item.createdAt)}
            {likesCount > 0
              ? ` · ${likesCount} likes`
              : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Comments
              </Text>

              <TouchableOpacity
                onPress={onClose}
              >
                <Text style={styles.close}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <View style={styles.listContainer}>
              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator />
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>
                    No comments yet. Be the first!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item._id}
                  renderItem={renderComment}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    padding: 20,
                  }}
                />
              )}
            </View>

            {/* Input */}
            <View style={styles.inputBar}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  sending && { opacity: 0.5 },
                ]}
                onPress={submitComment}
                disabled={sending}
              >
                <Text style={styles.sendText}>
                  ↑
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CommentsModal;

/* ---------------- Helpers ---------------- */

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';

  const diffMs =
    Date.now() - new Date(dateStr).getTime();

  const min = Math.floor(diffMs / 60000);

  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;

  const hr = Math.floor(min / 60);

  if (hr < 24) return `${hr}h`;

  const day = Math.floor(hr / 24);

  if (day < 7) return `${day}d`;

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    }
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  backdrop: {
    flex: 1,
  },

  sheet: {
    backgroundColor: '#0d1117',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
  },

  close: {
    fontSize: 28,
    color: '#9ca3af',
    lineHeight: 28,
  },

  listContainer: {
    minHeight: 120,
    flexGrow: 1,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },

  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    marginRight: 10,
  },

  commentBody: {
    flex: 1,
  },

  commentContent: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },

  author: {
    fontWeight: '700',
    color: '#f9fafb',
    fontSize: 13,
  },

  commentText: {
    color: '#d1d5db',
  },

  meta: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },

  deletedText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },

  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 14,
    maxHeight: 120,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
