import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './KnowledgeManagementPage.css';

import KnowledgeDetailModal from './KnowledgeDetailModal';
import KnowledgeCreationModal from '../components/KnowledgeCreationModal';
import KnowledgeEditModal from '../components/KnowledgeEditModal';

// API 목록 응답을 위한 타입
interface KnowledgeListItem {
  knowledge_id: string;
  title: string;
  source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
  upload_date: string;
}

// API 상세 응답을 위한 타입
interface KnowledgeDetail {
  document: string;
  id: string;
  metadata: {
    title: string;
    registration_date: string;
    source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
    campaign_id?: string;
  };
}

// API에서 받아오는 원본 데이터 아이템 타입
interface KnowledgeSourceItem {
  id: string;
  metadata: {
    title: string;
    source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
    registration_date: string;
  };
}

// Spring Pageable API 응답을 위한 타입 (RAG DB 페이지에 맞춰 필드명 조정)
interface Page<T> {
  knowledge_base?: T[]; // New key for paginated response
  data?: T[]; // Old key for non-paginated response
  total_pages: number;
  total_documents: number;
  page_size: number;
}

const KnowledgeManagementPage: React.FC = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSourceType, setFilterSourceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [knowledgeDetail, setKnowledgeDetail] = useState<KnowledgeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKnowledgeForEdit, setSelectedKnowledgeForEdit] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const params: { source_type?: string; title?: string } = {};
      if (filterSourceType !== 'all') {
        params.source_type = filterSourceType;
      }
      if (searchTerm) {
        params.title = searchTerm;
      }

      const response = await axios.get<Page<KnowledgeSourceItem>>(`/api/knowledge?page=${currentPage}&size=${pageSize}`, { params });
      
      const items = response.data.knowledge_base || response.data.data || [];

      const transformedKnowledgeBase: KnowledgeListItem[] = items.map(item => ({
        knowledge_id: item.id,
        title: item.metadata.title,
        source_type: item.metadata.source_type,
        upload_date: item.metadata.registration_date,
      }));

      // 날짜를 기준으로 내림차순 정렬
      transformedKnowledgeBase.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
      
      setKnowledgeBase(transformedKnowledgeBase);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError('지식 베이스 데이터를 불러오는 데 실패했습니다.');
      console.error('Error fetching knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to first page when filters or search term change
    if (currentPage !== 0 && (filterSourceType !== 'all' || searchTerm !== '')) {
      setCurrentPage(0);
    } else {
      fetchKnowledge();
    }
  }, [currentPage, filterSourceType, searchTerm]);

  // Remove filteredAndSortedKnowledgeBase useMemo as filtering/sorting will be handled by backend


  const handleOpenDetailModal = async (knowledgeId: string) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const response = await axios.get<KnowledgeDetail>(`/api/knowledge/${knowledgeId}`);
      setKnowledgeDetail(response.data);
    } catch (error) {
      console.error("Error fetching knowledge detail:", error);
      setError('상세 정보를 불러오는 데 실패했습니다.');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setKnowledgeDetail(null);
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!window.confirm('정말로 이 지식을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axios.delete(`/api/knowledge/${id}`);
      alert('지식이 성공적으로 삭제되었습니다.');
      handleCloseDetailModal();
      fetchKnowledge(); // 목록 새로고침
    } catch (err) {
      console.error('Error deleting knowledge item:', err);
      alert('지식 삭제에 실패했습니다.');
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    fetchKnowledge();
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedKnowledgeForEdit(item);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedKnowledgeForEdit(null);
    fetchKnowledge();
  };

  if (loading && !knowledgeBase.length) return <div className="knowledge-list-container"><h1>Loading...</h1></div>;

  return (
    <div className="knowledge-list-container">
      <div className="knowledge-list-header">
        <h1>RAG 지식 베이스 관리</h1>
      </div>
      <div className="filter-and-search">
        <input
          type="text"
          placeholder="제목으로 검색..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="status-filter"
          value={filterSourceType}
          onChange={(e) => setFilterSourceType(e.target.value)}
        >
          <option value="all">모든 출처</option>
          <option value="정책">정책</option>
          <option value="약관">약관</option>
          <option value="성공_사례">성공 사례</option>
          <option value="실패_사례">실패 사례</option>
        </select>
        <button className="new-knowledge-button" onClick={handleOpenCreateModal}>신규 지식 등록</button>
      </div>
      {loading ? (
        <p>목록을 불러오는 중입니다...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
      <>
      <table className="knowledge-table">
        <thead>
          <tr>
            <th>등록일</th>
            <th>제목</th>
            <th>출처</th>
          </tr>
        </thead>
        <tbody>
          {knowledgeBase.length > 0 ? (
            knowledgeBase.map(item => (
              <tr key={item.knowledge_id}>
                <td>{item.upload_date.split(' ')[0]}</td>
                <td 
                  className="knowledge-title"
                  onClick={() => handleOpenDetailModal(item.knowledge_id)}
                >
                  {item.title}
                </td>
                <td>{item.source_type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>결과가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={currentPage === i ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            다음
          </button>
        </div>
      )}
      </>
      )}
      <KnowledgeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onDelete={handleDeleteKnowledge}
        onEdit={handleOpenEditModal}
        data={knowledgeDetail}
        loading={loadingDetail}
      />
      <KnowledgeCreationModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onKnowledgeCreated={fetchKnowledge}
      />
      <KnowledgeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onKnowledgeUpdated={fetchKnowledge}
        knowledgeItem={selectedKnowledgeForEdit}
      />
    </div>
  );
};

export default KnowledgeManagementPage;