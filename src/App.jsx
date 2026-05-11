import React, { useState, useEffect } from 'react';
import { getDoc, setDoc } from 'firebase/firestore';
import { userDocRef } from './firebase';
import PlaceView from './components/PlaceView';
import MemoView from './components/MemoView';
import './App.css';

function App() {
    const [currentTab, setCurrentTab] = useState('place');
    const [toast, setToast] = useState({ show: false, msg: '' });
    const [appData, setAppData] = useState({
        savedPlaces: [],
        schedules: {},
        dayMemos: {},
        datePlaces: {}
    });

    // 토스트 메시지 띄우기
    const showToast = (msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 2000);
    };

    // 파이어베이스에서 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setAppData({
                        savedPlaces: data.savedPlaces || [],
                        schedules: data.schedules || {},
                        dayMemos: data.dayMemos || {},
                        datePlaces: data.datePlaces || {}
                    });
                }
            } catch (error) {
                console.error("데이터 불러오기 실패:", error);
                showToast("데이터 로드 실패");
            }
        };
        fetchData();
    }, []);

    // 데이터 업데이트 및 파이어베이스 동기화 함수
    const updateAppData = async (newData) => {
        setAppData(newData);
        try {
            await setDoc(userDocRef, newData);
        } catch (e) {
            console.error("Firebase 저장 에러: ", e);
        }
    };

    return (
        <div className="app-wrapper">
            <div className="tab-bar">
                <div className="tab-logo">K<span className="logo-accent">.</span></div>
                <button
                    className={`tab-btn ${currentTab === 'place' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('place')}
                >장소</button>
                <button
                    className={`tab-btn ${currentTab === 'memo' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('memo')}
                >메모</button>
            </div>

            <div className="body-container">
                {currentTab === 'place' ? (
                    <PlaceView appData={appData} updateAppData={updateAppData} showToast={showToast} />
                ) : (
                    <MemoView appData={appData} updateAppData={updateAppData} showToast={showToast} />
                )}
            </div>

            <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
        </div>
    );
}

export default App;