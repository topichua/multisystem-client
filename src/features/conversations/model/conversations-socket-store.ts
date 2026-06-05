import { makeAutoObservable, runInAction } from "mobx";
import { io, type Socket } from "socket.io-client";

import type {
  ConversationsRealtimeConnectOptions,
  ConversationsUpdateHandler,
  ConversationsUpdatePayload,
} from "@/features/conversations/realtime/conversations-realtime.types";

export class ConversationsSocketStore {
  connected = false;

  private socket: Socket | null = null;
  private currentJwt: string | null = null;
  private connectOptions: ConversationsRealtimeConnectOptions = {};
  private readonly subscribedConversationIds = new Set<number>();
  private readonly updateHandlers = new Set<ConversationsUpdateHandler>();

  constructor() {
    makeAutoObservable(this);
  }

  get subscribedConversationIdsSnapshot(): number[] {
    return [...this.subscribedConversationIds];
  }

  connect = (
    apiBaseUrl: string,
    jwt: string,
    options?: ConversationsRealtimeConnectOptions,
  ): void => {
    if (!apiBaseUrl) {
      return;
    }

    this.connectOptions = options ?? {};

    if (this.socket?.connected === true && this.currentJwt === jwt) {
      return;
    }

    this.disconnectSocketOnly();

    this.currentJwt = jwt;

    this.socket = io(`${apiBaseUrl.replace(/\/$/, "")}/conversations`, {
      auth: { token: jwt },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    this.bindSocketListeners();
  };

  disconnect = (): void => {
    this.subscribedConversationIds.clear();
    this.currentJwt = null;
    this.connectOptions = {};
    this.disconnectSocketOnly();

    runInAction(() => {
      this.connected = false;
    });
  };

  subscribe = (conversationId: number): void => {
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return;
    }

    this.subscribedConversationIds.add(conversationId);
    this.socket?.emit("subscribe", { conversationId });
  };

  unsubscribe = (conversationId: number): void => {
    this.subscribedConversationIds.delete(conversationId);
    this.socket?.emit("unsubscribe", { conversationId });
  };

  onUpdate = (handler: ConversationsUpdateHandler): (() => void) => {
    this.updateHandlers.add(handler);

    return () => {
      this.updateHandlers.delete(handler);
    };
  };

  private disconnectSocketOnly = (): void => {
    if (this.socket == null) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  };

  private resubscribeAll = (): void => {
    if (this.socket?.connected !== true) {
      return;
    }

    for (const conversationId of this.subscribedConversationIds) {
      this.socket.emit("subscribe", { conversationId });
    }
  };

  private dispatchUpdate = (payload: ConversationsUpdatePayload): void => {
    for (const handler of this.updateHandlers) {
      handler(payload);
    }
  };

  private bindSocketListeners = (): void => {
    if (this.socket == null) {
      return;
    }

    this.socket.off("connect");
    this.socket.off("conversations.update");
    this.socket.off("error");

    this.socket.on("connect", () => {
      runInAction(() => {
        this.connected = true;
      });
      this.resubscribeAll();
    });

    this.socket.on("disconnect", () => {
      runInAction(() => {
        this.connected = false;
      });
    });

    this.socket.on(
      "conversations.update",
      (payload: ConversationsUpdatePayload) => {
        this.dispatchUpdate(payload);
      },
    );

    this.socket.on("error", (err: { message?: string }) => {
      console.error("Conversations WebSocket auth error:", err?.message);
      this.connectOptions.onAuthError?.();
      this.disconnect();
    });
  };
}
