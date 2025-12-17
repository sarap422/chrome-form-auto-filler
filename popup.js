/**
 * Form Auto Filler - Popup Script
 * 入力セットの管理とフォーム入力の実行
 */

// DOM要素
const elements = {
  presetSelect: document.getElementById('preset-select'),
  btnFill: document.getElementById('btn-fill'),
  btnNew: document.getElementById('btn-new'),
  btnEdit: document.getElementById('btn-edit'),
  btnDelete: document.getElementById('btn-delete'),
  btnExport: document.getElementById('btn-export'),
  btnImport: document.getElementById('btn-import'),
  importFile: document.getElementById('import-file'),
  mainView: document.getElementById('main-view'),
  editView: document.getElementById('edit-view'),
  presetName: document.getElementById('preset-name'),
  presetData: document.getElementById('preset-data'),
  btnSave: document.getElementById('btn-save'),
  btnCancel: document.getElementById('btn-cancel')
};

// 現在の編集モード（'new' または 編集中のプリセットID）
let editMode = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 初期化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.addEventListener('DOMContentLoaded', async () => {
  await loadPresets();
  setupEventListeners();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// プリセット読み込み
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadPresets() {
  const result = await chrome.storage.local.get(['presets']);
  const presets = result.presets || {};
  
  // セレクトボックスを更新（空オプションなし）
  elements.presetSelect.innerHTML = '';
  
  const presetEntries = Object.entries(presets);
  
  // プリセットがない場合のみプレースホルダーを表示
  if (presetEntries.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- プリセットなし --';
    elements.presetSelect.appendChild(option);
  } else {
    // プリセットを追加
    presetEntries.forEach(([id, preset]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = preset.name;
      elements.presetSelect.appendChild(option);
    });
    
    // 最初のオプションを選択
    elements.presetSelect.selectedIndex = 0;
  }
  
  updateButtonStates();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ボタン状態の更新
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function updateButtonStates() {
  const hasSelection = elements.presetSelect.value !== '';
  elements.btnFill.disabled = !hasSelection;
  elements.btnEdit.disabled = !hasSelection;
  elements.btnDelete.disabled = !hasSelection;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// イベントリスナー設定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function setupEventListeners() {
  // プリセット選択変更
  elements.presetSelect.addEventListener('change', updateButtonStates);
  
  // 入力実行
  elements.btnFill.addEventListener('click', executeFormFill);
  
  // 新規作成
  elements.btnNew.addEventListener('click', () => {
    editMode = 'new';
    elements.presetName.value = '';
    elements.presetData.value = '';
    showEditView();
  });
  
  // 編集
  elements.btnEdit.addEventListener('click', async () => {
    const presetId = elements.presetSelect.value;
    if (!presetId) return;
    
    const result = await chrome.storage.local.get(['presets']);
    const presets = result.presets || {};
    const preset = presets[presetId];
    
    if (preset) {
      editMode = presetId;
      elements.presetName.value = preset.name;
      elements.presetData.value = preset.data;
      showEditView();
    }
  });
  
  // 削除
  elements.btnDelete.addEventListener('click', async () => {
    const presetId = elements.presetSelect.value;
    if (!presetId) return;
    
    if (confirm('このプリセットを削除しますか？')) {
      const result = await chrome.storage.local.get(['presets']);
      const presets = result.presets || {};
      delete presets[presetId];
      await chrome.storage.local.set({ presets });
      await loadPresets();
    }
  });
  
  // 保存
  elements.btnSave.addEventListener('click', savePreset);
  
  // キャンセル
  elements.btnCancel.addEventListener('click', () => {
    editMode = null;
    showMainView();
  });
  
  // エクスポート
  elements.btnExport.addEventListener('click', exportPresets);
  
  // インポート
  elements.btnImport.addEventListener('click', () => {
    elements.importFile.click();
  });
  
  elements.importFile.addEventListener('change', importPresets);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 画面切り替え
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showEditView() {
  elements.mainView.style.display = 'none';
  elements.editView.style.display = 'block';
}

function showMainView() {
  elements.editView.style.display = 'none';
  elements.mainView.style.display = 'block';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// プリセット保存
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function savePreset() {
  const name = elements.presetName.value.trim();
  const data = elements.presetData.value.trim();
  
  if (!name) {
    alert('セット名を入力してください');
    return;
  }
  
  if (!data) {
    alert('入力データを入力してください');
    return;
  }
  
  const result = await chrome.storage.local.get(['presets']);
  const presets = result.presets || {};
  
  // IDを生成（新規の場合）または既存IDを使用
  const presetId = editMode === 'new' ? `preset_${Date.now()}` : editMode;
  
  presets[presetId] = {
    name: name,
    data: data,
    updatedAt: new Date().toISOString()
  };
  
  await chrome.storage.local.set({ presets });
  
  editMode = null;
  await loadPresets();
  
  // 保存したプリセットを選択状態に
  elements.presetSelect.value = presetId;
  updateButtonStates();
  
  showMainView();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// フォーム入力実行
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function executeFormFill() {
  const presetId = elements.presetSelect.value;
  if (!presetId) return;
  
  const result = await chrome.storage.local.get(['presets']);
  const presets = result.presets || {};
  const preset = presets[presetId];
  
  if (!preset) {
    alert('プリセットが見つかりません');
    return;
  }
  
  // データをパース
  const formData = parsePresetData(preset.data);
  
  // アクティブタブでコンテンツスクリプトを実行
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillFormFields,
      args: [formData]
    });
    
    // 成功したらポップアップを閉じる
    window.close();
  } catch (error) {
    console.error('Form fill error:', error);
    alert('フォーム入力に失敗しました: ' + error.message);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// プリセットデータのパース
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function parsePresetData(dataString) {
  const lines = dataString.split('\n');
  const result = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    // 最初の = で分割（値に = が含まれる場合を考慮）
    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) continue;
    
    const name = trimmedLine.substring(0, separatorIndex).trim();
    const value = trimmedLine.substring(separatorIndex + 1).trim();
    
    if (!name) continue;
    
    result.push({ name, value });
  }
  
  return result;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// フォーム入力関数（コンテンツスクリプトとして実行される）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function fillFormFields(formData) {
  let filledCount = 0;
  let skippedCount = 0;
  
  for (const { name, value } of formData) {
    // name属性で要素を検索
    const elements = document.querySelectorAll(`[name="${name}"]`);
    
    if (elements.length === 0) {
      skippedCount++;
      continue;
    }
    
    const element = elements[0];
    const tagName = element.tagName.toLowerCase();
    const inputType = element.type ? element.type.toLowerCase() : '';
    
    // radio の処理
    if (inputType === 'radio') {
      if (value.startsWith('radio:')) {
        const index = parseInt(value.replace('radio:', ''), 10);
        if (!isNaN(index) && elements[index]) {
          elements[index].checked = true;
          elements[index].dispatchEvent(new Event('change', { bubbles: true }));
          filledCount++;
        }
      } else {
        // 値で検索
        for (const el of elements) {
          if (el.value === value) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            break;
          }
        }
      }
      continue;
    }
    
    // checkbox の処理
    if (inputType === 'checkbox') {
      if (value.startsWith('checkbox:')) {
        // 複数選択: checkbox:0,2,3
        const indices = value.replace('checkbox:', '').split(',').map(s => parseInt(s.trim(), 10));
        
        // まず全てのチェックを外す
        for (const el of elements) {
          el.checked = false;
        }
        
        // 指定されたインデックスをチェック
        for (const index of indices) {
          if (!isNaN(index) && elements[index]) {
            elements[index].checked = true;
            elements[index].dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        filledCount++;
      } else {
        // 単体チェックボックス: 1 または true でチェック
        const shouldCheck = value === '1' || value.toLowerCase() === 'true';
        element.checked = shouldCheck;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
      continue;
    }
    
    // select の処理
    if (tagName === 'select') {
      // まず値で検索
      let found = false;
      for (const option of element.options) {
        if (option.value === value || option.textContent.trim() === value) {
          element.value = option.value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
          found = true;
          filledCount++;
          break;
        }
      }
      
      // select:index 形式の場合
      if (!found && value.startsWith('select:')) {
        const index = parseInt(value.replace('select:', ''), 10);
        if (!isNaN(index) && element.options[index]) {
          element.selectedIndex = index;
          element.dispatchEvent(new Event('change', { bubbles: true }));
          filledCount++;
        }
      }
      continue;
    }
    
    // textarea / text input の処理
    if (tagName === 'textarea' || tagName === 'input') {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
      continue;
    }
  }
  
  console.log(`Form Auto Filler: ${filledCount} fields filled, ${skippedCount} skipped`);
  return { filledCount, skippedCount };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// エクスポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function exportPresets() {
  const result = await chrome.storage.local.get(['presets']);
  const presets = result.presets || {};
  
  if (Object.keys(presets).length === 0) {
    alert('エクスポートするプリセットがありません');
    return;
  }
  
  const dataStr = JSON.stringify(presets, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `form-auto-filler-presets-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// インポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function importPresets(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importedPresets = JSON.parse(text);
    
    // バリデーション
    if (typeof importedPresets !== 'object') {
      throw new Error('Invalid format');
    }
    
    // 既存のプリセットとマージするか確認
    const result = await chrome.storage.local.get(['presets']);
    const existingPresets = result.presets || {};
    const existingCount = Object.keys(existingPresets).length;
    
    let mergedPresets;
    if (existingCount > 0) {
      const shouldMerge = confirm(`既存の ${existingCount} 件のプリセットに追加しますか？\n「キャンセル」で上書き（既存データは削除されます）`);
      
      if (shouldMerge) {
        mergedPresets = { ...existingPresets, ...importedPresets };
      } else {
        mergedPresets = importedPresets;
      }
    } else {
      mergedPresets = importedPresets;
    }
    
    await chrome.storage.local.set({ presets: mergedPresets });
    await loadPresets();
    
    alert(`${Object.keys(importedPresets).length} 件のプリセットをインポートしました`);
  } catch (error) {
    alert('インポートに失敗しました: ' + error.message);
  }
  
  // input をリセット
  event.target.value = '';
}
