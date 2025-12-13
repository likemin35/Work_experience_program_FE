import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ConversationHistory.css';

// API 응답에 대한 타입 정의
interface Session {
  conversationId: string;
  title: string;
  lastUpdatedAt: string;
}

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId: string | null;
  onNewChat: () => void; // 새 대화 시작을 위한 콜백
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onSelectConversation, activeConversationId, onNewChat }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // useCallback의 dependency array에 onNewChat을 추가해야 할 수도 있으나,
  // onNewChat 함수가 부모 컴포넌트에서 useCallback으로 memoization 되어있다는 가정하에 일단 제외합니다.
  const fetchSessions = useCallback(async (pageNum: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/chat/sessions?page=${pageNum}&size=10`);
      const newSessions = response.data.content;
      
      setSessions(prev => pageNum === 0 ? newSessions : [...prev, ...newSessions]);
      setHasMore(!response.data.last);
      
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      // Consider adding user-facing error feedback
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    // activeConversationId가 변경될 때마다 세션 목록을 새로고침하여
    // 새 대화가 시작되면 목록에 즉시 반영되도록 합니다.
    fetchSessions(0);
  }, [fetchSessions, activeConversationId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSessions(nextPage);
  };

  return (
    <div className="conversation-history">
      <div className="history-header">
        <h2>채팅</h2>
        <button onClick={onNewChat} className="new-chat-btn">새 대화</button>
      </div>
      <div className="history-list">
        {sessions.map((session) => (
          <div
            key={session.conversationId}
            className={`history-item ${session.conversationId === activeConversationId ? 'active' : ''}`}
            onClick={() => onSelectConversation(session.conversationId)}
            title={session.title}
          >
            {session.title}
          </div>
        ))}
      </div>
      {hasMore && sessions.length < 50 && (
        <button onClick={loadMore} className="load-more-btn" disabled={isLoading}>
          {isLoading ? '로딩 중...' : '더보기'}
        </button>
      )}
    </div>
  );
};

export default ConversationHistory;
