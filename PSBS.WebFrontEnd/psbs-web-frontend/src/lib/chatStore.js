import { create } from "zustand";
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  ChangeChat: (chatId, user) => {
    set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
