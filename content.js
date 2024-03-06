const handle = {
  counter: {
    skip: 0,
    duration: 0,
    time: "",
    videoDuration: 0,
    tabId: '',
    activate: 'on',
    intervalId: '',
    language: 'english',
    accountName: '',
    startDate: new Date(),
    unlimited: false,
    accessMessageEng: '',
    accessMessageCh: '',
    exp: true
  },
  detectAds: () => {
    const adShowing = document.querySelector(".ad-showing");
    return adShowing ? true : false;
  },
  detectSkipBtn: () => {
    const skipBtn = document.querySelector(".ytp-ad-skip-button-modern");
    return skipBtn ? true : false;
  },
  jumpDuration: () => {
    const video = document.querySelector("video");
    if (video.currentTime) {
      handle.counter.videoDuration += video.duration;
      video.currentTime = video.duration;
      handle.counter.duration++;
      handle.recordTime();
      handle.message();
    }
  },
  clickSkipBtn: () => {
    const skipBtn = document.querySelector(".ytp-ad-skip-button-modern");
    skipBtn.click();
    handle.counter.skip++;
    handle.recordTime();
    handle.message();
  },
  message: () => {
    // console.log("*************** Block Youtube Ads ***************");
    // console.log(`                  跳转广告: ${handle.counter.duration} 次`);
    // console.log(`                  跳转广告总时长: ${handle.counter.videoDuration.toFixed(2)} 秒`);
    // console.log(`                  点击跳过: ${handle.counter.skip} 次`);
    // console.log(`                  时间: ${handle.counter.time}`);
  },
  recordTime: () => {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let formattedTime = hours + ":" + minutes + amPm;
    handle.counter.time = formattedTime;
  },
  updateData: () => {
    chrome.runtime.sendMessage({ type: "dataUpdated", data: handle.counter });
  },
  getTabId: () => {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      handle.counter.tabId = request.tabId
      if (request.tabId) {
        handle.updateData();
      }
      if (request.activate === 'off') {
        handle.counter.activate = 'off';
      }
      if (request.activate === 'on') {
        handle.counter.activate = 'on'
        handle.blockYouTubeAds();
      }
      if (request.language) {
        handle.counter.language = request.language;
      }
    });
  },
  blockYouTubeAds: () => {
    handle.counter.intervalId = setInterval(() => {
      const detectAds = handle.detectAds();
      const detectSkipBtn = handle.detectSkipBtn();
      if (detectAds) {
        handle.jumpDuration();
      }
      if (detectSkipBtn) {
        handle.clickSkipBtn();
      }
      if (handle.counter.activate === 'off' || !handle.counter.exp) {
        clearInterval(handle.counter.intervalId);
      }
      handle.calculateDate();
    }, 500);
  },
  getUserNameAndId: () => {
    let clickAvatar = false;
    let getIdAndNameInterval = setInterval(() => {
      const avatar = document.getElementById('avatar-btn');
      if (avatar && !clickAvatar) {
        avatar.click();
        clickAvatar = true;
      }
      if (!handle.counter.accountName) {
        const accountName = document.getElementById('account-name');
        if (accountName) {
          handle.counter.accountName = accountName.innerHTML;
        }
      }
      if (handle.counter.accountName) {
        if (clickAvatar) {
          avatar.click();
        }
        clearInterval(getIdAndNameInterval)
        handle.connectDB();
      }
    }, 1000)

  },
  connectDB: () => {
    const postData = {
      accountName: handle.counter.accountName,
      startDate: handle.counter.startDate,
      unlimited: handle.counter.unlimited
    }
    fetch('https://block-youtube-ads-server.vercel.app/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })
      .then(response => {
        if (!response.ok) {
          console.log(`HTTP error! Status: ${response.status}`)
        }
        return response.json();
      })
      .then(data => {
        const { accountName, startDate, unlimited } = data.accountInfo;
        handle.counter.accountName = accountName;
        handle.counter.startDate = startDate;
        handle.counter.unlimited = unlimited;
        return true
      })
      .then(run => {
        if (run) {
          handle.blockYouTubeAds()
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  },
  calculateDate: () => {
    if (handle.counter.unlimited) {
      handle.counter.accessMessageEng = '<i class="bi bi-infinity"></i> Unlimited Time';
      handle.counter.accessMessageCh = '<i class="bi bi-infinity"></i> 无限时间'
      handle.counter.exp = true
    } else {
      const dateString = handle.counter.startDate;
      const providedDate = new Date(dateString);
      const currentDate = new Date();
      const differenceInMilliseconds = currentDate - providedDate;

      const differenceInDays = (8 - differenceInMilliseconds / (1000 * 60 * 60 * 24)).toFixed(0);
      if (differenceInDays > 0) {
        handle.counter.accessMessageEng = `${differenceInDays}-Day Free Trial`
        handle.counter.accessMessageCh = `${differenceInDays} 天免费试用`
        handle.counter.exp = true
      } else if (differenceInDays <= 0) {
        handle.counter.accessMessageEng = `Trial Expired`;
        handle.counter.accessMessageCh = `试用期满`;
        handle.counter.exp = false
      }
    }
  }
};

handle.getTabId();
handle.getUserNameAndId();































