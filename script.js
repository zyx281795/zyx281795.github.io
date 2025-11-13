        'use strict';

//Opening or closing side bar

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function() {elementToggleFunc(sidebar); })

//Activating Modal-testimonial

const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
const modalContainer = document.querySelector('[data-modal-container]');
const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
const overlay = document.querySelector('[data-overlay]');

const modalImg = document.querySelector('[data-modal-img]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalText = document.querySelector('[data-modal-text]');

const testimonialsModalFunc = function () {
    modalContainer.classList.toggle('active');
    overlay.classList.toggle('active');
}

for (let i = 0; i < testimonialsItem.length; i++) {
    testimonialsItem[i].addEventListener('click', function () {
        modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
        modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
        modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
        modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;

        testimonialsModalFunc();
    })
}

//Activating close button in modal-testimonial

modalCloseBtn.addEventListener('click', testimonialsModalFunc);
overlay.addEventListener('click', testimonialsModalFunc);

//Activating Filter Select and filtering options

const select = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-select-value]');
const filterBtn = document.querySelectorAll('[data-filter-btn]');

select.addEventListener('click', function () {elementToggleFunc(this); });

for(let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener('click', function() {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        elementToggleFunc(select);
        filterFunc(selectedValue);

    });
}

const filterItems = document.querySelectorAll('[data-filter-item]');

const filterFunc = function (selectedValue) {
    for(let i = 0; i < filterItems.length; i++) {
        if(selectedValue == "all") {
            filterItems[i].classList.add('active');
        } else if (selectedValue == filterItems[i].dataset.category) {
            filterItems[i].classList.add('active');
        } else {
            filterItems[i].classList.remove('active');
        }
    }
}

//Enabling filter button for larger screens 

let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
    
    filterBtn[i].addEventListener('click', function() {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        lastClickedBtn.classList.remove('active');
        this.classList.add('active');
        lastClickedBtn = this;

    })
}

// Enabling Contact Form

const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');
const formStatus = document.querySelector('[data-form-status]');

for(let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener('input', function () {
        if(form.checkValidity()) {
            formBtn.removeAttribute('disabled');
        } else {
            formBtn.setAttribute('disabled', '');
        }
    })
}

// Handle form submission (using FormSubmit.co)
if (form) {
    form.addEventListener('submit', function(e) {
        // Show sending state
        const originalText = formBtn.querySelector('span').textContent;
        formBtn.querySelector('span').textContent = 'Sending...';
        formBtn.setAttribute('disabled', '');

        // FormSubmit will handle the redirect
        // The form will submit normally without preventDefault
    });

    // Check if redirected back with success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        // Show success message
        if (formStatus) {
            formStatus.style.display = 'block';
            formStatus.style.color = 'var(--orange-yellow-crayola)';
            formStatus.textContent = '✓ Message sent successfully!';

            // Hide success message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 5000);
        }
    }
}

// Enabling Page Navigation

const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

for(let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener('click', function() {

        for(let i = 0; i < pages.length; i++) {
            if(this.innerHTML.toLowerCase() == pages[i].dataset.page) {
                pages[i].classList.add('active');
                navigationLinks[i].classList.add('active');
                window.scrollTo(0, 0);
            } else {
                pages[i].classList.remove('active');
                navigationLinks[i]. classList.remove('active');
            }
        }
    });
}

// Activity Slideshow - 活動照片輪播（帶淡入淡出動畫）

const activityImages = {
    "實習經歷": [
        "img/實習經歷/點睛科技_實習照2.jpg",
        "img/實習經歷/點睛科技_實習照3.jpg",
        "img/實習經歷/合影.png"
    ],
    "論文發表": [
        "img/論文發表/發表.jpg",
        "img/論文發表/論文發表.jpg",
        "img/論文發表/論文發表2.jpg",
        "img/論文發表/conference合照.jpg"
    ],
    "競賽參與": [
        "img/競賽參與/高應大.jpg",
        "img/競賽參與/黑克松.jpg",
        "img/競賽參與/2024_大微3.jpg",
        "img/競賽參與/2024_大微1.jpg",
        "img/競賽參與/大微競賽合照.jpg"
    ],
    "CSMUMI系學會": [
        "img/CSMUMI系學會/系學會1.jpg",
        "img/CSMUMI系學會/系學會2.jpg"
    ],
    "企業工作坊經驗": [
        "img/企業工作坊經驗/2024_AIA.jpg",
        "img/企業工作坊經驗/校園分享會.jpg",
        "img/企業工作坊經驗/Glows.ai合照.png"
    ]
};

const activityList = document.querySelector('[data-activity-list]');
const activitySlides = document.querySelectorAll('.activity-slideshow');
const activityCards = document.querySelectorAll('.activity-card');
const activityItems = document.querySelectorAll('.testimonials-item');

const slideshowIntervals = new Map();
const imageIndices = new Map();

// 淡入淡出切換圖片函數
function changeImageWithFade(img, newSrc) {
    img.classList.add('fade-out');

    setTimeout(() => {
        img.src = newSrc;
        img.classList.remove('fade-out');
        img.classList.add('fade-in');

        setTimeout(() => {
            img.classList.remove('fade-in');
        }, 500);
    }, 500);
}

// 啟動幻燈片
function startSlideshow(slide, card) {
    const activityName = slide.dataset.activity;
    const images = activityImages[activityName];

    if (!images || images.length <= 1) return;
    if (slideshowIntervals.has(slide)) return; // 避免重複啟動

    // 初始化圖片索引
    if (!imageIndices.has(slide)) {
        imageIndices.set(slide, 0);
    }

    // 添加放大動畫class
    card.classList.add('playing');

    const intervalId = setInterval(() => {
        let currentIndex = imageIndices.get(slide);
        currentIndex = (currentIndex + 1) % images.length;
        imageIndices.set(slide, currentIndex);

        const img = slide.querySelector('img');
        changeImageWithFade(img, images[currentIndex]);
    }, 3000); // 每3秒換一張照片

    slideshowIntervals.set(slide, intervalId);
}

// 停止幻燈片
function stopSlideshow(slide, card) {
    if (slideshowIntervals.has(slide)) {
        clearInterval(slideshowIntervals.get(slide));
        slideshowIntervals.delete(slide);
    }

    // 移除放大動畫class
    card.classList.remove('playing');
}

// 根據滑動位置計算當前活動項目
function getCurrentActivityIndex() {
    if (!activityList || activityItems.length === 0) return 0;

    const scrollLeft = activityList.scrollLeft;
    const scrollWidth = activityList.scrollWidth;
    const clientWidth = activityList.clientWidth;

    // 如果滾動到最右邊（容差5px）
    if (scrollLeft + clientWidth >= scrollWidth - 5) {
        return activityItems.length - 1;
    }

    // 如果在最左邊
    if (scrollLeft <= 5) {
        return 0;
    }

    // 計算每個項目的可見度
    let maxVisibility = 0;
    let currentIndex = 0;

    activityItems.forEach((item, index) => {
        const itemLeft = item.offsetLeft - activityList.scrollLeft;
        const itemWidth = item.offsetWidth;
        const itemCenter = itemLeft + itemWidth / 2;
        const listCenter = clientWidth / 2;

        // 計算項目中心與列表中心的距離（越小越接近中心）
        const distanceFromCenter = Math.abs(itemCenter - listCenter);
        const visibility = 1 - (distanceFromCenter / clientWidth);

        if (visibility > maxVisibility) {
            maxVisibility = visibility;
            currentIndex = index;
        }
    });

    return currentIndex;
}

// 更新活動輪播狀態
let lastActiveIndex = -1;

function updateActivitySlideshow() {
    const currentIndex = getCurrentActivityIndex();

    // 只有當索引變化時才更新
    if (currentIndex === lastActiveIndex) return;

    lastActiveIndex = currentIndex;

    // 停止所有幻燈片並移除動畫
    activitySlides.forEach((slide, index) => {
        stopSlideshow(slide, activityCards[index]);
    });

    // 只啟動當前項目的幻燈片
    if (activitySlides[currentIndex]) {
        startSlideshow(activitySlides[currentIndex], activityCards[currentIndex]);
    }
}

// 添加節流函數避免過度觸發
let scrollTimeout;
function throttledUpdate() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
        updateActivitySlideshow();
    }, 100);
}

// 監聽滾動事件
if (activityList) {
    activityList.addEventListener('scroll', throttledUpdate);

    // 初始化：啟動第一項的輪播
    setTimeout(() => {
        updateActivitySlideshow();
    }, 300);
}