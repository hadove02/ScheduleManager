import React, { useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';

function PlaceView({ appData, updateAppData, showToast }) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [memoInput, setMemoInput] = useState('');

    const searchPlace = () => {
        if (!keyword.trim()) return;
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                setIsOverlayOpen(true);
            } else {
                setIsOverlayOpen(false);
                showToast('검색 결과가 없습니다.');
            }
        });
    };

    const handleSelectPlace = (place) => {
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);
        setMapCenter({ lat, lng });
        setSelectedPlace({ ...place, lat, lng });
        setKeyword(place.place_name);
        setIsOverlayOpen(false);
        setMemoInput('');
    };

    const saveCurrentPlace = () => {
        if (!selectedPlace) return;
        const dup = appData.savedPlaces.find(
            p => p.place_name === selectedPlace.place_name && p.address_name === selectedPlace.address_name
        );
        if (dup) {
            showToast('이미 저장된 장소입니다.');
            return;
        }

        const entry = {
            id: Date.now(),
            place_name: selectedPlace.place_name,
            address_name: selectedPlace.road_address_name || selectedPlace.address_name,
            category_name: selectedPlace.category_name,
            phone: selectedPlace.phone,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
            memo: memoInput.trim(),
            savedAt: new Date().toLocaleDateString('ko-KR')
        };

        updateAppData({ ...appData, savedPlaces: [entry, ...appData.savedPlaces] });
        setMemoInput('');
        showToast('저장 완료!');
    };

    const deleteSavedPlace = (id, e) => {
        e.stopPropagation();
        const newPlaces = appData.savedPlaces.filter(p => p.id !== id);
        updateAppData({ ...appData, savedPlaces: newPlaces });
        showToast('삭제했습니다.');
    };

    const cat = selectedPlace?.category_name ? selectedPlace.category_name.split('>').pop().trim() : '';

    return (
        <>
            <div className="image-zone">
                <div id="map-container" style={{ display: 'block' }}>
                    <div className="map-search-bar">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchPlace()}
                            placeholder="장소를 검색하세요..."
                        />
                        <button onClick={searchPlace}>검색</button>
                    </div>

                    <Map center={mapCenter} style={{ width: "100%", height: "calc(100% - 52px)" }} level={3}>
                        {selectedPlace && <MapMarker position={mapCenter} />}
                    </Map>

                    {isOverlayOpen && (
                        <div className="search-results-overlay" style={{ display: 'block' }}>
                            {searchResults.map((place, idx) => (
                                <div key={idx} className="search-result-item" onClick={() => handleSelectPlace(place)}>
                                    <div className="sr-name">{place.place_name}</div>
                                    <div className="sr-addr">{place.road_address_name || place.address_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-container">
                <div className="place-panel" style={{ display: 'flex' }}>
                    <div className="place-top">
                        <div className="place-info-col">
                            <div className="place-info-label">장소 정보</div>
                            <div id="place-info-content">
                                {!selectedPlace ? (
                                    <div className="place-info-empty">지도에서 장소를 검색하거나<br/>마커를 클릭하세요.</div>
                                ) : (
                                    <>
                                        <div className="place-info-name">{selectedPlace.place_name}</div>
                                        {cat && <div className="place-info-category">{cat}</div>}
                                        <div className="place-info-addr">{selectedPlace.road_address_name || selectedPlace.address_name}</div>
                                        {selectedPlace.phone && <div className="place-info-phone">📞 {selectedPlace.phone}</div>}
                                    </>
                                )}
                            </div>
                            <button
                                className="save-place-btn"
                                onClick={saveCurrentPlace}
                                disabled={!selectedPlace}
                            >저장하기</button>
                        </div>

                        <div className="memo-col">
                            <div className="place-info-label">메모</div>
                            <textarea
                                value={memoInput}
                                onChange={(e) => setMemoInput(e.target.value)}
                                placeholder="이 장소에 대한 메모를 입력하세요..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="saved-places-zone">
                        <div className="saved-places-header">
                            <div className="saved-places-title">저장된 장소</div>
                            <div className="saved-count">{appData.savedPlaces.length}곳</div>
                        </div>
                        <div id="saved-places-list">
                            {appData.savedPlaces.length === 0 ? (
                                <div className="empty-list">아직 저장된 장소가 없습니다.<br/>장소를 검색하고 저장해보세요. ✦</div>
                            ) : (
                                appData.savedPlaces.map((place, idx) => (
                                    <div key={place.id} className="saved-place-item" onClick={() => handleSelectPlace(place)}>
                                        <div className="saved-place-idx">{String(idx + 1).padStart(2, '0')}</div>
                                        <div className="saved-place-texts">
                                            <div className="saved-place-name">{place.place_name}</div>
                                            <div className="saved-place-addr">{place.address_name}</div>
                                            {place.memo && <div className="saved-place-memo">✐ {place.memo}</div>}
                                        </div>
                                        <button className="delete-btn" onClick={(e) => deleteSavedPlace(place.id, e)}>✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PlaceView;