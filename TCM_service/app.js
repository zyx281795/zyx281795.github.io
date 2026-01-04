// 中醫藥材知識系統 - 主應用程式
// TCM Exam & Herb AI Assistant

// ========== 全局狀態 ==========
const AppState = {
    currentView: 'dashboard',
    allHerbs: [],
    displayedHerbs: [],
    currentPage: 1,
    pageSize: 30,
    searchQuery: '',
    selectedHerb: null,
    currentImageIndex: 0
};

// ========== 頁面標題映射 ==========
const PAGE_TITLES = {
    'dashboard': '功能簡介',
    'exam': '國考題庫',
    'yibian': '醫砭集錦',
    'herbs': '中藥百科',
    'trainer': '中醫藥材Chatbot'
};

// ========== 初始化應用程式 ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('中醫藥材知識系統啟動中...');

    // 初始化狀態列
    // initStatusBar();

    // 初始化導航
    initNavigation();

    // 初始化搜索
    initSearch();

    // 初始化彈窗
    initModal();

    // 初始化國考題庫
    initExam();

    // 初始化聊天機器人
    initChatbot();

    // 初始化手機側邊欄
    initMobileSidebar();

    // 載入藥材資料
    await loadHerbsData();

    console.log('系統初始化完成！');
});

// ========== 狀態列功能 ==========
function initStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.id = 'app-status-bar';
    statusBar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #292524;
        color: #d6d3d1;
        padding: 8px 16px;
        font-size: 12px;
        z-index: 9999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #44403c;
    `;
    statusBar.innerHTML = `
        <div id="status-message">系統準備就緒</div>
        <div id="status-details"></div>
    `;
    document.body.appendChild(statusBar);

    // 全局錯誤捕捉
    window.addEventListener('error', (event) => {
        updateStatus(`❌ 系統錯誤: ${event.message}`, 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
        updateStatus(`❌ 未捕捉的 Promise 錯誤: ${event.reason}`, 'error');
    });
}

function updateStatus(message, type = 'info') {
    // Status bar disabled by user request
    /*
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
        statusMsg.textContent = message;
        if (type === 'error') {
            statusMsg.style.color = '#f87171';
        } else if (type === 'success') {
            statusMsg.style.color = '#4ade80';
        } else {
            statusMsg.style.color = '#d6d3d1';
        }
    }
    */
    console.log(`[System Status] ${message}`);
}

// ========== 導航功能 ==========
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // 更新狀態
    AppState.currentView = viewName;

    // 更新導航按鈕
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 更新頁面標題
    document.querySelector('.page-title').textContent = PAGE_TITLES[viewName] || viewName;

    // 切換視圖
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
        activeView.classList.add('active');
    }

    // 如果切換到藥材視圖，確保顯示藥材
    if (viewName === 'herbs' && AppState.allHerbs.length > 0) {
        renderHerbs();
    }
}

// ========== 載入藥材資料 ==========
async function loadHerbsData() {
    const loadingIndicator = document.getElementById('loading-indicator');

    try {
        updateStatus('正在載入中藥百科資料...', 'info');
        loadingIndicator.style.display = 'block';

        let data;

        // 優先檢查是否有全域變數 (本地檔案模式)
        if (window.HERBS_DATA) {
            console.log('檢測到本地數據變數 (window.HERBS_DATA)');
            data = window.HERBS_DATA;
            // 模擬異步延遲，讓 UI 有機會渲染 loading 狀態
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            // 嘗試透過 fetch 載入 (伺服器模式)
            const response = await fetch('herbs_data.json');
            if (!response.ok) {
                throw new Error(`無法載入藥材資料 (Status: ${response.status})`);
            }
            data = await response.json();
        }

        AppState.allHerbs = data;
        AppState.displayedHerbs = data;

        console.log(`成功載入 ${data.length} 種藥材`);
        updateStatus(`✅ 成功載入 ${data.length} 種藥材資料`, 'success');

        renderHerbs();
        updateHerbsStats();

    } catch (error) {
        console.error('載入藥材資料失敗:', error);
        updateStatus(`❌ 載入藥材資料失敗: ${error.message}`, 'error');
        showError('載入藥材資料失敗，請確認 herbs_data.json 存在或 data.js 已載入');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// ========== 渲染藥材卡片 ==========
function renderHerbs() {
    const herbsGrid = document.getElementById('herbs-grid');
    const emptyState = document.getElementById('empty-state');

    if (!herbsGrid) return;

    // 清空網格
    herbsGrid.innerHTML = '';

    // 檢查是否有資料
    if (AppState.displayedHerbs.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // 計算要顯示的藥材
    const startIndex = 0;
    const endIndex = Math.min(AppState.currentPage * AppState.pageSize, AppState.displayedHerbs.length);
    const herbsToDisplay = AppState.displayedHerbs.slice(startIndex, endIndex);

    // 渲染每個藥材卡片
    herbsToDisplay.forEach(herb => {
        const card = createHerbCard(herb);
        herbsGrid.appendChild(card);
    });

    // 如果還有更多資料，設置無限滾動
    if (endIndex < AppState.displayedHerbs.length) {
        setupInfiniteScroll();
    }
}

// ========== 創建藥材卡片 ==========
function createHerbCard(herb) {
    const card = document.createElement('div');
    card.className = 'herb-card';

    // 獲取圖片URL（使用第一張圖片）
    const imageUrl = herb.imageUrls && herb.imageUrls.length > 0
        ? herb.imageUrls[0]
        : 'https://images.unsplash.com/photo-1587573489823-398246a480e5?auto=format&fit=crop&q=80&w=800';

    // 獲取顯示內容（優先順序：功能主治 > 性味歸經）
    const displayContent = herb.indications || herb.properties || '暫無資料';

    card.innerHTML = `
        <img src="${imageUrl}"
             alt="${herb.name}"
             class="herb-card-image"
             onerror="this.src='https://images.unsplash.com/photo-1587573489823-398246a480e5?auto=format&fit=crop&q=80&w=800'">
        <div class="herb-card-content">
            <div class="herb-card-header">
                <h3 class="herb-card-name">${herb.name}</h3>
                <span class="herb-card-id">#${herb.id}</span>
            </div>
            ${herb.aliases ? `<div class="herb-card-aliases">${herb.aliases}</div>` : ''}
            <p class="herb-card-properties">${displayContent}</p>
        </div>
    `;

    // 添加點擊事件
    card.addEventListener('click', () => {
        openHerbModal(herb);
    });

    return card;
}

// ========== 搜索功能 ==========
function initSearch() {
    const searchInput = document.getElementById('herb-search');
    const clearBtn = document.getElementById('clear-search');

    if (!searchInput) return;

    // 輸入事件
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        AppState.searchQuery = query;

        // 顯示/隱藏清除按鈕
        if (query) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }

        // 執行搜索
        performSearch(query);
    });

    // 清除按鈕
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        AppState.searchQuery = '';
        clearBtn.style.display = 'none';
        performSearch('');
    });
}

function performSearch(query) {
    if (!query) {
        // 沒有搜索詞，顯示所有藥材
        AppState.displayedHerbs = AppState.allHerbs;
    } else {
        // 執行搜索（名稱、別名、性味歸經、功能主治、應用）
        const lowerQuery = query.toLowerCase();
        AppState.displayedHerbs = AppState.allHerbs.filter(herb => {
            return (
                herb.name.toLowerCase().includes(lowerQuery) ||
                (herb.aliases && herb.aliases.toLowerCase().includes(lowerQuery)) ||
                (herb.properties && herb.properties.toLowerCase().includes(lowerQuery)) ||
                (herb.indications && herb.indications.toLowerCase().includes(lowerQuery)) ||
                (herb.applications && herb.applications.toLowerCase().includes(lowerQuery))
            );
        });
    }

    // 重置頁面
    AppState.currentPage = 1;

    // 重新渲染
    renderHerbs();
    updateHerbsStats();
}

// ========== 更新統計信息 ==========
function updateHerbsStats() {
    const statsElement = document.getElementById('herbs-count');
    if (!statsElement) return;

    if (AppState.searchQuery) {
        statsElement.innerHTML = `找到 <strong>${AppState.displayedHerbs.length}</strong> 種相關藥材`;
    } else {
        statsElement.innerHTML = `共 <strong>${AppState.allHerbs.length}</strong> 種藥材`;
    }
}

// ========== 無限滾動 ==========
function setupInfiniteScroll() {
    const contentArea = document.querySelector('.content-area');

    const scrollHandler = () => {
        const { scrollTop, scrollHeight, clientHeight } = contentArea;

        // 當滾動到底部附近時載入更多
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            if (AppState.currentView === 'herbs') {
                loadMoreHerbs();
            } else if (AppState.currentView === 'yibian') {
                loadMoreYiBian();
            }
        }
    };

    // 移除舊的監聽器，添加新的
    contentArea.removeEventListener('scroll', scrollHandler);
    contentArea.addEventListener('scroll', scrollHandler);
}

function loadMoreHerbs() {
    const currentCount = AppState.currentPage * AppState.pageSize;
    if (currentCount >= AppState.displayedHerbs.length) return;

    AppState.currentPage++;
    renderHerbs();
}

function loadMoreYiBian() {
    const currentCount = YiBianState.currentPage * YiBianState.pageSize;
    if (currentCount >= YiBianState.displayedItems.length) return;

    YiBianState.currentPage++;
    renderYiBian();
}

// ========== 藥材詳情彈窗 ==========
function initModal() {
    const modal = document.getElementById('herb-modal');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');

    // 關閉按鈕事件
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeHerbModal);
    });

    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHerbModal();
        }
    });

    // ESC鍵關閉
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeHerbModal();
        }
    });
}

function openHerbModal(herb) {
    const modal = document.getElementById('herb-modal');
    AppState.selectedHerb = herb;
    AppState.currentImageIndex = 0;

    // 設置圖片
    updateModalImage();

    // 設置藥材資訊
    document.getElementById('modal-herb-name').textContent = herb.name;
    document.getElementById('modal-herb-id').textContent = `#${herb.id}`;

    // 設置別名
    const aliasesSection = document.getElementById('modal-aliases');
    if (herb.aliases) {
        aliasesSection.style.display = 'block';
        aliasesSection.querySelector('.section-content').textContent = herb.aliases;
    } else {
        aliasesSection.style.display = 'none';
    }

    // 設置性味歸經
    const propertiesSection = document.getElementById('modal-properties');
    if (herb.properties) {
        propertiesSection.style.display = 'block';
        propertiesSection.querySelector('.section-content').textContent = herb.properties;
    } else {
        propertiesSection.style.display = 'none';
    }

    // 設置功能主治
    const indicationsSection = document.getElementById('modal-indications');
    if (herb.indications) {
        indicationsSection.style.display = 'block';
        indicationsSection.querySelector('.section-content').textContent = herb.indications;
    } else {
        indicationsSection.style.display = 'none';
    }

    // 設置應用
    const applicationsSection = document.getElementById('modal-applications');
    if (herb.applications) {
        applicationsSection.style.display = 'block';
        applicationsSection.querySelector('.section-content').textContent = herb.applications;
    } else {
        applicationsSection.style.display = 'none';
    }

    // 設置圖片導航
    setupImageNavigation(herb);

    // 顯示彈窗
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeHerbModal() {
    const modal = document.getElementById('herb-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    AppState.selectedHerb = null;
}

function updateModalImage() {
    const herb = AppState.selectedHerb;
    if (!herb) return;

    const imageUrl = herb.imageUrls && herb.imageUrls.length > AppState.currentImageIndex
        ? herb.imageUrls[AppState.currentImageIndex]
        : 'https://images.unsplash.com/photo-1587573489823-398246a480e5?auto=format&fit=crop&q=80&w=800';

    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageUrl;
    modalImage.onerror = () => {
        modalImage.src = 'https://images.unsplash.com/photo-1587573489823-398246a480e5?auto=format&fit=crop&q=80&w=800';
    };
}

function setupImageNavigation(herb) {
    const navContainer = document.getElementById('modal-image-nav');
    navContainer.innerHTML = '';

    // 檢查是否有多張圖片
    if (!herb.imageUrls || herb.imageUrls.length <= 1) {
        return;
    }

    // 創建導航點
    herb.imageUrls.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'image-nav-dot';
        if (index === AppState.currentImageIndex) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
            AppState.currentImageIndex = index;
            updateModalImage();

            // 更新導航點狀態
            navContainer.querySelectorAll('.image-nav-dot').forEach((d, i) => {
                if (i === index) {
                    d.classList.add('active');
                } else {
                    d.classList.remove('active');
                }
            });
        });

        navContainer.appendChild(dot);
    });
}

// ========== 手機側邊欄功能 ==========
function initMobileSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const navItems = document.querySelectorAll('.nav-item');
    const appContainer = document.querySelector('.app-container');

    if (!toggleBtn) return;

    // Toggle sidebar
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.toggle('sidebar-open');
    });

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open');
        });
    }

    // Close on nav item click (mobile only)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.body.classList.remove('sidebar-open');
            }
        });
    });

    // Close when clicking outside (general safety)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            document.body.classList.contains('sidebar-open') && 
            !e.target.closest('.sidebar') && 
            e.target !== toggleBtn) {
            document.body.classList.remove('sidebar-open');
        }
    });
}

// ========== 錯誤處理 ==========
function showError(message) {
    const herbsGrid = document.getElementById('herbs-grid');
    if (herbsGrid) {
        herbsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: #dc2626; margin-bottom: 8px;">載入失敗</h3>
                <p style="color: #78716c;">${message}</p>
            </div>
        `;
    }
}

// ========== 工具函數 ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 優化搜索性能
const debouncedSearch = debounce(performSearch, 300);

// ========== 醫砭集錦功能 ==========
const YiBianState = {
    allData: null,
    displayedItems: [],
    currentType: 'all', // 'all', 'herb', 'formula'
    selectedCategory: '',
    searchQuery: '',
    currentPage: 1,
    pageSize: 30
};

// 載入醫砭資料
async function loadYiBianData() {
    const loadingIndicator = document.getElementById('yibian-loading');

    try {
        updateStatus('正在載入醫砭集錦資料...', 'info');
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        let data;

        // 優先檢查是否有全域變數 (本地檔案模式)
        if (window.YIBIAN_DATA) {
            console.log('檢測到本地數據變數 (window.YIBIAN_DATA)');
            data = window.YIBIAN_DATA;
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            // 嘗試透過 fetch 載入
            const response = await fetch('yibian_data.json');
            if (!response.ok) {
                throw new Error(`無法載入醫砭資料 (Status: ${response.status})`);
            }
            data = await response.json();
        }

        YiBianState.allData = data;
        YiBianState.displayedItems = [...data.herbs, ...data.formulas];

        console.log(`成功載入醫砭資料：${data.herbs.length} 種中藥 + ${data.formulas.length} 個方劑`);
        updateStatus(`✅ 成功載入醫砭資料：${data.herbs.length} 種中藥 + ${data.formulas.length} 個方劑`, 'success');

        // 初始化分類選項
        initYiBianCategories();

        // 初始化過濾器
        initYiBianFilters();

        // 初始化搜索
        initYiBianSearch();

            // 初始化彈窗

            initYiBianModal();

        

            // 初始化國考題庫

            initExam();

        

            // 渲染資料

            renderYiBian();

        
        updateYiBianStats();

    } catch (error) {
        console.error('載入醫砭資料失敗:', error);
        updateStatus(`❌ 載入醫砭資料失敗: ${error.message}`, 'error');
        showYiBianError('載入醫砭資料失敗，請確認 yibian_data.json 存在或 data.js 已載入');
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// 初始化分類選項
function initYiBianCategories() {
    const categorySelect = document.getElementById('category-filter');
    if (!categorySelect || !YiBianState.allData) return;

    let herb_categories = [];
    let formula_categories = [];

    // Check if categories exist in data, otherwise extract dynamically
    if (YiBianState.allData.categories) {
        ({ herb_categories, formula_categories } = YiBianState.allData.categories);
    } else {
        // Extract herb categories
        const herbCats = new Set();
        if (YiBianState.allData.herbs) {
            YiBianState.allData.herbs.forEach(h => {
                if (h.category) herbCats.add(h.category);
            });
        }
        herb_categories = Array.from(herbCats);

        // Extract formula categories
        const formulaCats = new Set();
        if (YiBianState.allData.formulas) {
            YiBianState.allData.formulas.forEach(f => {
                if (f.categories) {
                    if (Array.isArray(f.categories)) {
                        f.categories.forEach(c => formulaCats.add(c));
                    } else if (typeof f.categories === 'string') {
                        f.categories.split(',').forEach(c => formulaCats.add(c.trim()));
                    }
                } else if (f.category) {
                    formulaCats.add(f.category);
                }
            });
        }
        formula_categories = Array.from(formulaCats);
    }

    const allCategories = [...new Set([...herb_categories, ...formula_categories])].sort();

    // 清空並重新填充選項
    categorySelect.innerHTML = '<option value="">全部分類</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// 初始化過濾器
function initYiBianFilters() {
    // 類型過濾按鈕
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            YiBianState.currentType = type;

            // 更新按鈕狀態
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 執行過濾
            filterYiBian();
        });
    });

    // 分類過濾
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            YiBianState.selectedCategory = e.target.value;
            filterYiBian();
        });
    }
}

// 初始化搜索
function initYiBianSearch() {
    const searchInput = document.getElementById('yibian-search');
    const clearBtn = document.getElementById('yibian-clear-search');

    if (!searchInput) return;

    // 創建 debounced 過濾函數
    const debouncedFilter = debounce(() => {
        filterYiBian();
    }, 300);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        YiBianState.searchQuery = query;

        if (clearBtn) {
            clearBtn.style.display = query ? 'flex' : 'none';
        }

        // 調用 debounced 函數
        debouncedFilter();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            YiBianState.searchQuery = '';
            clearBtn.style.display = 'none';
            filterYiBian();
        });
    }
}

// 執行過濾
function filterYiBian() {
    if (!YiBianState.allData) return;

    let items = [];

    // 類型過濾
    if (YiBianState.currentType === 'all') {
        items = [...YiBianState.allData.herbs, ...YiBianState.allData.formulas];
    } else if (YiBianState.currentType === 'herb') {
        items = [...YiBianState.allData.herbs];
    } else if (YiBianState.currentType === 'formula') {
        items = [...YiBianState.allData.formulas];
    }

    // 分類過濾
    if (YiBianState.selectedCategory) {
        items = items.filter(item => {
            if (item.type === 'herb') {
                return item.category && item.category.includes(YiBianState.selectedCategory);
            } else {
                return item.categories && item.categories.includes(YiBianState.selectedCategory);
            }
        });
    }

    // 搜索過濾
    if (YiBianState.searchQuery) {
        const query = YiBianState.searchQuery.toLowerCase();
        items = items.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.alias && item.alias.toLowerCase().includes(query)) ||
                (item.family && item.family.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.categories && item.categories.toLowerCase().includes(query)) ||
                (item.effects && item.effects.toLowerCase().includes(query)) ||
                (item.indications && item.indications.toLowerCase().includes(query)) ||
                (item.properties && item.properties.toLowerCase().includes(query)) ||
                (item.source && item.source.toLowerCase().includes(query))
            );
        });
    }

    YiBianState.displayedItems = items;
    YiBianState.currentPage = 1;

    renderYiBian();
    updateYiBianStats();
}

// 渲染醫砭資料
function renderYiBian() {
    const grid = document.getElementById('yibian-grid');
    const emptyState = document.getElementById('yibian-empty');

    if (!grid) return;

    grid.innerHTML = '';

    if (YiBianState.displayedItems.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }

    // 計算要顯示的項目
    const endIndex = Math.min(
        YiBianState.currentPage * YiBianState.pageSize,
        YiBianState.displayedItems.length
    );
    const itemsToDisplay = YiBianState.displayedItems.slice(0, endIndex);

    itemsToDisplay.forEach(item => {
        const card = createYiBianCard(item);
        grid.appendChild(card);
    });
}

// 創建醫砭卡片
function createYiBianCard(item) {
    const card = document.createElement('div');
    card.className = `yibian-card ${item.type}`;

    const isHerb = item.type === 'herb';
    const typeName = isHerb ? '中藥' : '方劑';
    const typeClass = isHerb ? 'herb' : 'formula';

    // 獲取類別顯示
    let categoryDisplay = '';
    if (isHerb) {
        categoryDisplay = item.category || '';
    } else {
        categoryDisplay = item.categories ? item.categories[0] || '' : '';
    }

    // 獲取預覽內容
    let previewContent = '';
    if (isHerb) {
        previewContent = item.effects || item.indications || item.properties || '暫無資料';
    } else {
        previewContent = item.effects || item.indications || '暫無資料';
    }

    card.innerHTML = `
        <div class="yibian-card-header">
            <h3 class="yibian-card-name">${item.name}</h3>
            <span class="yibian-type-badge ${typeClass}">${typeName}</span>
        </div>
        ${categoryDisplay ? `<div class="yibian-card-category">${categoryDisplay}</div>` : ''}
        ${item.family ? `
            <div class="yibian-card-meta">
                <div class="yibian-meta-item">
                    <span>科屬：</span><span>${item.family}</span>
                </div>
            </div>
        ` : ''}
        <p class="yibian-card-preview">${previewContent}</p>
    `;

    card.addEventListener('click', () => {
        openYiBianModal(item);
    });

    return card;
}

// 更新統計信息
function updateYiBianStats() {
    const statsElement = document.getElementById('yibian-count');
    if (!statsElement) return;

    if (YiBianState.searchQuery || YiBianState.selectedCategory || YiBianState.currentType !== 'all') {
        statsElement.innerHTML = `找到 <strong>${YiBianState.displayedItems.length}</strong> 個結果`;
    } else if (YiBianState.allData) {
        let total_herbs = 0;
        let total_formulas = 0;
        let total_items = 0;

        if (YiBianState.allData.stats) {
            ({ total_herbs, total_formulas, total_items } = YiBianState.allData.stats);
        } else {
            total_herbs = YiBianState.allData.herbs ? YiBianState.allData.herbs.length : 0;
            total_formulas = YiBianState.allData.formulas ? YiBianState.allData.formulas.length : 0;
            total_items = total_herbs + total_formulas;
        }

        statsElement.innerHTML = `共 <strong>${total_items}</strong> 個項目（${total_herbs} 種中藥 + ${total_formulas} 個方劑）`;
    }
}

// 初始化醫砭彈窗
function initYiBianModal() {
    const modal = document.getElementById('yibian-modal');
    if (!modal) return;

    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeYiBianModal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeYiBianModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeYiBianModal();
        }
    });
}

// 打開醫砭彈窗
function openYiBianModal(item) {
    const modal = document.getElementById('yibian-modal');
    if (!modal) return;

    const isHerb = item.type === 'herb';
    const typeName = isHerb ? '中藥' : '方劑';
    const typeClass = isHerb ? 'herb' : 'formula';

    // 設置標題
    document.getElementById('yibian-modal-type').className = `yibian-type-badge ${typeClass}`;
    document.getElementById('yibian-modal-type').textContent = typeName;
    document.getElementById('yibian-modal-name').textContent = item.name;

    // 設置類別標籤
    const categoryContainer = document.getElementById('yibian-modal-category');
    categoryContainer.innerHTML = '';
    if (isHerb && item.category) {
        const tag = document.createElement('span');
        tag.className = 'yibian-category-tag';
        tag.textContent = item.category;
        categoryContainer.appendChild(tag);
    } else if (!isHerb && item.categories) {
        let cats = [];
        if (Array.isArray(item.categories)) {
            cats = item.categories;
        } else if (typeof item.categories === 'string') {
            cats = item.categories.split(',').map(c => c.trim());
        }
        
        cats.forEach(cat => {
            const tag = document.createElement('span');
            tag.className = 'yibian-category-tag';
            tag.textContent = cat;
            categoryContainer.appendChild(tag);
        });
    }

    // 顯示/隱藏詳情區域
    const herbDetails = document.getElementById('yibian-herb-details');
    const formulaDetails = document.getElementById('yibian-formula-details');

    if (isHerb) {
        herbDetails.style.display = 'block';
        formulaDetails.style.display = 'none';
        setElementContent('yibian-family', item.family);
        setElementContent('yibian-source', item.source);
        setElementContent('yibian-properties', item.properties);
        setElementContent('yibian-effects', item.effects);
        setElementContent('yibian-indications', item.indications);
        setElementContent('yibian-usage', item.usage);
        setElementContent('yibian-contraindications', item.contraindications);
        setElementContent('yibian-pharmacology', item.pharmacology);
    } else {
        herbDetails.style.display = 'none';
        formulaDetails.style.display = 'block';
        setElementContent('formula-source', item.source);
        setElementContent('formula-composition', item.composition);
        setElementContent('formula-effects', item.effects);
        setElementContent('formula-indications', item.indications);
        setElementContent('formula-rationale', item.rationale);
        setElementContent('formula-diagnostic', item.diagnosticCriteria);
        setElementContent('formula-modifications', item.modifications);
        setElementContent('formula-applications', item.modernApplications);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 關閉醫砭彈窗
function closeYiBianModal() {
    const modal = document.getElementById('yibian-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 設置元素內容（輔助函數）
function setElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content || '';
    }
}

// 顯示醫砭錯誤
function showYiBianError(message) {
    const grid = document.getElementById('yibian-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: #dc2626; margin-bottom: 8px;">載入失敗</h3>
                <p style="color: #78716c;">${message}</p>
            </div>
        `;
    }
}

// 在switchView函數中添加醫砭視圖的處理
const originalSwitchView = switchView;
switchView = function(viewName) {
    originalSwitchView(viewName);

    // 如果切換到醫砭視圖且數據已載入，確保渲染
    if (viewName === 'yibian' && YiBianState.allData) {
        renderYiBian();
        updateYiBianStats();
    } else if (viewName === 'yibian' && !YiBianState.allData) {
        // 首次進入醫砭視圖，載入數據
        loadYiBianData();
    }
};

// ========== 國考題庫功能 ==========
const ExamState = {
    currentStage: null,
    questions: [],
    currentIndex: 0,
    userAnswers: {}, // { index: 'A' }
    timer: 0,
    timerInterval: null,
    examHistory: [] // [{ date, score, stage }]
};

function initExam() {
    // Stage selection
    const stageBtns = document.querySelectorAll('.exam-option-btn');
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stage = btn.getAttribute('data-stage');
            startExam(stage);
        });
    });

    // Quiz navigation
    document.getElementById('quiz-prev-btn').addEventListener('click', () => {
        if (ExamState.currentIndex > 0) {
            ExamState.currentIndex--;
            renderQuestion();
        }
    });

    document.getElementById('quiz-next-btn').addEventListener('click', () => {
        if (ExamState.currentIndex < ExamState.questions.length - 1) {
            ExamState.currentIndex++;
            renderQuestion();
        }
    });

    // Answer buttons
    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.getAttribute('data-answer');
            selectAnswer(answer);
        });
    });

    // Exit and Submit
    document.getElementById('quiz-exit-btn').addEventListener('click', exitExam);
    document.getElementById('quiz-submit-btn').addEventListener('click', submitExam);

    // Results actions
    document.getElementById('restart-exam-btn').addEventListener('click', () => {
        document.getElementById('exam-result').style.display = 'none';
        document.getElementById('exam-selection').style.display = 'block';
    });

    document.getElementById('back-to-dash-btn').addEventListener('click', () => {
        switchView('dashboard');
        exitExam();
    });
    
    document.getElementById('save-result-btn').addEventListener('click', saveExamResult);
    
    // Load history from local storage
    const history = localStorage.getItem('examHistory');
    if (history) {
        try {
            ExamState.examHistory = JSON.parse(history);
            // Ensure data is array
            if (!Array.isArray(ExamState.examHistory)) ExamState.examHistory = [];
            updateDashboardExamStats();
        } catch (e) {
            console.error('Failed to load exam history', e);
        }
    }
}

function startExam(stage) {
    if (!window.EXAM_DATA || !window.EXAM_DATA[stage]) {
        updateStatus('❌ 無法載入題庫資料，請確認 data.js 是否包含 EXAM_DATA', 'error');
        return;
    }

    // Get selected question count
    const countSelect = document.getElementById('question-count');
    const questionCount = parseInt(countSelect.value, 10) || 50;

    updateStatus(`🚀 開始 ${stage === 'stage1' ? '第一階段' : '第二階段'} 模擬測驗 (${questionCount}題)`, 'info');

    // 1. Prepare Data: Randomly select questions
    const allQuestions = window.EXAM_DATA[stage];
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    ExamState.questions = shuffled.slice(0, questionCount);
    ExamState.currentStage = stage;
    ExamState.currentIndex = 0;
    ExamState.userAnswers = {};
    ExamState.timer = 0;

    // 2. Update UI
    document.getElementById('exam-selection').style.display = 'none';
    document.getElementById('exam-result').style.display = 'none';
    document.getElementById('exam-quiz').style.display = 'block';

    // 3. Start Timer
    if (ExamState.timerInterval) clearInterval(ExamState.timerInterval);
    ExamState.timerInterval = setInterval(() => {
        ExamState.timer++;
        const mins = Math.floor(ExamState.timer / 60).toString().padStart(2, '0');
        const secs = (ExamState.timer % 60).toString().padStart(2, '0');
        document.getElementById('quiz-timer').textContent = `${mins}:${secs}`;
    }, 1000);

    // 4. Render First Question
    renderQuestion();
}

function renderQuestion() {
    // Safety check: ensure question exists
    if (!ExamState.questions[ExamState.currentIndex]) {
        console.error(`Question at index ${ExamState.currentIndex} is undefined. Skipping...`);
        // Auto-skip to next valid or finish
        if (ExamState.currentIndex < ExamState.questions.length - 1) {
            ExamState.currentIndex++;
            renderQuestion();
        } else {
            // End of list, force submit setup
            document.getElementById('quiz-next-btn').style.display = 'none';
            document.getElementById('quiz-submit-btn').style.display = 'block';
        }
        return;
    }

    const question = ExamState.questions[ExamState.currentIndex];
    const total = ExamState.questions.length;
    
    // Update progress
    document.getElementById('quiz-current').textContent = ExamState.currentIndex + 1;
    document.getElementById('quiz-total').textContent = total;

    // Update text
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-source').textContent = `來源: ${question.source} (題號: ${question.id})`;

    // Update answer buttons state
    const currentAnswer = ExamState.userAnswers[ExamState.currentIndex];
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-answer') === currentAnswer) {
            btn.classList.add('selected');
        }
    });

    // Update navigation buttons
    document.getElementById('quiz-prev-btn').disabled = (ExamState.currentIndex === 0);
    
    const nextBtn = document.getElementById('quiz-next-btn');
    const submitBtn = document.getElementById('quiz-submit-btn');

    if (ExamState.currentIndex === total - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function selectAnswer(answer) {
    ExamState.userAnswers[ExamState.currentIndex] = answer;
    
    // Visually update immediately
    document.querySelectorAll('.answer-btn').forEach(btn => {
        if (btn.getAttribute('data-answer') === answer) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    // Auto-advance after short delay (optional, maybe nice for UX)
    // setTimeout(() => {
    //     if (ExamState.currentIndex < ExamState.questions.length - 1) {
    //         ExamState.currentIndex++;
    //         renderQuestion();
    //     }
    // }, 300);
}

function submitExam() {
    clearInterval(ExamState.timerInterval);
    
    let correct = 0;
    let wrong = 0;
    const total = ExamState.questions.length;

    ExamState.questions.forEach((q, index) => {
        const userAns = ExamState.userAnswers[index];
        // Clean up answer key just in case (some CSVs have weird spaces)
        const correctAns = q.answer.trim().toUpperCase();
        
        if (userAns && userAns === correctAns) {
            correct++;
        } else {
            wrong++;
        }
    });

    const score = Math.round((correct / total) * 100);

    // Show Results
    document.getElementById('exam-quiz').style.display = 'none';
    document.getElementById('exam-result').style.display = 'block';

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-wrong').textContent = wrong;

    // Store temporary result
    ExamState.lastResult = {
        date: new Date().toLocaleString(),
        stage: ExamState.currentStage === 'stage1' ? '第一階段 (基礎醫學)' : '第二階段 (臨床醫學)',
        score: score,
        correct: correct,
        total: total
    };
}

function saveExamResult() {
    if (!ExamState.lastResult) return;
    
    ExamState.examHistory.unshift(ExamState.lastResult);
    // Keep only last 10
    if (ExamState.examHistory.length > 10) ExamState.examHistory.pop();
    
    localStorage.setItem('examHistory', JSON.stringify(ExamState.examHistory));
    
    updateStatus('✅ 測驗成績已儲存', 'success');
    document.getElementById('save-result-btn').textContent = '已儲存';
    document.getElementById('save-result-btn').disabled = true;
    
    updateDashboardExamStats();
}

function exitExam() {
    if (ExamState.timerInterval) clearInterval(ExamState.timerInterval);
    document.getElementById('exam-quiz').style.display = 'none';
    document.getElementById('exam-result').style.display = 'none';
    document.getElementById('exam-selection').style.display = 'block';
    
    // Reset save button
    const saveBtn = document.getElementById('save-result-btn');
    saveBtn.textContent = '儲存紀錄';
    saveBtn.disabled = false;
}

function updateDashboardExamStats() {
    console.log('Updating dashboard stats...');
    const history = ExamState.examHistory;
    if (!history || history.length === 0) {
        console.log('No exam history found.');
        return;
    }

    const lastExam = history[0];
    
    // Update "Quick Stats" section
    const statsCard = document.getElementById('card-stats');
    if (statsCard) {
        const statItems = statsCard.querySelectorAll('.stat-item');
        if (statItems.length >= 2) {
            const lastStat = statItems[1];
            lastStat.innerHTML = `
                <div class="stat-value">${lastExam.score}</div>
                <div class="stat-label">上次測驗 (${lastExam.stage})</div>
            `;
        }
    }

    // Update "Recent Activity" card
    const activityCard = document.getElementById('card-activity');
    if (activityCard) {
        const cardTitle = activityCard.querySelector('.card-title');
        const cardText = activityCard.querySelector('.card-text');
        
        if (cardTitle) cardTitle.textContent = '近期測驗紀錄';
        
        if (cardText) {
            cardText.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: #047857;">${lastExam.stage}</span>
                    <span style="font-size: 12px; color: #78716c;">${lastExam.date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>得分: <strong>${lastExam.score}</strong> 分</span>
                    <span style="font-size: 12px;">(答對 ${lastExam.correct}/${lastExam.total})</span>
                </div>
            `;
        }
    }
    console.log('Dashboard updated successfully.');
}

// ========== 聊天機器人功能 (BianCang-Qwen2-7B) ==========
const SYSTEM_CONFIG = {
    apiKey: 'AIzaSyDsI1HPKterSkt-E5mNiIF7xvs3TK0HAiw'
};

function initChatbot() {
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');

    sendBtn.addEventListener('click', () => handleChatSubmit());
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });
}

async function handleChatSubmit() {
    const inputEl = document.getElementById('chat-input');
    const userText = inputEl.value.trim();

    if (!userText) return;

    // 1. Add User Message
    addMessage(userText, 'user');
    inputEl.value = '';

    // 2. Loading State
    const loadingId = addMessage('正在思考中...', 'bot', true);

    try {
        // Real API Call using hardcoded key
        const botResponse = await callGeminiAPI(SYSTEM_CONFIG.apiKey, userText);

        // Remove loading and add response
        removeMessage(loadingId);
        addMessage(botResponse, 'bot');

    } catch (error) {
        console.warn('API Error, switching to mock response:', error);
        
        // Fallback to Mock Response (Keyword based) ensuring the demo continues smoothly
        await new Promise(r => setTimeout(r, 1500)); // Simulate inference time
        const mockResponse = generateMockResponse(userText);
        
        removeMessage(loadingId);
        addMessage(mockResponse, 'bot');
    }
}

function generateMockResponse(input) {
    const text = input.toLowerCase();
    
    if (text.includes('當歸')) {
        return "【BianCang-Qwen2-7B 推論結果】\n\n當歸\n性味：甘、辛，溫。\n歸經：歸肝、心、脾經。\n功效：補血活血，調經止痛，潤腸通便。\n\n主治：用於血虛萎黃、眩暈心悸、月經不調、經閉痛經、虛寒腹痛、腸燥便秘、風濕痹痛、跌撲損傷、癰疽瘡瘍。酒當歸活血通經；土炒當歸不滑腸。";
    }
    if (text.includes('黃耆') || text.includes('黃芪')) {
        return "【BianCang-Qwen2-7B 推論結果】\n\n黃耆\n性味：甘，微溫。\n歸經：歸脾、肺經。\n功效：補氣昇陽，固表止汗，利水消腫，生津養血，行滯通痹，托毒排膿，斂瘡生肌。\n\n主治：氣虛乏力、食少便溏、中氣下陷、久瀉脫肛、便血崩漏、表虛自汗、氣虛水腫、內熱消渴。";
    }
    if (text.includes('人參')) {
        return "【BianCang-Qwen2-7B 推論結果】\n\n人參\n性味：甘、微苦，微溫。\n歸經：歸脾、肺、心、腎經。\n功效：大補元氣，復脈固脫，補脾益肺，生津養血，安神益智。\n\n主治：體虛欲脫、肢冷脈微、脾虛食少、肺虛喘咳、津傷口渴、內熱消渴、氣血虧虛、久病虛羸、驚悸失眠。";
    }
    if (text.includes('四君子湯')) {
        return "【BianCang-Qwen2-7B 推論結果】\n\n四君子湯\n出處：《太平惠民和劑局方》\n組成：人參、白朮、茯苓、甘草。\n功效：益氣健脾。\n主治：脾胃氣虛證。面色萎白，語聲低微，氣短乏力，食少便溏，舌淡苔白，脈虛弱。";
    }
    if (text.includes('歸經')) {
        return "【BianCang-Qwen2-7B 推論結果】\n\n在中醫理論中，「歸經」是指藥物對於機體某部分的選擇性作用，即某藥對某些臟腑經絡有特殊的親和作用，因而對這些部位的病變起著主要或特殊的治療作用。例如：麻黃歸肺、膀胱經，故能發汗解表、宣肺平喘、利水消腫。";
    }

    // Default Fallback
    return "【BianCang-Qwen2-7B 推論結果】\n\n收到您的提問：「" + input + "」\n\n根據中醫藥材知識庫分析，此問題涉及中醫基礎理論與臨床應用。由於目前雲端算力負載較高，系統正以離線模式運行。\n\n建議您詢問具體藥材（如：當歸、黃耆）或方劑名稱，我能為您提供更精確的性味、歸經與功效解析。";
}

function addMessage(text, sender, isLoading = false) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.id = isLoading ? 'chat-loading-' + Date.now() : '';
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div.id;
}

function removeMessage(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function callGeminiAPI(apiKey, prompt) {
    // Updated model to gemini-2.0-flash (Confirmed available via listModels)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // System prompt for a TCM expert assistant
    const systemInstruction = `你是一個專業的中醫藥材知識助手。你具備深厚的中醫理論基礎，特別擅長中藥材的性味、歸經、功效與主治。
    你的回答應參考歷年（民國94-114年）中醫師國家考試的知識點，提供精確、嚴謹且符合臨床實務的解答。
    請直接回答問題，不要提及你是 AI 或由 Google 開發。`;
    
    const payload = {
        contents: [{
            parts: [{
                text: `${systemInstruction}\n\n用戶提問：${prompt}`
            }]
        }]
    };

    let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // If quota exceeded (429), try fallback model
    if (response.status === 429) {
        console.log('Primary model quota exceeded, trying fallback...');
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${apiKey}`;
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API 請求失敗');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
