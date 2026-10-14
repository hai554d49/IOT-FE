// Điều hướng SPA
const navDashboard = document.getElementById('nav-dashboard');
const navDataSensor = document.getElementById('nav-datasensor');
const navHistory = document.getElementById('nav-history');
const navProfile = document.getElementById('nav-profile');

const viewDashboard = document.getElementById('view-dashboard');
const viewDataSensor = document.getElementById('view-datasensor');
const viewHistory = document.getElementById('view-history');
const viewProfile = document.getElementById('view-profile');

const navLinks = [navDashboard, navDataSensor, navHistory, navProfile];
const views = [viewDashboard, viewDataSensor, viewHistory, viewProfile];

function switchTab(activeNav, activeView) {
    navLinks.forEach(nav => {
        nav.className = "flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-slate-300 font-medium transition-all";
    });
    activeNav.className = "flex items-center gap-3 p-3 rounded-lg bg-primary/20 text-white font-medium transition-all";

    views.forEach(v => v.classList.add('hidden'));
    activeView.classList.remove('hidden');
}

navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab(navDashboard, viewDashboard); });
navDataSensor.addEventListener('click', (e) => { e.preventDefault(); switchTab(navDataSensor, viewDataSensor); });
navHistory.addEventListener('click', (e) => { e.preventDefault(); switchTab(navHistory, viewHistory); });
navProfile.addEventListener('click', (e) => { e.preventDefault(); switchTab(navProfile, viewProfile); });

// Quản lý thông báo
const notificationBtn = document.getElementById('notification-btn');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationBadge = document.getElementById('notification-badge');
const markAllRead = document.getElementById('mark-all-read');
const notificationList = document.getElementById('notification-list');

let unreadCount = 0;

notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown.classList.toggle('hidden');
    if (!notificationDropdown.classList.contains('hidden')) {
        unreadCount = 0;
        updateBadge();
    }
});

window.addEventListener('click', () => {
    if (!notificationDropdown.classList.contains('hidden')) {
        notificationDropdown.classList.add('hidden');
    }
});

notificationDropdown.addEventListener('click', (e) => { e.stopPropagation(); });

markAllRead.addEventListener('click', () => {
    unreadCount = 0;
    updateBadge();
    notificationDropdown.classList.add('hidden');
});

function updateBadge() {
    if (unreadCount > 0) {
        notificationBadge.innerText = unreadCount;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
}

function addNotification(deviceName, status) {
    const timeStr = "Vừa xong";
    const statusText = status ? "được Bật" : "được Tắt";
    const iconClass = status ? "fa-check-circle text-green-600 bg-green-100" : "fa-info-circle text-slate-600 bg-slate-100";

    const newNotificationHTML = `
        <div class="py-3 flex gap-3 items-start">
            <div class="w-8 h-8 rounded-full ${iconClass} flex items-center justify-center shrink-0 mt-0.5">
                <i class="fa ${status ? 'fa-bolt' : 'fa-power-off'} text-sm"></i>
            </div>
            <div>
                <p class="text-xs font-semibold text-dark">Trạng thái thiết bị thay đổi</p>
                <p class="text-xs text-slate-500 mt-0.5">${deviceName} đã ${statusText}.</p>
                <span class="text-[10px] text-slate-400 mt-1 block">${timeStr}</span>
            </div>
        </div>
    `;
    notificationList.insertAdjacentHTML('afterbegin', newNotificationHTML);
    unreadCount++;
    updateBadge();
}

// ================= ACTION HISTORY LOGIC =================
let actionRecords = [];
let actionIdCounter = 1;
let currentHistoryPage = 1;
let historyPageSize = 50;

const historyTableBody = document.getElementById('history-table-body');
const historyPaginationInfo = document.getElementById('history-pagination-info');
const historyPaginationButtons = document.getElementById('history-pagination-buttons');
const historyPageSizeSelect = document.getElementById('history-page-size');

historyPageSizeSelect.addEventListener('change', (e) => {
    historyPageSize = parseInt(e.target.value);
    renderHistoryTable(getFilteredHistoryRecords(), 1);
});

function getFilteredHistoryRecords() {
    const query = historySearchInput.value.trim().toLowerCase();
    const deviceVal = historyDeviceFilter.value;
    const actionVal = historyActionFilter.value;
    const statusVal = historyStatusFilter.value;

    return actionRecords.filter(rec => {
        if (deviceVal !== 'all' && rec.deviceName !== deviceVal) return false;
        if (actionVal === 'on' && !rec.status) return false;
        if (actionVal === 'off' && rec.status) return false;
        if (statusVal !== 'all' && rec.historyStatus.toLowerCase() !== statusVal) return false;

        if (query) {
            const actionText = rec.status ? "bật" : "tắt";
            const matchDevice = rec.deviceName.toLowerCase().includes(query);
            const matchTime = rec.time.toLowerCase().includes(query);
            const matchAction = actionText.includes(query);
            const matchStatus = rec.historyStatus.toLowerCase().includes(query);
            return matchDevice || matchTime || matchAction || matchStatus;
        }

        return true;
    });
}

function renderHistoryTable(dataArray, page = 1) {
    currentHistoryPage = page;
    historyTableBody.innerHTML = '';
    
    if (dataArray.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="6" class="p-5 text-center text-slate-400">Không tìm thấy lịch sử thao tác nào phù hợp.</td></tr>`;
        historyPaginationInfo.innerText = `Hiển thị 0 thao tác`;
        historyPaginationButtons.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(dataArray.length / historyPageSize);
    if (currentHistoryPage > totalPages) currentHistoryPage = totalPages;

    const startIdx = (currentHistoryPage - 1) * historyPageSize;
    const endIdx = startIdx + historyPageSize;
    const pageData = dataArray.slice(startIdx, endIdx);

    pageData.forEach(rec => {
        const actionText = rec.status ? "BẬT" : "TẮT";
        
        let statusBadge = '';
        if (rec.historyStatus === 'SUCCESS') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200 text-xs"><i class="fa fa-check-circle text-sm"></i> Success</span>`;
        } else if (rec.historyStatus === 'FAIL') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold border border-red-200 text-xs"><i class="fa fa-times-circle text-sm"></i> Fail</span>`;
        } else if (rec.historyStatus === 'PENDING') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold border border-amber-200 text-xs"><i class="fa fa-clock-o text-sm"></i> Pending</span>`;
        }

        const rowHTML = `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-5 font-medium text-slate-500">#${rec.id}</td>
                <td class="p-5">
                    <div class="flex items-center gap-2">
                        <i class="fa ${rec.icon} text-yellow-500 text-lg w-5 text-center"></i>
                        <span class="font-medium">${rec.deviceName}</span>
                    </div>
                </td>
                <td class="p-5 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 text-xs">
                        ${actionText}
                    </span>
                </td>
                <td class="p-5 text-center">${statusBadge}</td>
                <td class="p-5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">U1</div>
                        <span>User1</span>
                    </div>
                </td>
                <td class="p-5 text-slate-500">${rec.time}</td>
            </tr>
        `;
        historyTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });

    historyPaginationInfo.innerText = `Hiển thị ${startIdx + 1} đến ${Math.min(endIdx, dataArray.length)} trong số ${dataArray.length} thao tác`;

    let paginationHTML = `
        <button onclick="changeHistoryPage(${currentHistoryPage - 1}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${currentHistoryPage === 1 ? 'cursor-not-allowed opacity-50' : ''}"><i class="fa fa-angle-left"></i></button>
    `;
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentHistoryPage) {
            paginationHTML += `<button class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-medium shadow-sm">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changeHistoryPage(${i}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">${i}</button>`;
        }
    }
    paginationHTML += `
        <button onclick="changeHistoryPage(${currentHistoryPage + 1}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${currentHistoryPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}"><i class="fa fa-angle-right"></i></button>
    `;
    historyPaginationButtons.innerHTML = paginationHTML;
}

window.changeHistoryPage = function(targetPage, totalPages) {
    if (targetPage < 1 || targetPage > totalPages) return;
    renderHistoryTable(getFilteredHistoryRecords(), targetPage);
};

renderHistoryTable(actionRecords);

// Xử lý Tìm kiếm & Lọc Action History
const historySearchBtn = document.getElementById('history-search-btn');
const historySearchInput = document.getElementById('history-search-input');
const historyDeviceFilter = document.getElementById('history-device-filter');
const historyActionFilter = document.getElementById('history-action-filter');
const historyStatusFilter = document.getElementById('history-status-filter');

historySearchBtn.addEventListener('click', () => {
    renderHistoryTable(getFilteredHistoryRecords(), 1);
});


// ================= DATA SENSOR LOGIC =================
let sensorRecords = [];
let sensorIdCounter = 1;
let pendingRecords = [];
let currentSensorPage = 1;
let sensorPageSize = 50;

const sensorTableBody = document.getElementById('sensor-table-body');
const paginationInfo = document.getElementById('sensor-pagination-info');
const sensorPaginationButtons = document.getElementById('sensor-pagination-buttons');
const sensorPageSizeSelect = document.getElementById('sensor-page-size');

sensorPageSizeSelect.addEventListener('change', (e) => {
    sensorPageSize = parseInt(e.target.value);
    renderSensorTable(getFilteredSensorRecords(), 1);
});

function getFilteredSensorRecords() {
    const query = sensorSearchInput.value.trim().toLowerCase();
    const selectedType = sensorTypeFilter.value;

    return sensorRecords.filter(item => {
        if (selectedType !== 'all' && item.type !== selectedType) return false;

        if (query) {
            const matchValue = String(item.value).toLowerCase().includes(query);
            const matchTime = item.measured_at.toLowerCase().includes(query);
            const matchId = String(item.id).toLowerCase().includes(query);
            return matchValue || matchTime || matchId;
        }

        return true;
    });
}

function renderSensorTable(dataArray, page = 1) {
    currentSensorPage = page;
    sensorTableBody.innerHTML = '';
    
    if (dataArray.length === 0) {
        sensorTableBody.innerHTML = `<tr><td colspan="4" class="p-5 text-center text-slate-400">Không tìm thấy dữ liệu phù hợp hoặc chưa có bản ghi cảm biến.</td></tr>`;
        paginationInfo.innerText = `Hiển thị 0 kết quả`;
        sensorPaginationButtons.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(dataArray.length / sensorPageSize);
    if (currentSensorPage > totalPages) currentSensorPage = totalPages;

    const startIdx = (currentSensorPage - 1) * sensorPageSize;
    const endIdx = startIdx + sensorPageSize;
    const pageData = dataArray.slice(startIdx, endIdx);

    pageData.forEach(item => {
        let typeLabel = '';
        let valueDisplay = '';
        let iconHtml = '';

        if (item.type === 'temperature') {
            typeLabel = 'Nhiệt độ';
            valueDisplay = `<span class="font-bold text-orange-600 text-base">${item.value}°C</span>`;
            iconHtml = `<i class="fa fa-thermometer-half text-orange-500 text-lg"></i>`;
        } else if (item.type === 'humidity') {
            typeLabel = 'Độ ẩm';
            valueDisplay = `<span class="font-bold text-blue-600 text-base">${item.value}%</span>`;
            iconHtml = `<i class="fa fa-tint text-blue-500 text-lg"></i>`;
        } else if (item.type === 'light') {
            typeLabel = 'Ánh sáng';
            valueDisplay = `<span class="font-bold text-yellow-600 text-base">${item.value} Lux</span>`;
            iconHtml = `<i class="fa fa-sun-o text-yellow-500 text-lg"></i>`;
        }

        const rowHTML = `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-5 font-medium text-slate-500">#${item.id}</td>
                <td class="p-5">
                    <div class="flex items-center gap-2">
                        ${iconHtml}
                        <span class="font-semibold text-slate-700">${typeLabel}</span>
                    </div>
                </td>
                <td class="p-5">${valueDisplay}</td>
                <td class="p-5 text-slate-500">${item.measured_at}</td>
            </tr>
        `;
        sensorTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });

    paginationInfo.innerText = `Hiển thị ${startIdx + 1} đến ${Math.min(endIdx, dataArray.length)} trong số ${dataArray.length} kết quả`;

    let paginationHTML = `
        <button onclick="changeSensorPage(${currentSensorPage - 1}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${currentSensorPage === 1 ? 'cursor-not-allowed opacity-50' : ''}"><i class="fa fa-angle-left"></i></button>
    `;
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentSensorPage) {
            paginationHTML += `<button class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-medium shadow-sm">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changeSensorPage(${i}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">${i}</button>`;
        }
    }
    paginationHTML += `
        <button onclick="changeSensorPage(${currentSensorPage + 1}, ${totalPages})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${currentSensorPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}"><i class="fa fa-angle-right"></i></button>
    `;
    sensorPaginationButtons.innerHTML = paginationHTML;
}

window.changeSensorPage = function(targetPage, totalPages) {
    if (targetPage < 1 || targetPage > totalPages) return;
    renderSensorTable(getFilteredSensorRecords(), targetPage);
};

renderSensorTable(sensorRecords);

const refreshBtn = document.getElementById('refresh-btn');
refreshBtn.addEventListener('click', () => {
    if (pendingRecords.length === 0) {
        alert("Chưa có dữ liệu mới nào được ghi nhận thêm. Vui lòng đợi thêm vài giây!");
        return;
    }

    pendingRecords.forEach(rec => {
        const baseId = sensorIdCounter++;
        sensorRecords.unshift(
            { id: baseId, type: 'temperature', value: rec.temp, measured_at: rec.measured_at },
            { id: baseId, type: 'humidity', value: rec.humidity, measured_at: rec.measured_at },
            { id: baseId, type: 'light', value: rec.light, measured_at: rec.measured_at }
        );
    });

    pendingRecords = [];
    renderSensorTable(getFilteredSensorRecords(), 1);
});

const sensorSearchBtn = document.getElementById('sensor-search-btn');
const sensorSearchInput = document.getElementById('sensor-search-input');
const sensorTypeFilter = document.getElementById('sensor-type-filter');

sensorSearchBtn.addEventListener('click', () => {
    renderSensorTable(getFilteredSensorRecords(), 1);
});

// ================= DASHBOARD CHARTS & CONTROLS =================
const dataToday = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    temp: [19, 23.5, 23, 26, 22, 22.2, 20.8],
    humidity: [24, 22, 23.2, 22.5, 25.5, 26, 23],
    light: [420, 680, 850, 920, 710, 380, 150]
};

const ctx = document.getElementById('environmentChart').getContext('2d');
const environmentChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dataToday.labels,
        datasets: [
            {
                label: 'Nhiệt độ (°C)',
                data: dataToday.temp,
                borderColor: '#FF7D00',
                backgroundColor: 'rgba(255, 125, 0, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Độ ẩm (%)',
                data: dataToday.humidity,
                borderColor: '#1677FF',
                backgroundColor: 'rgba(22, 119, 255, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Ánh sáng (Lux)',
                data: dataToday.light,
                borderColor: '#FAAD14',
                backgroundColor: 'rgba(250, 173, 20, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { 
            position: 'top',
            onClick: function(e, legendItem, legend) {return;} 
        } },
        scales: {
            y: { 
                type: 'linear', 
                display: true, 
                position: 'left',
                min: 0,
                max: 100,
                title: { display: true, text: 'Nhiệt độ (°C) & Độ ẩm (%)' }
            },
            y1: { 
                type: 'linear', 
                display: true, 
                position: 'right',
                min: 0,
                max: 1000,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Ánh sáng (Lux)' }
            }
        }
    }
});

const btnToday = document.getElementById('btn-today');

btnToday.addEventListener('click', () => {
    btnToday.className = "px-3 py-1 text-sm bg-primary text-white rounded-lg transition-all";
    environmentChart.data.labels = dataToday.labels;
    environmentChart.data.datasets[0].data = dataToday.temp;
    environmentChart.data.datasets[1].data = dataToday.humidity;
    environmentChart.data.datasets[2].data = dataToday.light;
    environmentChart.update();
});

// Xử lý bật/tắt thiết bị
document.querySelectorAll('.device-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
        const iconContainer = document.getElementById(this.getAttribute('data-target'));
        const activeBg = this.getAttribute('data-active-bg');
        const activeText = this.getAttribute('data-active-text');
        const deviceName = this.getAttribute('data-name');
        const deviceIcon = this.getAttribute('data-icon');

        if (this.checked) {
            iconContainer.className = `w-10 h-10 rounded-lg flex items-center justify-center ${activeBg} ${activeText} transition-all`;
        } else {
            iconContainer.className = "w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-400 transition-all";
        }

        addNotification(deviceName, this.checked);

        const now = new Date();
        const timeStr = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0') + ' ' + 
                        String(now.getHours()).padStart(2, '0') + ':' + 
                        String(now.getMinutes()).padStart(2, '0') + ':' + 
                        String(now.getSeconds()).padStart(2, '0');

        const rand = Math.random();
        let hStatus = 'SUCCESS';
        if (rand > 0.85) hStatus = 'FAIL';
        else if (rand > 0.7) hStatus = 'PENDING';

        actionRecords.unshift({
            id: actionIdCounter++,
            deviceName: deviceName,
            icon: deviceIcon,
            status: this.checked,
            historyStatus: hStatus,
            time: timeStr
        });
        renderHistoryTable(getFilteredHistoryRecords(), 1);
    });
});

// Vòng lặp cảm biến nền (mỗi 3 giây)
setInterval(() => {
    const tempEl = document.getElementById('temp-value');
    let currentTemp = parseFloat(tempEl.innerText);
    let newTemp = (currentTemp + (Math.random() * 0.4 - 0.2)).toFixed(1);
    tempEl.innerText = newTemp + '°C';

    const humEl = document.getElementById('humidity-value');
    let currentHum = parseInt(humEl.innerText);
    let newHum = Math.min(95, Math.max(30, Math.round(currentHum + (Math.random() * 2 - 1))));
    humEl.innerText = newHum + '%';

    const lightEl = document.getElementById('light-value');
    let currentLight = parseInt(lightEl.innerText);
    let newLight = Math.min(1000, Math.max(100, Math.round(currentLight + (Math.random() * 10 - 5))));
    lightEl.innerText = newLight + ' Lux';

    const now = new Date();
    const timeStr = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0') + ':' + 
                    String(now.getSeconds()).padStart(2, '0');

    pendingRecords.push({
        temp: newTemp,
        humidity: newHum,
        light: newLight,
        measured_at: timeStr
    });

    const lastIndex = environmentChart.data.datasets[0].data.length - 1;
    environmentChart.data.datasets[0].data[lastIndex] = parseFloat(newTemp);
    environmentChart.data.datasets[1].data[lastIndex] = newHum;
    environmentChart.data.datasets[2].data[lastIndex] = newLight;
    environmentChart.update('none');
}, 3000);