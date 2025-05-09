// 監聽來自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractData") {
        try {
            const data = extractTensorboardData();
            sendResponse({success: true, data: data});
        } catch (error) {
            sendResponse({success: false, error: error.message});
        }
    }
    return true;  // 保持消息通道開啟，以便異步響應
});

// 從 TensorBoard 提取數據的函數
function extractTensorboardData() {
    // 檢查是否在 TensorBoard 頁面
    if (document.title !== "TensorBoard" && !window.location.href.includes("tensorboard")) {
        alert("This doesn't appear to be a TensorBoard page");
        return null;
    }

    // 獲取頁面上的所有文本
    const pageText = document.body.innerText || document.body.textContent;
    if (!pageText) {
        alert("Could not extract text from the page");
        return null;
    }

    // 分割為行
    const lines = pageText.split('\n').map(line => line.trim()).filter(line => line);

    // 尋找包含 "Run", "Min", "Max" 的標題行
    let headerIndex = -1;
    for (let i = 0; i < lines.length - 3; i++) {
        if (lines[i].includes('Run') && lines[i + 1].includes('Min') && lines[i + 2].includes('Max')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        alert("Could not find header row with 'Run', 'Min', 'Max' columns");
        return null;
    }

    // 提取數據行
    const results = [];

    // exp name extract
    // if find the first 'Run' and 'All', exp name is between the two
    const exp_name_list = [];
    let first_Run_arrive = -1;
    let first_All_arrive = -1;
    console.log("start extract exp name")
    for (let i = 0; i < lines.length; i++) {
        const item = lines[i];
        if (item === 'Run') {
            first_Run_arrive = i;
        } else if (first_Run_arrive !== -1 && item === 'All') {
            first_All_arrive = i;
            break;
        }

        if (first_Run_arrive !== -1 && first_All_arrive === -1 && item !== 'Run') {
            // 已經到first_Run但還沒到first_All
            console.log(item)
            exp_name_list.push(item);
        }
    }

    // 如果遇到exp_name內的任何一項數據，就把他的下1(min)、下2(max) push進result
    // 從第一次遇到RUN + ALL之後才開始需要解析
    let i = first_All_arrive;
    // 如果沒有遇到exp_name內的任何一項數據，就跳過，直到exp_name內的任何一項數據都看過了
    while (i < lines.length && results.length < exp_name_list.length) {
        i += 1;
        const line = lines[i];
        // 如果line不相符exp_name內的任何一項數據，就跳過
        for (let j = 0; j < exp_name_list.length; j++) {
            if (line === exp_name_list[j]) {
                results.push({name: line, minValue: parseFloat(lines[i + 1]), maxValue: parseFloat(lines[i + 2])})
                break;
            }
        }
    }

    return results;
}

// 複製到剪貼板的輔助函數
function copyToClipboard(text) {
    // 創建一個臨時文本區域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        // 嘗試使用 document.execCommand 複製
        const success = document.execCommand('copy');
        if (success) {
            alert(`數據已複製到剪貼板。`);
        } else {
            alert(`複製到剪貼板失敗。請查看控制台輸出。`);
            console.log(text);
        }
    } catch (err) {
        alert(`複製到剪貼板失敗: ${err}`);
        console.log(text);
    } finally {
        document.body.removeChild(textarea);
    }
}