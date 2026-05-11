// PostCard.js
// React Native CLI version (NOT Expo)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import { getCurrentUser } from '../utils/auth';

/* ---------------- Icons ---------------- */

// npm install react-native-vector-icons
import Icon from 'react-native-vector-icons/Feather';

/* ---------------- Helpers ---------------- */

export function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr} hr`;
  if (diffDay < 7) return `${diffDay}d`;

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    }
  );
}

export function formatCount(n) {
  if (n == null) return '0';

  if (n < 1000) return String(n);

  if (n < 1000000) {
    return (n / 1000).toFixed(1) + ' K';
  }

  return (n / 1000000).toFixed(1) + ' M';
}

function pollClosesText(poll) {
  if (poll.closed) return 'Poll closed';

  if (!poll.closesAt) return null;

  const ms =
    new Date(poll.closesAt).getTime() -
    Date.now();

  if (ms <= 0) return 'Poll closed';

  const min = Math.floor(ms / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day >= 1) {
    return `Closes in ${day} day${
      day > 1 ? 's' : ''
    }`;
  }

  if (hr >= 1) {
    return `Closes in ${hr} hour${
      hr > 1 ? 's' : ''
    }`;
  }

  return `Closes in ${min} min`;
}

/* ---------------- Poll Block ---------------- */

const PollBlock = ({
  post,
  onVote,
}) => {
  if (
    !post?.poll ||
    !Array.isArray(post.poll.options) ||
    post.poll.options.length === 0
  ) {
    return null;
  }

  const poll = post.poll;

  const currentUser = getCurrentUser();

  const myId = currentUser?.id
    ? String(currentUser.id)
    : null;

  const isExpired =
    poll.closed ||
    (poll.closesAt &&
      new Date(poll.closesAt).getTime() <=
        Date.now());

  const totalVotes = poll.options.reduce(
    (sum, o) =>
      sum +
      (Array.isArray(o.votes)
        ? o.votes.length
        : 0),
    0
  );

  return (
    <View style={styles.pollBlock}>
      {poll.options.map((opt) => {
        const count = Array.isArray(opt.votes)
          ? opt.votes.length
          : 0;

        const pct = totalVotes
          ? Math.round(
              (count / totalVotes) * 100
            )
          : 0;

        const myVote =
          myId &&
          Array.isArray(opt.votes) &&
          opt.votes.some(
            (v) =>
              String(v?._id || v) === myId
          );

        return (
          <TouchableOpacity
            key={opt._id || opt.id}
            disabled={isExpired}
            onPress={() =>
              onVote?.(
                post._id,
                opt._id || opt.id
              )
            }
            style={[
              styles.pollOption,
              myVote &&
                styles.pollOptionVoted,
              isExpired &&
                styles.pollOptionClosed,
            ]}
          >
            <View
              style={[
                styles.pollFill,
                {
                  width: `${pct}%`,
                },
              ]}
            />

            <View
              style={
                styles.pollOptionRow
              }
            >
              <Text
                style={
                  styles.pollOptionLabel
                }
              >
                {myVote ? '★ ' : ''}
                {opt.label}
              </Text>

              <Text
                style={
                  styles.pollOptionPct
                }
              >
                {pct}%
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.pollMeta}>
        {`${totalVotes} vote${
          totalVotes === 1 ? '' : 's'
        }`}
        {poll.multiSelect
          ? ' · multi-choice'
          : ''}
        {pollClosesText(poll)
          ? ` · ${pollClosesText(poll)}`
          : ''}
      </Text>
    </View>
  );
};

/* ---------------- Main Component ---------------- */

const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onPressComments,
  onPressUser,
  onVote,
}) => {
  const author = post.author || {};

  const username =
    author.username || 'unknown';

  const rawPic = author.profilePic;

  const avatarUrl = rawPic
    ? typeof rawPic === 'string'
      ? rawPic
      : rawPic.url || ''
    : '';

  const time = timeAgo(post.createdAt);

  const currentUser = getCurrentUser();

  const isLiked =
    currentUser &&
    Array.isArray(post.likes) &&
    post.likes.includes(currentUser.id);

  const likesCount =
    post.likesCount != null
      ? post.likesCount
      : Array.isArray(post.likes)
      ? post.likes.length
      : 0;

  const commentsCount =
    post.commentsCount || 0;

  const mediaItem =
    Array.isArray(post.media) &&
    post.media.length > 0
      ? post.media[0]
      : null;

  const content = post.content || '';

  const truncated =
    content.length > 150
      ? content.slice(0, 150) + '...'
      : content;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() =>
            onPressUser?.(author)
          }
        >
          {avatarUrl ? (
            <Image
              source={{
                uri: avatarUrl,
              }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={
                styles.avatarPlaceholder
              }
            />
          )}

          <Text style={styles.author}>
            {username}
          </Text>
        </TouchableOpacity>

        <Text style={styles.time}>
          · {time}
        </Text>
      </View>

      {/* Image */}
      {mediaItem ? (
        <Image
          source={{
            uri: mediaItem.url,
          }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : !post.poll ? (
        <View
          style={styles.imagePlaceholder}
        />
      ) : null}

      {/* Poll */}
      <PollBlock
        post={post}
        onVote={onVote}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            onLike?.(post)
          }
        >
          <Icon
            name="heart"
            size={22}
            color={
              isLiked
                ? '#E53935'
                : '#ffffff'
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            onComment?.(post)
          }
        >
          <Icon
            name="message-circle"
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            onShare?.(post)
          }
        >
          <Icon
            name="send"
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <Text style={styles.likes}>
        {formatCount(likesCount)} likes
      </Text>

      {/* Caption */}
      {content ? (
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>
            {username}{' '}
          </Text>

          {truncated}

          {content.length > 150 && (
            <Text
              style={styles.readMore}
            >
              {' '}
              read more...
            </Text>
          )}
        </Text>
      ) : null}

      {/* Comments Link */}
      {commentsCount > 0 && (
        <TouchableOpacity
          onPress={() =>
            onPressComments?.(post)
          }
        >
          <Text
            style={styles.commentsLink}
          >
            View all{' '}
            {formatCount(commentsCount)}{' '}
            comments
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostCard;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    marginBottom: 18,
    paddingBottom: 14,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#374151',
  },

  author: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  time: {
    color: '#9ca3af',
    marginLeft: 8,
    fontSize: 12,
  },

  postImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#1f2937',
  },

  imagePlaceholder: {
    width: '100%',
    height: 380,
    backgroundColor: '#1f2937',
  },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  actionBtn: {
    marginRight: 18,
  },

  likes: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  caption: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    marginTop: 6,
  },

  captionUser: {
    fontWeight: '700',
    color: '#fff',
  },

  readMore: {
    color: '#9ca3af',
  },

  commentsLink: {
    color: '#6b7280',
    fontSize: 13,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  /* Poll */

  pollBlock: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  pollOption: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },

  pollOptionVoted: {
    borderWidth: 1,
    borderColor: '#E53935',
  },

  pollOptionClosed: {
    opacity: 0.7,
  },

  pollFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#374151',
  },

  pollOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  pollOptionLabel: {
    color: '#fff',
    fontSize: 14,
    zIndex: 2,
  },

  pollOptionPct: {
    color: '#d1d5db',
    fontWeight: '700',
    zIndex: 2,
  },

  pollMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
});
