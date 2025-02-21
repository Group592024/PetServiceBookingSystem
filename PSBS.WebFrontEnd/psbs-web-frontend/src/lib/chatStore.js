import { create } from "zustand";
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isSupportChat: false,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  ChangeChat: (chatId, user, isSupport) => {
    set({
      chatId,
      user,
      isSupportChat: isSupport,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
