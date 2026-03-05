import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Bot, Loader2, User, Eye, ArrowLeft, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

// Parse markdown bold (**text**) to HTML
const parseMarkdown = (text: string) => {
   return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

interface Message {
   id: string;
   content: string;
   sender: 'USER' | 'AI' | 'ADMIN';
   createdAt: string;
}

interface Conversation {
   id: string;
   status: string;
   user: { id: string; name: string; email: string };
   messages: Message[];
   createdAt: string;
   updatedAt: string;
}

const AdminChat: React.FC = () => {
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [showMobileDetail, setShowMobileDetail] = useState(false);

   useEffect(() => {
      loadConversations();
   }, []);

   const loadConversations = async () => {
      try {
         setIsLoading(true);
         const data = await api.getConversations();
         setConversations(data);
         if (data.length > 0) {
            setSelectedConv(data[0]);
         }
      } catch (error) {
         console.error('Failed to load conversations:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleSelectConversation = (conv: Conversation) => {
      setSelectedConv(conv);
      setShowMobileDetail(true);
   };

   const handleBackToList = () => {
      setShowMobileDetail(false);
   };

   const formatTime = (date: string) => {
      const d = new Date(date);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
   };

   const formatTimeAgo = (date: string) => {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}p`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
   };

   if (isLoading) {
      return (
         <div className="flex h-full w-full items-center justify-center bg-[#162013]">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Đang tải tin nhắn...</span>
         </div>
      );
   }

   // Conversation List Component
   const ConversationList = () => (
      <div className={`flex flex-col bg-[#1a2e24]/80 backdrop-blur-xl h-full ${showMobileDetail ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 md:border-r border-[#2e4328]`}>
         <div className="p-4 md:p-6 pb-2">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 font-display flex items-center gap-2">
               <MessageSquare className="w-6 h-6 text-green-500" />
               Lịch sử Chat
            </h2>
            <div className="relative w-full mb-3 md:mb-4">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full bg-[#2e4328] border-none rounded-xl py-2.5 md:py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:ring-1 focus:ring-green-500 text-sm"
               />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 md:pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
               {['Tất cả'].map((tab, i) => (
                  <button
                     key={tab}
                     className={`px-3 md:px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${i === 0 ? 'bg-[#53d22d] text-black font-bold' : 'bg-[#2e4328] text-gray-300'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>
         <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4 space-y-2">
            {conversations.length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có cuộc hội thoại nào</p>
               </div>
            ) : conversations.map((conv) => (
               <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-start gap-3 p-3 md:p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${selectedConv?.id === conv.id ? 'bg-[#2e4328]/60 border border-green-500/20' : 'hover:bg-[#2e4328]/40'}`}
               >
                  <div className="relative shrink-0">
                     <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#2e4328] flex items-center justify-center">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                     </div>
                     <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1a2e24] ${conv.status === 'ACTIVE' ? 'bg-orange-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1 gap-2">
                        <h3 className="font-semibold text-sm truncate">{conv.user.name || conv.user.email}</h3>
                        <span className="text-xs text-green-400 font-medium flex-shrink-0">{formatTimeAgo(conv.updatedAt)}</span>
                     </div>
                     <p className="text-gray-300 text-xs line-clamp-2">
                        {conv.messages[conv.messages.length - 1]?.content || 'Cuộc hội thoại mới'}
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );

   // Chat Detail Component
   const ChatDetail = () => (
      <div className={`flex-1 flex flex-col bg-[#0f160d]/50 relative h-full ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
         {selectedConv ? (
            <>
               <header className="h-16 md:h-20 px-4 md:px-6 flex items-center justify-between border-b border-[#2e4328] bg-[#162013]/95 backdrop-blur z-10">
                  <div className="flex items-center gap-3 md:gap-4">
                     {/* Back button for mobile */}
                     <button
                        onClick={handleBackToList}
                        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#2e4328] text-gray-400"
                     >
                        <ArrowLeft className="w-5 h-5" />
                     </button>
                     <div className="w-9 h-9 md:hidden rounded-full bg-[#2e4328] flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                     </div>
                     <div>
                        <h2 className="text-base md:text-lg font-bold truncate max-w-[150px] md:max-w-none">{selectedConv.user.name || selectedConv.user.email}</h2>
                        <div className={`flex items-center gap-1.5 md:hidden`}>
                           <div className={`w-2 h-2 rounded-full ${selectedConv.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                           <span className={`text-xs ${selectedConv.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-500'}`}>
                              {selectedConv.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã xử lý'}
                           </span>
                        </div>
                     </div>
                     <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${selectedConv.status === 'ACTIVE' ? 'bg-green-900/30 border-green-800/50' : 'bg-gray-900/30 border-gray-800/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${selectedConv.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className={`text-xs font-medium ${selectedConv.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-500'}`}>
                           {selectedConv.status === 'ACTIVE' ? 'Active' : 'Resolved'}
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-[#2e4328] text-gray-400"><MoreVertical className="w-5 h-5" /></button>
                  </div>
               </header>

               <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                  <div className="flex justify-center">
                     <span className="px-3 py-1 rounded-full bg-[#2e4328] text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                        {new Date(selectedConv.createdAt).toLocaleDateString('vi-VN')}
                     </span>
                  </div>

                  {selectedConv.messages.map((msg) => (
                     <div key={msg.id} className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] ${msg.sender === 'USER' ? 'justify-start' : 'justify-end ml-auto'}`}>
                        {msg.sender === 'USER' && (
                           <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2e4328] flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                           </div>
                        )}
                        <div className="flex flex-col items-start gap-1">
                           <div className={`p-3 md:p-4 rounded-2xl text-sm ${msg.sender === 'USER'
                              ? 'bg-[#2a2a2a] text-white rounded-tl-sm'
                              : msg.sender === 'AI'
                                 ? 'bg-[#2e4328] border border-white/5 text-gray-200 rounded-tr-sm'
                                 : 'bg-[#53d22d] text-black font-medium rounded-tr-sm shadow-lg shadow-green-500/10'
                              }`}
                              dangerouslySetInnerHTML={msg.sender !== 'USER' ? { __html: parseMarkdown(msg.content) } : undefined}
                           >
                              {msg.sender === 'USER' ? msg.content : null}
                           </div>
                           <span className="text-[10px] text-gray-500 ml-1">
                              {msg.sender === 'AI' ? 'AI' : msg.sender === 'ADMIN' ? 'Admin' : ''} • {formatTime(msg.createdAt)}
                           </span>
                        </div>
                        {msg.sender !== 'USER' && (
                           <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2e4328] flex items-center justify-center border border-white/10 shrink-0">
                              {msg.sender === 'AI' ? <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" /> : <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />}
                           </div>
                        )}
                     </div>
                  ))}
               </div>

               {/* View-only notice */}
               <div className="p-3 md:p-4 bg-[#162013] border-t border-[#2e4328]">
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs md:text-sm">
                     <Eye className="w-4 h-4" />
                     <span>Chế độ xem - Admin không can thiệp chat AI</span>
                  </div>
               </div>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
               <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
               <p className="text-center">Chọn một cuộc hội thoại để xem</p>
            </div>
         )}
      </div>
   );

   return (
      <div className="flex h-full w-full bg-[#162013] text-white overflow-hidden">
         <ConversationList />
         <ChatDetail />
      </div>
   );
};

export default AdminChat;