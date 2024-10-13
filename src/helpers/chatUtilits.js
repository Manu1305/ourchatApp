// chatUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

// Fetch messages from the server
export const fetchMessages = async (chatId, token, setMessages, setReceiverInfo, setIsReceiverOnline, setLastSeen, setInchatScreen) => {
    try {
        const response = await fetch(
            `http://192.168.0.9:7000/api/v1/app/chat/${chatId}/0/20`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
                    'x-app-version': '1.0.1',
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.status === 401) {
            console.error('Unauthorized access');
            return;
        }

        const data = await response.json();
        if (data.success) {
            setReceiverInfo(data.data.receiverInfo);
            setMessages(data.data.allChats.reverse() || []);
            setIsReceiverOnline(data.data.receiverInfo.onlineStatus);
            setLastSeen(data.data.receiverInfo.lastSeen);
            setInchatScreen(data.data.inChatScreen);
        } else {
            console.error('Error fetching messages:', data.message);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

// Mark messages as seen
export const messageSeen = async (chatId, token) => {
    try {
        const response = await fetch(
            `http://192.168.0.9:7000/api/v1/app/chat/${chatId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
                    'x-app-version': '1.0.1',
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.status === 401) {
            console.error('Unauthorized access');
            return;
        }

        console.log('Message seen API success');
    } catch (error) {
        console.error('Error updating message status:', error);
    }
};

// Initialize socket connection and setup listeners
export const initializeSocket = (chatId, userId, recciverId, setMessages, setIsReceiverOnline, setLastSeen, setInchatScreen, inChatScreen) => {
    const socket = io('http://192.168.0.9:7000', { query: { userId } });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);

        socket.emit('online', {
            senderId: userId,
            status: true,
            chatId,
        });

        socket.emit('iaminchatScreen', {
            senderId: userId,
            receiverId: recciverId,
            status: true,
            chatId,
        });

        socket.on('newMessage', message => {
            console.log(message, 'message coming');
            if (message.chatId === chatId) {
                const updatedMessage = {
                    ...message,
                    seen: inChatScreen ? true : false,
                };
                setMessages(prevMessages => [...prevMessages, updatedMessage]);
            }
        });

        socket.on('userOnline', status => {
            if (status.chatId === chatId) {
                setIsReceiverOnline(status.isOnline);
                setLastSeen(status.lastSeen);
            }
        });

        socket.on('chatscreen', status => {
            if (status.chatId === chatId) {
                setInchatScreen(status.isInChatScreen);
            }
        });
    });

    return socket;
};

// Utility function to format date
export const formatDate = dateString => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// Format last seen date
export const formatDateLastSeen = dateString => {
    const date = new Date(dateString);
    const today = new Date();

    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let formattedDate = isToday ? 'Today' : isYesterday ? 'Yesterday' : date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedDate}, ${formattedHours}:${formattedMinutes} ${ampm}`;
};
