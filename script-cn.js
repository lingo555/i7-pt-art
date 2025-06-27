const targetInput = document.getElementById("target");
const currentInput = document.getElementById("current");
const event1Input = document.getElementById("event1");
const event2Input = document.getElementById("event2");
const event3Input = document.getElementById("event3");
const remaining = document.getElementById("remaining");
const alignCheckbox = document.getElementById("align");
const filterCheckboxes = document.querySelectorAll(".filter-area input");
const adjustInput = document.querySelectorAll(".adjust-area input");
const adjustInput1 = document.getElementById("adjust1");
const adjustInput2 = document.getElementById("adjust2");
const buttonArea = document.querySelector(".button-area");
const logList = document.getElementById("log");
const resetButton = document.getElementById("reset");
const cancelButton = document.getElementById("cancel");

// ボタンデータ
const buttoncsv = new XMLHttpRequest();
buttoncsv.open("GET", "button.csv", false);
buttoncsv.send();
const buttonData = csvToArray1(buttoncsv.responseText);

// 特効枚数と倍率の配列
const eventcsv = new XMLHttpRequest();
eventcsv.open("GET", "eventdata.csv", false);
eventcsv.send();
const eventData = csvToArray2(eventcsv.responseText);
// 復刻時の特効枚数と倍率の配列
const eventcsv2 = new XMLHttpRequest();
eventcsv2.open("GET", "eventdata2.csv", false);
eventcsv2.send();
const eventData2 = csvToArray2(eventcsv2.responseText);

// csvから連想配列に変換する関数
function csvToArray1(str) {
  // ヘッダー行の値配列を取得
  const headers = str.split("\n")[0].split(",");
  // 各行のテキスト配列を取得
  const rows = str.slice(str.indexOf("\n") + 1).split(/\n|\r\n|\r/);
  rows.pop();
  // 各行を配列に変換
  const arr = rows.map(function (row) {
    const values = row.split(",");
    const el = headers.reduce(function (obj, header, i) {
      const v = values[i];
      obj[header] = v;
      return obj;
    }, {});
    return el;
  });
  return arr;
}

// csvから配列に変換する関数
function csvToArray2(str) {
  // 各行のテキスト配列を取得
  const rows = str.split(/\n|\r\n|\r/);
  rows.pop();
  let arr3 = [];
  let k = 0;
  for (var i = 0; i < 6; i++) {
    arr3[i] = [];
    for (var j = 0; j < 6; j++) {
      arr3[i][j] = rows[k].split(",");
      k++;
    }
  }
  return arr3;
}

// ボタンを生成する関数
function createButtons(data) {
  buttonArea.innerHTML = "";
  data.forEach((item) => {
    const button = document.createElement("button");
    button.innerHTML = `${item.value} Pt<br><span>${item.star}、${item.level}<br>${item.typecn}、特效${item.eventup}</span>`;
    button.dataset.value = item.value;
    button.dataset.defvalue = item.defvalue;
    button.dataset.type = item.typecn;
    button.dataset.star = item.star;
    button.dataset.level = item.level;
    button.dataset.eventup = item.eventup;
    button.addEventListener("click", handleClick);
    buttonArea.appendChild(button);
  });
}

// ボタンクリック時の処理
function handleClick(event) {
  // クリックされたボタンの要素を取得
  const clickedButton = event.currentTarget;

  // ボタンの値と種類を取得
  const buttonValue = parseInt(clickedButton.dataset.value);
  const buttonType = clickedButton.dataset.type;
  const buttonStar = clickedButton.dataset.star;
  const buttonEvent = clickedButton.dataset.eventup;
  const buttonLevel = clickedButton.dataset.level;

  // 調整値を取得
  const adjustValue1 = document
    .querySelector('input[name="adjust1"]:checked')
    .nextElementSibling.textContent.split("张")[0];
  const adjustValue2 = document
    .querySelector('input[name="adjust2"]:checked')
    .nextElementSibling.textContent.split("张")[0];
  const adjustValue3 = document
    .querySelector('input[name="adjust3"]:checked')
    .nextElementSibling.textContent.split("+")[0];

  // 残り値を更新
  const remainingValue = parseInt(remaining.textContent);
  const newRemaining = remainingValue - buttonValue;
  remaining.textContent = `${newRemaining}`;

  // ボタンの表示/非表示を更新
  filterButtons();

  // ログを追加
  const newLogItem = document.createElement("li");
  newLogItem.innerHTML = `<span>${buttonValue} Pt</span>（${buttonStar}、${buttonLevel}、${buttonType}、特效${buttonEvent}、满特训${adjustValue1}张、SSR以上${adjustValue2}张、${adjustValue3}）`;
  logList.appendChild(newLogItem);
}

// 残り値を計算する関数
function calculateRemaining() {
  const target = parseInt(targetInput.value);
  const current = parseInt(currentInput.value);
  const remainingValue = target - current;
  remaining.textContent = `${remainingValue}`;
  filterButtons();
}

// フィルター処理を行う関数
function filterButtons() {
  const checkedTypes = Array.from(filterCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  checkedTypes.push("AUTO");
  const event1N = Math.min(5, parseInt(event1Input.value)); //特効枚数
  const event2N = Math.min(5, parseInt(event2Input.value)); //準特効枚数
  const eventlist = event3Input.checked ? eventData[event1N][event2N] : eventData2[event1N][event2N];

  const align = alignCheckbox.checked;
  const allButtons = document.querySelectorAll(".button-area button");
  const remainingValue = parseInt(remaining.textContent); //残り値取得
  allButtons.forEach((button) => {
    const buttonValue = parseInt(button.dataset.value);
    const isSelect =
      checkedTypes.includes(button.dataset.type) &&
      checkedTypes.includes(button.dataset.star); //フィルタに選択されているか
    const isAligned = remainingValue % 10 === buttonValue % 10; //下1桁が合っているか
    const isLE = buttonValue <= remainingValue; //残り値より小さいか
    const isEvent = eventlist.includes(button.dataset.eventup); //特効枚数から見て、倍率が達成可能か
    button.style.display =
      isSelect && isLE && isEvent && (!align || (align && isAligned))
        ? "inline-block"
        : "none";
  });
}

// 調整値を適用する関数
function adjustValues() {
  const adjustValue1 = parseInt(
    document.querySelector('input[name="adjust1"]:checked').value
  );
  const adjustValue2 = parseInt(
    document.querySelector('input[name="adjust2"]:checked').value
  );
  const adjustValue3 = parseInt(
    document.querySelector('input[name="adjust3"]:checked').value
  );
  const allButtons = document.querySelectorAll(".button-area button");
  allButtons.forEach((button) => {
    const defultValue = parseInt(button.dataset.defvalue);
    const newValue = defultValue + adjustValue1 + adjustValue2 + adjustValue3;
    button.dataset.value = newValue;
    button.innerHTML = `${newValue}Pt<br><span>${button.dataset.star}、${button.dataset.level}<br>${button.dataset.type}、特效${button.dataset.eventup}</span>`;
  });
  filterButtons(); // ボタンの表示/非表示を更新
}

// 取り消し処理
function oneCancel() {
  // ログの数を取得
  const lognum = logList.childElementCount;
  if (lognum == 0) {
    return false;
  }
  const lastLog = logList.lastElementChild;
  const lastValue = parseInt(lastLog.textContent.split("P")[0]);
  //console.log(lastValue);
  lastLog.remove();

  // 残り値を更新
  const remainingValue = parseInt(remaining.textContent);
  const newRemaining = remainingValue + lastValue;
  remaining.textContent = `${newRemaining}`;

  // ボタンの表示/非表示を更新
  filterButtons();
}

// プレイスタイル詳細ポップアップ
const detailMark = document.querySelectorAll(".foricon");
const detailBack = document.querySelector(".detail");
const detailContent = document.querySelectorAll(".detail-text");

// ポップアップ表示
function showDetail(event) {
  const clickedIcon = event.currentTarget;
  const eventIndex = Array.prototype.indexOf.call(detailMark, clickedIcon);
  
  detailBack.style.display = "flex";
  detailContent[eventIndex].style.display = "block";
}
//　ポップアップ消去
function closeDetail() {
  detailBack.style.display = "none";
  detailContent.forEach((content) => content.style.display = "none");
}

// 初期化処理
function init() {
  document.settings.reset();
  document.filter.reset();
  createButtons(buttonData);
  calculateRemaining();
  filterButtons();
  logList.innerHTML = "";
}

// イベントリスナーの設定
targetInput.addEventListener("input", calculateRemaining);
currentInput.addEventListener("input", calculateRemaining);
event1Input.addEventListener("input", filterButtons);
event2Input.addEventListener("input", filterButtons);
event3Input.addEventListener("change", filterButtons);
filterCheckboxes.forEach((checkbox) =>
  checkbox.addEventListener("change", filterButtons)
);
adjustInput.forEach((number) => number.addEventListener("input", adjustValues));
resetButton.addEventListener("click", init);
cancelButton.addEventListener("click", oneCancel);
detailMark.forEach((icon) => icon.addEventListener("click", showDetail));
detailBack.addEventListener("click", closeDetail);

init();
