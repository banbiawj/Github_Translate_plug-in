let dict = {};
let enabled = true;
let currentLang = "zh.json";

async function loadSettings() {
    return new Promise(resolve => {
        chrome.storage.sync.get(["enabled", "lang"], (res) => {
            enabled = res.enabled ?? true;
            currentLang = res.lang ?? "zh.json";
            resolve();
        });
    });
}

async function loadDict() {
    const url = chrome.runtime.getURL("Language/" + currentLang);
    const res = await fetch(url);
    dict = await res.json();
}

function addTranslation(el, text) {
    if (el.dataset.translated) return;          // 防止重复翻译
    el.dataset.translated = "true";

    // 获取 a 标签内的所有 span
    const spans = el.querySelectorAll('span');
    if (spans.length < 2) {
        console.warn('未找到第二个 span，无法添加翻译');
        return;
    }
    const targetSpan = spans[1];                // 第二个 span（索引 1）

    // 创建翻译 span
    const translationSpan = document.createElement('span');
    translationSpan.innerText = text;
    translationSpan.style.fontSize = '10px';
    translationSpan.style.color = '#888';
    // translationSpan.style.marginLeft = '4px';   // 与原文间距
    translationSpan.style.display = "block"; 
    translationSpan.style.textAlign = 'left';   // 强制左对齐
    translationSpan.style.margin = '0';         // 清除外边距
    translationSpan.style.padding = '0';        // 清除内边距

    // 将翻译添加到目标 span 内部
    targetSpan.appendChild(translationSpan);
}

function translate() {
    if (!enabled) return;

    const elements = document.querySelectorAll(".UnderlineNav-item, nav a");

    elements.forEach(el => {
        const text = el.innerText.trim();

        if (dict[text]) {
            addTranslation(el, dict[text]);
        }
    });
}

async function init() {
    await loadSettings();
    await loadDict();
    translate();

    const observer = new MutationObserver(() => {
        translate();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 👇 接收 popup 通知（关键）
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "update") {
        location.reload(); // 简单粗暴刷新页面
    }
});

init();