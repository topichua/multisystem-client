import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import { InstagramMediaCard } from "./instagram-media-card";
import * as S from "../../instagram-page.styled";

type InstagramMediaGridProps = {
  posts: InstagramMediaItem[];
  hasProductReference: (mediaId: string) => boolean;
  productIdsByMediaId: Map<string, string[]>;
  onPostClick: (post: InstagramMediaItem) => void;
};

export const InstagramMediaGrid = ({
  posts,
  hasProductReference,
  productIdsByMediaId,
  onPostClick,
}: InstagramMediaGridProps) => (
  <S.PostsGrid>
    {posts.map((post) => (
      <InstagramMediaCard
        key={post.id}
        post={post}
        linkedToProduct={hasProductReference(post.id)}
        productIds={productIdsByMediaId.get(post.id) ?? []}
        onPostClick={onPostClick}
      />
    ))}
  </S.PostsGrid>
);
