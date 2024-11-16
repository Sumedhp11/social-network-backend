import { Server } from "socket.io";
import { socketEvents } from "./helpers/constants";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import { v4 as uuid } from "uuid";
import { getSockets } from "./helpers/helper";
import Message from "./models/messageSchema";
import prisma from "./config/dbConfig";

export const userSocketIDs = new Map();
const onlineUsers = new Set();

const setupSocket = async (io: Server) => {
  try {
    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
      const user = socket.data.user;

      if (user) {
        console.log(
          `User connected: ${user.userId} with socket ID: ${socket.id}`
        );

        userSocketIDs.set(user.userId, socket.id);
        onlineUsers.add(user.userId);

        io.emit(socketEvents.JOINED, Array.from(onlineUsers));
      }

      socket.on(
        socketEvents.NEW_MESSAGE,
        async ({
          chatId,
          memberIds,
          message,
        }: {
          chatId: number;
          memberIds: number[];
          message: string;
        }) => {
          try {
            if (!memberIds || !message) {
              return console.error("Invalid message payload received");
            }
            if (!chatId) {
              const newChat = await prisma.chat.create({
                data: {
                  members: {
                    create: memberIds.map((userId) => ({
                      user: { connect: { id: userId } },
                    })),
                  },
                },
              });
              chatId = newChat.id;
            }

            const memberSockets = getSockets({ users: memberIds });

            const filteredMemberSockets = memberSockets.filter(
              (sockets) => sockets !== socket.id
            );

            filteredMemberSockets.forEach((memberSocket) => {
              io.to(memberSocket).emit(socketEvents.NEW_MESSAGE_ALERT, {
                chatId,
                message,
              });
            });
            const status = filteredMemberSockets.map((i) => ({
              userId: user.id,
              delivered_at: null,
              seen_at: null,
            }));

            const savedMessage = await Message.create({
              chatId,
              message,
              senderId: user.userId,
              status: status,
            });
            await prisma.chat.update({
              data: {
                last_message: message,
              },
              where: {
                id: chatId,
              },
            });
            memberSockets.forEach((memberSocket) => {
              io.to(memberSocket).emit(socketEvents.NEW_MESSAGE, {
                chatId,
                messageForRealTime: savedMessage,
              });
            });
          } catch (error: any) {
            console.error(`Error processing new message: ${error.message}`);
          }
        }
      );

      socket.on(
        socketEvents.STARTED_TYPING,
        async ({
          chatId,
          memberIds,
        }: {
          chatId: number;
          memberIds: number[];
        }) => {
          console.log(memberIds, 108);

          const memberSockets = getSockets({ users: memberIds });
          const filteredMemberSockets = memberSockets.filter(
            (sockets) => sockets !== socket.id
          );

          socket
            .to(filteredMemberSockets)
            .emit(socketEvents.STARTED_TYPING, { chatId });
        }
      );
      socket.on(
        socketEvents.STOPPED_TYPING,
        async ({
          memberIds,
          chatId,
        }: {
          memberIds: number[];
          chatId: number;
        }) => {
          const memberSockets = getSockets({ users: memberIds });
          const filteredMemberSockets = memberSockets.filter(
            (sockets) => sockets !== socket.id
          );
          socket
            .to(filteredMemberSockets)
            .emit(socketEvents.STOPPED_TYPING, { chatId });
        }
      );

      socket.on(
        socketEvents.MESSAGE_SEEN,
        async ({
          chatId,
          memberId,
          messageIds,
        }: {
          chatId: number;
          memberId: number;
          messageIds: string[];
        }) => {
          try {
            if (messageIds.length === 0) return;
            console.log("Worked!", 158);
            console.log(messageIds, 159);

            try {
              const result = await Message.updateMany(
                { _id: { $in: messageIds } },
                { $set: { seen_at: new Date() } }
              );
              console.log(result, 165);
            } catch (error) {
              console.log(error, 167);
            }

            const memberSockets = getSockets({ users: [memberId] });
            const filteredMemberSockets = memberSockets.filter(
              (sockets) => sockets !== socket.id
            );

            filteredMemberSockets.forEach((memberSocket) => {
              io.to(memberSocket).emit(socketEvents.MESSAGE_SEEN, {
                chatId,
                messageIds,
                seenBy: memberId,
              });
            });
          } catch (error) {
            console.error("Error updating message seen status:", error);
          }
        }
      );
      socket.on(socketEvents.CALL_USER, async ({ recipientId, offer }) => {
        const recipientSocket = userSocketIDs.get(recipientId);
        if (recipientSocket) {
          const caller = await prisma.user.findFirst({
            where: {
              id: user.userId,
            },
            select: {
              avatarUrl: true,
              username: true,
              id: true,
            },
          });

          io.to(recipientSocket).emit(socketEvents.INCOMING_CALL, {
            from: caller,
            offer,
          });
        }
      });

      socket.on(socketEvents.ANSWER_CALL, ({ recipientId, answer }) => {
        const recipientSocket = userSocketIDs.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit(socketEvents.CALL_ACCEPTED, {
            answer,
            from: user.userId,
          });
        }
      });

      socket.on(socketEvents.ICE_CANDIDATE, ({ recipientId, candidate }) => {
        const recipientSocket = userSocketIDs.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit(socketEvents.ICE_CANDIDATE, {
            candidate,
            from: user.userId,
          });
        }
      });

      socket.on(
        socketEvents.END_CALL,
        ({ recipientId }: { recipientId: number }) => {
          const recipientSocket = userSocketIDs.get(recipientId);
          console.log("Emitted", 230);

          if (recipientSocket) {
            io.to(recipientSocket).emit(socketEvents.CALL_ENDED, {
              from: user.userId,
            });
          }
        }
      );
      socket.on("disconnect", () => {
        if (user) {
          onlineUsers.delete(user.userId);
          userSocketIDs.delete(user.userId);

          io.emit(socketEvents.EXITED, Array.from(onlineUsers));
          console.log(`User disconnected: ${user.userId}`);
        }
      });
    });
  } catch (error: any) {
    console.error(`Socket setup error: ${error.message}`);
  }
};

export { setupSocket };
