const toggle = document.getElementById("toggle");
const languageSelect = document.getElementById("language");
const saveBtn = document.getElementById("save");

// 👇 这里定义语言文件（浏览器插件无法直接读取文件夹列表）
const languages = [
    { name: "中文", file: "zh.json" },
    { name: "English", file: "en.json" }
];

// 初始化语言列表
function initLanguages() {
    languages.forEach(lang => {
        const option = document.createElement("option");
        option.value = lang.file;
        option.textContent = lang.name;
        languageSelect.appendChild(option);
    });
}

// 加载配置
function loadSettings() {
    chrome.storage.sync.get(["enabled", "lang"], (res) => {
        toggle.checked = res.enabled ?? true;
        languageSelect.value = res.lang ?? "zh.json";
    });
}

// 保存配置
saveBtn.addEventListener("click", () => {
    const enabled = toggle.checked;
    const lang = languageSelect.value;

    chrome.storage.sync.set({ enabled, lang }, () => {
        alert("保存成功");

        // 通知 content.js 重新执行
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "update"
            });
        });
    });
});

// 初始化
initLanguages();
loadSettings();