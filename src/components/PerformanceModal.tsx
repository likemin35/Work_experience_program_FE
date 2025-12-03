import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PerformanceModal.css';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSubmit: (actualCtr: number, conversionRate: number, performanceStatus: "SUCCESS" | "FAILURE" | "UNDECIDED" | undefined, performanceNotes: string) => void;
  initialActualCtr?: number | null;
  initialConversionRate?: number | null;
  initialPerformanceStatus?: "SUCCESS" | "FAILURE" | "UNDECIDED" | undefined;
  initialPerformanceNotes?: string | null;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onSubmit,
  initialActualCtr,
  initialConversionRate,
  initialPerformanceStatus,
  initialPerformanceNotes,
}) => {
  const [actualCtr, setActualCtr] = useState<string>(initialActualCtr?.toString() || '');
  const [conversionRate, setConversionRate] = useState<string>(initialConversionRate?.toString() || '');
  const [performanceStatus, setPerformanceStatus] = useState<"SUCCESS" | "FAILURE" | "UNDECIDED" | undefined>(initialPerformanceStatus);
  const [performanceNotes, setPerformanceNotes] = useState<string>(initialPerformanceNotes || '');

  useEffect(() => {
    setActualCtr(initialActualCtr?.toString() || '');
    setConversionRate(initialConversionRate?.toString() || '');
    setPerformanceStatus(initialPerformanceStatus);
    setPerformanceNotes(initialPerformanceNotes || '');
  }, [initialActualCtr, initialConversionRate, initialPerformanceStatus, initialPerformanceNotes, isOpen]);


  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(actualCtr), parseFloat(conversionRate), performanceStatus, performanceNotes);
    // No need to clear form here, as it will be re-initialized by useEffect on next open
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>성과 등록/수정</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="actualCtr">클릭률 (CTR)</label>
            <input type="number" id="actualCtr" name="actualCtr" value={actualCtr} onChange={(e) => setActualCtr(e.target.value)} placeholder="예: 15.5" step="0.01" required />
          </div>
          <div className="form-group">
            <label htmlFor="conversionRate">전환율 (CVR)</label>
            <input type="number" id="conversionRate" name="conversionRate" value={conversionRate} onChange={(e) => setConversionRate(e.target.value)} placeholder="예: 7.8" step="0.01" required />
          </div>
          <div className="form-group">
            <label>프로모션 성공 여부</label>
            <div className="radio-group">
              <input type="radio" id="successTrue" name="performanceStatus" value="SUCCESS" checked={performanceStatus === "SUCCESS"} onChange={() => setPerformanceStatus("SUCCESS")} />
              <label htmlFor="successTrue">성공</label>
              <input type="radio" id="successFalse" name="performanceStatus" value="FAILURE" checked={performanceStatus === "FAILURE"} onChange={() => setPerformanceStatus("FAILURE")} />
              <label htmlFor="successFalse">실패</label>
              <input type="radio" id="successUndefined" name="performanceStatus" value="UNDECIDED" checked={performanceStatus === "UNDECIDED"} onChange={() => setPerformanceStatus("UNDECIDED")} />
              <label htmlFor="successUndefined">미정</label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="performanceNotes">성공/실패 사유 메모</label>
            <textarea 
              id="performanceNotes" 
              name="performanceNotes" 
              value={performanceNotes} 
              onChange={(e) => setPerformanceNotes(e.target.value)} 
              placeholder="예: 연말 시즌과 할인 쿠폰의 시너지가 좋았고, 특히 20대 타겟에게 반응이 뜨거웠음." 
              rows={4} 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>취소</button>
            <button type="submit" className="save-button">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PerformanceModal;
