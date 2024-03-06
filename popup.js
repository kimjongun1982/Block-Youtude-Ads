
const handle = {
    data: {
        currentTabId: '',
        stopButton: document.querySelector('.stop-btn'),
        startButton: document.querySelector('.start-btn'),
        progressBar: document.querySelector('.progress'),
        progressBarColor: document.querySelector('.progress-bar'),
        chineseButton: document.querySelector('.btn-ch'),
        englishButton: document.querySelector('.btn-eng'),
        popupContent: document.querySelector('#popup-content'),
        expButton: document.querySelector('.exp'),
        progressBarPercentage: 0,
        intervalBar: '',
        messageData: {},
        accessMessageEng: '',
        accessMessageCh: '',
    },
    getTabId: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            handle.data.currentTabId = tabs[0].id;
            chrome.tabs.sendMessage(handle.data.currentTabId, { tabId: handle.data.currentTabId });
        });
    },
    offExtension: () => {
        chrome.tabs.sendMessage(handle.data.currentTabId, { activate: 'off' });
    },
    onExtension: () => {
        chrome.tabs.sendMessage(handle.data.currentTabId, { activate: 'on' });
    },
    setEnglish: () => {
        chrome.tabs.sendMessage(handle.data.currentTabId, { language: 'english' });
        handle.data.messageData.language = 'english';
    },
    setChinese: () => {
        chrome.tabs.sendMessage(handle.data.currentTabId, { language: 'chinese' });
        handle.data.messageData.language = 'chinese';
    },
    render: () => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === "dataUpdated" && handle.data.currentTabId === message.data.tabId) {
                handle.data.messageData = message.data;
                handle.displayText(message.data)
                handle.runProgressBar();
            }
        });
    },
    clickButton: () => {
        document.querySelector('.stop-btn').addEventListener('click', () => {
            handle.offExtension();
            handle.displayBtnGroup('off');
            handle.data.messageData.activate = 'off';
            clearInterval(handle.data.intervalBar);
            handle.data.progressBarPercentage = 0;
        })
        document.querySelector('.start-btn').addEventListener('click', () => {
            handle.onExtension();
            handle.displayBtnGroup('on');
            handle.data.messageData.activate = 'on';
            handle.runProgressBar();
        })
        document.querySelector('.btn-eng').addEventListener('click', () => {
            handle.data.language = 'english';
            document.querySelector('.btn-eng').style.display = 'none'
            document.querySelector('.btn-ch').style.display = 'block'
            handle.setEnglish();
            handle.languageRender();
        })
        document.querySelector('.btn-ch').addEventListener('click', () => {
            handle.data.language = 'chinese';
            document.querySelector('.btn-eng').style.display = 'block'
            document.querySelector('.btn-ch').style.display = 'none'
            handle.setChinese();
            handle.languageRender();
        })
    },
    displayBtnGroup: (activate) => {
        if (activate === 'on' || activate === '') {
            handle.data.stopButton.style.display = 'block';
            handle.data.startButton.style.display = 'none';
            handle.data.progressBar.style.display = 'flex';
        } else {
            handle.data.stopButton.style.display = 'none';
            handle.data.startButton.style.display = 'block';
            handle.data.progressBar.style.display = 'none';
        }
    },
    percentageCal: () => {
        if (handle.data.progressBarPercentage < 100) {
            handle.data.progressBarPercentage += 20;
        } else {
            handle.data.progressBarPercentage = 0;
        }
    },
    runProgressBar: () => {
        handle.data.intervalBar = setInterval(() => {
            handle.percentageCal()
            handle.data.progressBarColor.style.width = `${handle.data.progressBarPercentage}%`
        }, 500)
    },
    languageRender: () => {
        handle.displayText(handle.data.messageData);
    },
    displayText: (data) => {
        const { duration, skip, time, videoDuration, tabId, activate, language, accountName, accessMessageEng, accessMessageCh, exp } = data;
        if (accessMessageEng) {
            handle.displayBtnGroup(activate);
            if (language === 'chinese') {
                handle.data.popupContent.innerHTML = `
            <span class="badge rounded-pill text-bg-light">${accessMessageCh}</span>
            <div class="text">名字: ${accountName.length > 17 ? accountName.substring(0, 17) + '...' : accountName}</div>
            <div class="text">Tab ID: ${tabId} </div>
            <div class="text">跳转广告: ${duration} 次</div>
            <div class="text">点击跳过: ${skip} 次</div>
            <div class="text">时间: ${time}</div>
            <div class="text">跳转广告总时长: ${videoDuration.toFixed(2)} 秒</div>
        `;
                handle.data.stopButton.innerHTML = '停止运行';
                handle.data.startButton.innerHTML = '启动';
                handle.data.chineseButton.style.display = 'none';
                handle.data.englishButton.style.display = 'block';
            }
            if (language === 'english') {
                handle.data.popupContent.innerHTML = `
            <span class="badge rounded-pill text-bg-light">${accessMessageEng}</span>
            <div class="text">Name: ${accountName.length > 17 ? accountName.substring(0, 17) + '...' : accountName}</div>
            <div class="text">Tab ID: ${tabId} </div>
            <div class="text">Jump ads: ${duration}</div>
            <div class="text">Click to skip: ${skip}</div>
            <div class="text">Time: ${time}</div>
            <div class="text">Total ad duration: ${videoDuration.toFixed(2)}s</div>
        `;
                handle.data.stopButton.innerHTML = 'Stop';
                handle.data.startButton.innerHTML = 'Start';
                handle.data.chineseButton.style.display = 'block';
                handle.data.englishButton.style.display = 'none';
            }
            handle.hideBtn(exp);
        }
    },
    hideBtn: (expire) => {
        if (!expire) {
            handle.data.progressBar.style.display = 'none';
            handle.data.stopButton.style.display = 'none';
            handle.data.startButton.style.display = 'none';
            const element = document.querySelector(".text-bg-light");

            if (element && element.classList.contains("text-bg-light")) {
                element.classList.remove("text-bg-light");
                element.classList.add("text-bg-danger");
            }
        }
    }
}


handle.getTabId();
handle.render();
handle.clickButton();


// "permissions": [
//     "activeTab",
//     "storage",
//     "nativeMessaging"
//   ]












