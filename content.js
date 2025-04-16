// 監聽來自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    try {
      const data = extractTensorboardData();
      sendResponse({ success: true, data: data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
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
  for (let i = 0; i < lines.length-3; i++) {
    if (lines[i].includes('Run') && lines[i+1].includes('Min') && lines[i+2].includes('Max')) {
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

  // 根據您提供的 CSV 數據，我們可以看到數據行的格式
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];

    // 檢查行是否可能包含數據
    if (!line || !line.includes('\\') || !line.includes('.')) continue;

    // 檢查是否已經到了下一個部分
    if (line.includes('acc3 cards') || line.includes('base_lr')) break;

    // 分割行內容，但保留實驗名稱中的空格
    // 首先找到第一個數字的位置
    const firstNumberIndex = line.search(/\d\.\d/);
    if (firstNumberIndex === -1) continue;

    // 提取實驗名稱和數據部分
    const name = line.substring(0, firstNumberIndex).trim();
    const dataText = line.substring(firstNumberIndex);

    // 從數據部分提取 Min 和 Max
    const dataParts = dataText.split(/\s+/).filter(p => p);
    if (dataParts.length < 2) continue;

    const minValue = parseFloat(dataParts[0]);
    const maxValue = parseFloat(dataParts[1]);

    if (!isNaN(minValue) && !isNaN(maxValue)) {
      results.push({ name, minValue, maxValue });
    }
  }

  if (results.length === 0) {
    // 如果上面的方法失敗，嘗試一個更寬鬆的方法
    return extractDataUsingRegex();
  }

  // 將結果複製到剪貼板
  const csvContent = "Name,Min,Max\n" +
    results.map(r => `"${r.name}",${r.minValue},${r.maxValue}`).join('\n');

  copyToClipboard(csvContent);

  return results;
}

// 使用正則表達式提取數據的備用方法
function extractDataUsingRegex() {
  const pageText = document.body.innerText || document.body.textContent;

  // 根據您提供的 CSV 數據，我們可以看到數據行的格式
  // 尋找類似於 "EVEN-learnable-frame-PE-add-EventFrame_0.5\20250415_123549\vis_data 0.0398 0.494" 的模式
  const pattern = /(EVEN-[^\s]+\\[^\s]+\\[^\s]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)/g;
  const results = [];
  let match;

  while ((match = pattern.exec(pageText)) !== null) {
    const name = match[1];
    const minValue = parseFloat(match[2]);
    const maxValue = parseFloat(match[3]);

    if (!isNaN(minValue) && !isNaN(maxValue)) {
      results.push({ name, minValue, maxValue });
    }
  }

  if (results.length === 0) {
    alert("Could not extract any data using regex pattern");
    return null;
  }

  // 將結果複製到剪貼板
  const csvContent = "Name,Min,Max\n" +
    results.map(r => `"${r.name}",${r.minValue},${r.maxValue}`).join('\n');

  // copyToClipboard(csvContent);

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