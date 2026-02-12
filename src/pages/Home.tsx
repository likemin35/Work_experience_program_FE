import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/promotion/create');
    };

    return (
        <div className="landing-container">
            <div className="landing-content">

                <h1 className="main-title">
                    개인화 마케팅 메시지 자동 생성기
                </h1>

                <ul className="checklist">
                    <li>프로모션 데이터를 PDF 형식으로 업로드해주세요</li>
                    <li>고객 데이터를 CSV 형식으로 업로드해주세요</li>
                    <li>그룹핑 된 고객 결과는 CSV로 다운로드 가능합니다</li>
                    <li>메시지 매핑 결과는 CSV로 다운로드 가능합니다</li>
                </ul>

                <button className="start-button" onClick={handleStart}>
                    시작하기
                </button>
            </div>
        </div>
    );
};

export default Home;
