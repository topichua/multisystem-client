import { ChatCircleIcon, HeartIcon, ImagesIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Avatar, Button, Flex, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  InstagramAccountProfile,
  InstagramMediaItem,
} from '@/features/products/model/instagram-media.types';
import {
  getPostCoverUrl,
  getPostMediaSlides,
  isVideoFileUrl,
} from '@/features/products/utils/instagram-media-display';

import { InstagramAiMediaCarousel } from './instagram-ai-media-carousel';

const { Text, Paragraph, Title, Link } = Typography;

export type InstagramAiPanelProps = {
  posts: InstagramMediaItem[];
  accountProfile?: InstagramAccountProfile | null;
  fallbackAccountName?: string;
  postsLoading?: boolean;
  postsError?: string | null;
  selectedPostId: string | null;
  onSelectPost: (postId: string) => void;
  onRefresh: () => void;
  analyzeBusy: boolean;
  submitLoading: boolean;
  analyzeError?: string | null;
  onAnalyzeAndFill: () => void | Promise<void>;
};

export const InstagramAiPanel = ({
  posts,
  accountProfile,
  fallbackAccountName,
  postsLoading = false,
  postsError = null,
  selectedPostId,
  onSelectPost,
  onRefresh,
  analyzeBusy,
  submitLoading,
  analyzeError = null,
  onAnalyzeAndFill,
}: InstagramAiPanelProps) => {
  const { t } = useTranslation();

  const selectedPost = useMemo(
    () => (selectedPostId != null ? (posts.find((p) => p.id === selectedPostId) ?? null) : null),
    [posts, selectedPostId],
  );

  const displayName =
    accountProfile?.name ?? accountProfile?.username ?? fallbackAccountName ?? '—';
  const displayBio = accountProfile?.biography?.trim() || t('products.instagram.noBio');
  const avatarSrc = accountProfile?.profilePictureUrl;

  const carouselSlides = useMemo(
    () => (selectedPost ? getPostMediaSlides(selectedPost) : []),
    [selectedPost],
  );

  return (
    <Spin spinning={postsLoading}>
      <Flex
        gap={0}
        style={{
          minHeight: 480,
          height: '100%',
          border: '1px solid var(--ant-color-border, #d9d9d9)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Flex
          vertical
          gap={16}
          style={{
            flex: '0 0 320px',
            maxWidth: 320,
            padding: 16,
            borderRight: '1px solid var(--ant-color-border, #d9d9d9)',
            background: 'var(--ant-color-bg-container, #fff)',
            overflow: 'hidden',
          }}
        >
          <Flex align="flex-start" gap={12}>
            <Avatar src={avatarSrc} size={48}>
              {displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text strong ellipsis>
                {displayName}
              </Text>
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 3 }}
                style={{ fontSize: 12, marginBottom: 0 }}
              >
                {displayBio}
              </Paragraph>
            </Flex>
            <Button
              type="text"
              icon={<ArrowClockwiseIcon size={20} />}
              onClick={onRefresh}
              loading={postsLoading}
              aria-label={t('products.instagram.refreshPosts')}
            />
          </Flex>

          {postsError ? <Text type="danger">{postsError}</Text> : null}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              alignContent: 'start',
            }}
          >
            {posts.map((post) => {
              const cover = getPostCoverUrl(post);
              const isSelected = post.id === selectedPostId;
              const carouselCount = post.children?.length ?? 0;
              const coverIsVideo = cover != null && isVideoFileUrl(cover);

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onSelectPost(post.id)}
                  style={{
                    position: 'relative',
                    padding: 0,
                    border: isSelected
                      ? '2px solid var(--ant-color-primary, #1677ff)'
                      : '1px solid var(--ant-color-border, #d9d9d9)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'var(--ant-color-fill-quaternary, #f5f5f5)',
                    aspectRatio: '1',
                  }}
                >
                  {cover && !coverIsVideo ? (
                    <img
                      src={cover}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : cover && coverIsVideo ? (
                    <video
                      src={cover}
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : null}

                  {post.media_type === 'CAROUSEL_ALBUM' && carouselCount > 1 ? (
                    <Tag
                      style={{
                        position: 'absolute',
                        right: 4,
                        bottom: 4,
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: 10,
                        lineHeight: 1.2,
                        padding: '0 4px',
                      }}
                    >
                      <ImagesIcon size={12} aria-hidden />
                      {carouselCount}
                    </Tag>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Flex>

        <Flex
          vertical
          gap={16}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 20,
            overflowY: 'auto',
            background: 'var(--ant-color-bg-layout, #fafafa)',
          }}
        >
          {selectedPost ? (
            <>
              <InstagramAiMediaCarousel slides={carouselSlides} />

              <Flex vertical gap={8}>
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                  <Flex align="center" gap={16}>
                    <Text
                      type="secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <HeartIcon size={16} aria-hidden />
                      {selectedPost.like_count}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <ChatCircleIcon size={16} aria-hidden />
                      {selectedPost.comments_count}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(selectedPost.timestamp).format('LL LTS')}
                    </Text>
                  </Flex>
                </Flex>

                {selectedPost.caption ? (
                  <Paragraph
                    ellipsis={{ rows: 6, expandable: true, symbol: 'more' }}
                    style={{ marginBottom: 0 }}
                  >
                    {selectedPost.caption}
                  </Paragraph>
                ) : (
                  <Text type="secondary" italic>
                    {t('products.instagram.noCaption')}
                  </Text>
                )}

                <Link href={selectedPost.permalink} target="_blank" rel="noopener noreferrer">
                  {t('products.instagram.openOnInstagram')}
                </Link>
              </Flex>

              <Flex gap={6} vertical>
                <Title level={4} style={{ margin: 0 }}>
                  {t('products.instagram.fillFormHeading')}
                </Title>
                <Text>{t('products.instagram.fillFormIntro')}</Text>
                <Title level={5} style={{ margin: '8px 0 0' }}>
                  {t('products.instagram.fillFormWhatTitle')}
                </Title>
                <Text>✓ {t('products.instagram.fillFormItemName')}</Text>
                <Text>✓ {t('products.instagram.fillFormItemCategory')}</Text>
                <Text>✓ {t('products.instagram.fillFormItemPrice')}</Text>
                <Text>✓ {t('products.instagram.fillFormItemMedia')}</Text>
                <Text>✓ {t('products.instagram.fillFormItemVariants')}</Text>
              </Flex>

              <Button
                type="primary"
                size="large"
                loading={analyzeBusy || submitLoading}
                onClick={() => void onAnalyzeAndFill()}
                style={{ alignSelf: 'flex-start' }}
              >
                {t('products.instagram.analyzeFillButton')}
              </Button>

              {analyzeError ? <Text type="danger">{analyzeError}</Text> : null}
            </>
          ) : (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: 320 }}>
              <Text type="secondary">{t('products.instagram.selectPostHint')}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Spin>
  );
};
