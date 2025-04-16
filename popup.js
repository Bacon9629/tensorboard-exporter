// 當 popup 加載完成時執行
document.addEventListener('DOMContentLoaded', () => {
  // 獲取按鈕元素
  const exportCSVButton = document.getElementById('exportCSV');
  const copyClipboardButton = document.getElementById('copyClipboard');
  const statusDiv = document.getElementById('status');
  const errorDiv = document.getElementById('error');

  // 為按鈕添加點擊事件
  exportCSVButton.addEventListener('click', () => {
    extractAndProcess('exportCSV');
  });

  copyClipboardButton.addEventListener('click', () => {
    extractAndProcess('copyClipboard');
  });

  // 提取數據並根據操作類型處理
  function extractAndProcess(action) {
    statusDiv.textContent = '';
    errorDiv.textContent = '';

    // 獲取當前活動標籤頁
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // 向 content script 發送消息，請求提取數據
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractData" }, (response) => {
        if (chrome.runtime.lastError) {
          errorDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
          return;
        }

        if (!response || !response.success) {
          errorDiv.textContent = response?.error || "Failed to extract data";
          return;
        }

        const data = response.data;

        if (action === 'exportCSV') {
          exportAsCSV(data);
        } else if (action === 'copyClipboard') {
          copyToClipboard(data);
        }
      });
    });
  }

  // 將數據導出為 CSV 文件
  function exportAsCSV(data) {
    // 創建 CSV 內容
    const csvContent = [
      "Experiment Name, Minimum Value,Maximum Value",
      ...data.map(item => `${item.name},${item.minValue},${item.maxValue}`)
    ].join('\n');

    // 創建 Blob 對象
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // 創建下載鏈接
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'tensorboard_experiments.csv';

    // 模擬點擊下載
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // 釋放 URL 對象
    URL.revokeObjectURL(url);

    statusDiv.textContent = "CSV file downloaded successfully!";
  }

  // 將數據複製到剪貼板
  function copyToClipboard(data) {
    // 創建格式化文本
    const textContent = data.map(item => `${item.name},${item.minValue},${item.maxValue}`).join('\n');

    // 複製到剪貼板
    navigator.clipboard.writeText(textContent)
      .then(() => {
        statusDiv.textContent = "Data copied to clipboard!";
      })
      .catch(err => {
        errorDiv.textContent = `Failed to copy: ${err}`;
      });
  }
});
