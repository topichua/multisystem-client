import { makeAutoObservable, runInAction } from 'mobx';

import { aiApi } from '@/features/products/api/ai-api';
import {
  parseInstagramAnalyzeProductResponse,
  type InstagramAnalyzeProductResponse,
} from '@/features/products/model/instagram-analyze.types';
import {
  parseInstagramMediaResponse,
  type InstagramAccountProfile,
  type InstagramMediaItem,
} from '@/features/products/model/instagram-media.types';
import { unknownErrorMessage } from '@/utils/unknown-error-message';

export class AiToolsStore {
  postsList: InstagramMediaItem[] = [];
  accountProfile: InstagramAccountProfile | null = null;
  postsLoading = false;
  postsError: string | null = null;

  selectedPostId: string | null = null;
  analyzeLoading = false;
  analyzeError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedPostId = (id: string | null): void => {
    this.selectedPostId = id;
    this.analyzeError = null;
  };

  clearSelectedPost = (): void => {
    this.selectedPostId = null;
    this.analyzeError = null;
  };

  analyzeProduct = async (mediaId: string): Promise<InstagramAnalyzeProductResponse | null> => {
    runInAction(() => {
      this.analyzeLoading = true;
      this.analyzeError = null;
    });

    try {
      const raw = await aiApi.analyzeProduct(mediaId);
      const parsed = parseInstagramAnalyzeProductResponse(raw);
      if (parsed.ok === false) {
        const detail = parsed.reasons.join('; ');
        if (import.meta.env.DEV) {
          console.warn('[instagram analyze] parse failed', { reasons: parsed.reasons, raw });
        }
        runInAction(() => {
          this.analyzeError = detail
            ? `Invalid analyze response: ${detail}`
            : 'Invalid analyze response';
        });
        return null;
      }
      return parsed.value;
    } catch (e) {
      runInAction(() => {
        this.analyzeError = unknownErrorMessage(e);
      });
      return null;
    } finally {
      runInAction(() => {
        this.analyzeLoading = false;
      });
    }
  };

  loadPosts = async (): Promise<void> => {
    runInAction(() => {
      this.postsLoading = true;
      this.postsError = null;
    });

    try {
      const payload = await aiApi.getPosts();
      const { posts, profile } = parseInstagramMediaResponse(payload);
      runInAction(() => {
        this.postsList = posts;
        this.accountProfile = profile;
        this.selectedPostId = null;
        this.analyzeError = null;
      });
    } catch (e) {
      runInAction(() => {
        this.postsError = unknownErrorMessage(e);
        this.postsList = [];
        this.accountProfile = null;
      });
    } finally {
      runInAction(() => {
        this.postsLoading = false;
      });
    }
  };
}
