import React, { useState } from 'react';

function MemoView({ appData, updateAppData, showToast }) {
    const weekdays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    const monthsNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().slice(0, 10));

    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleText, setScheduleText] = useState('');
    const [dayMemo, setDayMemo] = useState('');

    // 날짜 계산
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    let cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, dateStr: '', otherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        cells.push({ day: d, dateStr: ds, otherMonth: false });
    }
    let next = 1;
    while (cells.length % 7 !== 0) {
        cells.push({ day: next++, dateStr: '', otherMonth: true });
    }

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
    };

    const handleSelectDate = (dateStr) => {
        if (!dateStr) return;
        setSelectedDateStr(dateStr);
        setDayMemo(appData.dayMemos[dateStr] || '');
    };

    const addSchedule = () => {
        if (!scheduleText.trim()) { showToast('내용을 입력하세요.'); return; }
        const newSchedules = { ...appData.schedules };
        if (!newSchedules[selectedDateStr]) newSchedules[selectedDateStr] = [];

        newSchedules[selectedDateStr].push({ id: Date.now(), time: scheduleTime, text: scheduleText });
        newSchedules[selectedDateStr].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        updateAppData({ ...appData, schedules: newSchedules });
        setScheduleTime('');
        setScheduleText('');
    };

    const deleteSchedule = (id) => {
        const newSchedules = { ...appData.schedules };
        newSchedules[selectedDateStr] = newSchedules[selectedDateStr].filter(s => s.id !== id);
        updateAppData({ ...appData, schedules: newSchedules });
    };

    const saveDayMemo = () => {
        const newMemos = { ...appData.dayMemos, [selectedDateStr]: dayMemo };
        updateAppData({ ...appData, dayMemos: newMemos });
        showToast('메모 저장 완료!');
    };

    const togglePlace = (placeId) => {
        const newDatePlaces = { ...appData.datePlaces };
        if (!newDatePlaces[selectedDateStr]) newDatePlaces[selectedDateStr] = [];

        const isAttached = newDatePlaces[selectedDateStr].includes(placeId);
        if (isAttached) {
            newDatePlaces[selectedDateStr] = newDatePlaces[selectedDateStr].filter(id => id !== placeId);
        } else {
            newDatePlaces[selectedDateStr].push(placeId);
        }
        updateAppData({ ...appData, datePlaces: newDatePlaces });
    };

    const selectedD = new Date(selectedDateStr + 'T00:00:00');
    const schedulesList = appData.schedules[selectedDateStr] || [];
    const attachedPlaces = appData.datePlaces[selectedDateStr] || [];

    return (
        <>
            <div className="image-zone">
                <div id="calendar-container" style={{ display: 'flex' }}>
                    <div className="cal-header">
                        <div className="cal-title">{currentYear}년 {monthsNames[currentMonth]}</div>
                        <div className="cal-nav">
                            <button onClick={() => changeMonth(-1)}>&#8249;</button>
                            <button onClick={() => changeMonth(1)}>&#8250;</button>
                        </div>
                    </div>
                    <div className="cal-weekdays">
                        {['일','월','화','수','목','금','토'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
                    </div>
                    <div className="cal-grid">
                        {cells.map((c, idx) => (
                            <div
                                key={idx}
                                className={`cal-day ${c.otherMonth ? 'other-month' : ''} ${c.dateStr === todayStr ? 'today' : ''} ${c.dateStr === selectedDateStr ? 'selected' : ''}`}
                                onClick={() => handleSelectDate(c.dateStr)}
                            >
                                <div className="day-num">{c.day}</div>
                                {appData.schedules[c.dateStr]?.length > 0 && (
                                    <div className="day-dot-row">
                                        {appData.schedules[c.dateStr].slice(0, 4).map((_, i) => <div key={i} className="day-dot"></div>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-container">
                <div className="memo-panel" style={{ display: 'flex' }}>
                    <div className="memo-date-display">
                        <div className="memo-date-big">{selectedD.getFullYear()}년 {monthsNames[selectedD.getMonth()]} {selectedD.getDate()}일</div>
                        <div className="memo-date-sub">{weekdays[selectedD.getDay()]}</div>
                    </div>

                    <div className="memo-schedule-area">
                        <div className="schedule-section-label">일정 추가</div>
                        <div className="schedule-input-row">
                            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                            <input
                                type="text"
                                placeholder="일정 내용을 입력하세요"
                                value={scheduleText}
                                onChange={(e) => setScheduleText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSchedule()}
                            />
                            <button className="schedule-add-btn" onClick={addSchedule}>추가</button>
                        </div>

                        <div className="schedule-section-label">메모</div>
                        <div className="memo-textarea-wrap">
              <textarea
                  placeholder="이 날에 대한 메모를 자유롭게 남기세요..."
                  value={dayMemo || appData.dayMemos[selectedDateStr] || ''}
                  onChange={(e) => setDayMemo(e.target.value)}
              ></textarea>
                            <button className="schedule-add-btn" onClick={saveDayMemo} style={{ alignSelf: 'flex-end' }}>메모 저장</button>
                        </div>

                        <div className="schedule-section-label">일정 목록</div>
                        <div className="schedule-list">
                            {schedulesList.length === 0 ? (
                                <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontStyle: 'italic', padding: '4px 0' }}>일정 없음</div>
                            ) : (
                                schedulesList.map(s => (
                                    <div key={s.id} className="schedule-item">
                                        <span className="s-time">{s.time || '--:--'}</span>
                                        <span className="s-text">{s.text}</span>
                                        <button className="s-delete" onClick={() => deleteSchedule(s.id)}>✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="memo-place-zone">
                        <div className="memo-place-header">
                            <div className="memo-place-title">장소 추가 (저장된 장소에서 선택)</div>
                        </div>
                        <div className="memo-place-list">
                            {appData.savedPlaces.length === 0 ? (
                                <div className="empty-list" style={{ padding: '12px 16px', fontSize: '0.78rem' }}>저장된 장소가 없습니다.</div>
                            ) : (
                                appData.savedPlaces.map(place => {
                                    const isOn = attachedPlaces.includes(place.id);
                                    return (
                                        <div key={place.id} className={`memo-place-item ${isOn ? 'attached' : ''}`} onClick={() => togglePlace(place.id)}>
                                            <span className="memo-place-check">{isOn ? '✔' : '○'}</span>
                                            <span className="memo-place-item-name">{place.place_name}</span>
                                            <span className="memo-place-item-addr">{place.address_name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MemoView;