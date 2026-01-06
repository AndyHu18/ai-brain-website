/**
 * @file    : script-solutions-video.js
 * @purpose : 四大 AI 解決方案影片控制邏輯
 * @depends : [DOM Ready]
 * @created : 2026-01-06
 */

(function () {
    'use strict';

    // DOM 元素
    const video = document.getElementById('solutionsVideo');
    const skeleton = document.getElementById('videoSkeleton');
    const playBtn = document.getElementById('videoPlayBtn');
    const soundBtn = document.getElementById('videoSoundBtn');

    // 如果元素不存在，退出
    if (!video || !skeleton || !playBtn || !soundBtn) {
        console.log('📍[Solutions Video] Elements not found, skipping initialization');
        return;
    }

    console.log('📍[Solutions Video] Initializing video controls');

    // 狀態
    let isPlaying = false;

    /**
     * 當影片可播放時，隱藏骨架屏
     */
    function handleVideoReady() {
        console.log('📍[Solutions Video] Video ready');
        skeleton.classList.add('hidden');
        video.classList.add('loaded');

        // 自動播放（靜音模式）
        video.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(err => {
            console.log('📍[Solutions Video] Auto-play blocked:', err);
        });
    }

    /**
     * 更新播放按鈕狀態
     */
    function updatePlayButton() {
        const icon = playBtn.querySelector('.play-icon');
        const text = playBtn.querySelector('.btn-text');

        if (isPlaying) {
            icon.textContent = '⏸';
            text.textContent = '暫停';
        } else {
            icon.textContent = '▶';
            text.textContent = '播放影片';
        }
    }

    /**
     * 播放/暫停切換
     */
    function togglePlay() {
        if (isPlaying) {
            video.pause();
            isPlaying = false;
        } else {
            video.play();
            isPlaying = true;
        }
        updatePlayButton();
    }

    /**
     * 聲音開關切換
     */
    function toggleSound() {
        video.muted = !video.muted;
        soundBtn.classList.toggle('unmuted', !video.muted);
        console.log('📍[Solutions Video] Sound:', video.muted ? 'OFF' : 'ON');
    }

    // 事件綁定
    video.addEventListener('canplaythrough', handleVideoReady);
    video.addEventListener('loadeddata', handleVideoReady);

    playBtn.addEventListener('click', togglePlay);
    soundBtn.addEventListener('click', toggleSound);

    // 錯誤處理
    video.addEventListener('error', (e) => {
        console.error('📍[Solutions Video] Error loading video:', e);
        skeleton.querySelector('.skeleton-text').textContent = '影片載入失敗';
    });

    // 如果影片已經載入完成（從快取）
    if (video.readyState >= 3) {
        handleVideoReady();
    }

    console.log('📍[Solutions Video] Controls initialized successfully');

})();
