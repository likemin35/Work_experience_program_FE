import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KnowledgeModal.css'; // 모달 스타일 재활용

interface KnowledgeDetail {
  document: string;
  id: string;
  metadata: {
    title: string;
    registration_date: string;
    source_type: '정책' | '약관' | '성공_사례' | '실패_사례' | '가이드';
    campaign_id?: string;
  };
}

interface KnowledgeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKnowledgeUpdated: () => void; // 지식 수정 후 목록 새로고침을 위한 콜백
  knowledgeItem: KnowledgeDetail | null; // 수정할 지식 데이터 타입 수정
}

const KnowledgeEditModal: React.FC<KnowledgeEditModalProps> = ({ isOpen, onClose, onKnowledgeUpdated, knowledgeItem }) => {
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [sourceType, setSourceType] = useState<'정책' | '약관' | '성공_사례' | '실패_사례' | '가이드'>('정책');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && knowledgeItem) {
      setTitle(knowledgeItem.metadata.title);
      setContentText(knowledgeItem.document);
      setSourceType(knowledgeItem.metadata.source_type);
      setError(null);
    } else if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setTitle('');
      setContentText('');
      setSourceType('정책');
      setError(null);
    }
  }, [isOpen, knowledgeItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!knowledgeItem) {
      setError('수정할 지식 정보가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`/api/knowledge/${knowledgeItem.id}`, {
        // [FIX] Send the full content to both fields to handle backend inconsistency
        campaign_summary: contentText,
        campaign_details: {
          content_text: contentText,
          source_type: sourceType,
          title: title,
        },
      });
      alert('지식이 성공적으로 수정되었습니다.');
      onKnowledgeUpdated(); // 부모 컴포넌트에 지식 수정 알림
      onClose(); // 모달 닫기
    } catch (err) {
      setError('지식 수정에 실패했습니다.');
      console.error('Error updating knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>지식 수정</h2>
        <form onSubmit={handleSubmit} className="knowledge-form">
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group textarea-group">
            <label htmlFor="contentText">내용</label>
            <textarea
              id="contentText"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sourceType">출처</label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as '정책' | '약관' | '성공_사례' | '실패_사례' | '가이드')}
            >
              <option value="정책">정책</option>
              <option value="약관">약관</option>
              <option value="성공_사례">성공 사례</option>
              <option value="실패_사례">실패 사례</option>
              <option value="가이드">가이드</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? '수정 중...' : '수정'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeEditModal;
