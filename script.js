const targetInput = document.getElementById('target');
const currentInput = document.getElementById('current');
const event1Input = document.getElementById('event1');
const event2Input = document.getElementById('event2');
const remaining = document.getElementById('remaining');
const alignCheckbox = document.getElementById('align');
const filterCheckboxes = document.querySelectorAll('.filter-area input');
const adjustInput = document.querySelectorAll('.adjust-area input');
const adjustInput1 = document.getElementById('adjust1');
const adjustInput2 = document.getElementById('adjust2');
const buttonArea = document.querySelector('.button-area');
const logList = document.getElementById('log');
const resetButton = document.getElementById('reset');

// ボタンデータ
const csv = new XMLHttpRequest();
csv.open("GET", "button.csv", true);
csv.send();
console.log(csv);
const buttonData = csvToArray(csv.responseText);

// 特効枚数と倍率の配列
const eventData = [
  [['30%','0%','0%','0%','0%'],
['30%','0%','0%','0%','0%'],
['30%','50%','60%','0%','0%'],
['30%','50%','60%','0%','0%'],
['30%','50%','60%','80%','0%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%']],
  [['30%','50%','60%','0%','0%'],
['30%','50%','60%','80%','0%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%']],
  [['30%','50%','60%','80%','100%'],
['30%','50%','60%','0%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%'],
['30%','50%','60%','80%','100%']]
];

// csvから連想配列に変換する関数
function csvToArray(str) {
  // ヘッダー行の値配列を取得
  console.log(str);
  const headers = str.split('\n')[0].split(',');
  console.log(headers);
  // 各行のテキスト配列を取得
  const rows = str.slice(str.indexOf('\n') + 1).split(/\n|\r\n|\r/);
  rows.pop();
  console.log(rows[1]);
  console.log(rows.slice(-1)[0]);
  // 各行を配列に変換
  const arr = rows.map(function (row) {
    const values = row.split(',');
    const el = headers.reduce(
      function (obj, header, i) {
        const v = values[i];
          obj[header] = v;
        return obj;
      }, {}
    );
    return el;
  });
  
  return arr;
} 

// ボタンを生成する関数
function createButtons(data) {
  buttonArea.innerHTML = '';
  data.forEach(item => {
    const button = document.createElement('button');
    button.innerHTML = `${item.value}Pt<br>${item.star}、${item.level}<br>${item.type}、特効${item.eventup}`;
    button.dataset.value = item.value;
    button.dataset.defvalue = item.defvalue;
    button.dataset.type = item.type;
    button.dataset.star = item.star;
    button.dataset.level = item.level;
    button.dataset.eventup = item.eventup;
    button.addEventListener('click', handleClick);
    buttonArea.appendChild(button);
  });
}

// ボタンクリック時の処理
function handleClick(event) {
  // クリックされたボタンの要素を取得
  const clickedButton = event.target;

  // ボタンの値と種類を取得
  const buttonValue = parseInt(clickedButton.dataset.value);
  const buttonType = clickedButton.dataset.type;
  const buttonStar = clickedButton.dataset.star;
  const buttonEvent = clickedButton.dataset.eventup;
  
  // 調整値を取得
  const adjustValue1 = document.querySelector('input[name="adjust1"]:checked').parentNode.textContent;
  const adjustValue2 = document.querySelector('input[name="adjust2"]:checked').parentNode.textContent;
  const adjustValue3 = document.querySelector('input[name="adjust3"]:checked').parentNode.textContent;

  // 残り値を更新
  const remainingValue = parseInt(remaining.textContent);
  const newRemaining = remainingValue - buttonValue;
  remaining.textContent = `${newRemaining}`;

  // ボタンの表示/非表示を更新
  filterButtons();
  
   // ログを追加
  const newLogItem = document.createElement('li');
  newLogItem.innerText = `${buttonValue}Pt（${buttonStar}、${buttonType}、特効${buttonEvent}、特訓MAX${adjustValue1}枚、SSR以上${adjustValue2}枚、レベル${adjustValue3}）`;
  logList.appendChild(newLogItem);
}

// 残り値を計算する関数
function calculateRemaining() {
  const target = parseInt(targetInput.value);
  const current = parseInt(currentInput.value);
  const remainingValue = target - current;
  remaining.textContent = `${remainingValue}`;
}

// フィルター処理を行う関数
function filterButtons() {
  const checkedTypes = Array.from(filterCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const event1N = Math.min(6,parseInt(event1Input.value));  //特効枚数
  const event2N = Math.min(6,parseInt(event2Input.value));  //準特効枚数
  const eventlist = eventData[event1N][event2N];
  
  const align = alignCheckbox.checked;
  const allButtons = document.querySelectorAll('.button-area button');
  const remainingValue = parseInt(remaining.textContent); //残り値取得
  allButtons.forEach(button => {
    const buttonValue = parseInt(button.dataset.value);
    const isSelect = checkedTypes.includes(button.dataset.type) && checkedTypes.includes(button.dataset.star); //フィルタに選択されているか
    const isAligned = remainingValue % 10 === buttonValue % 10;   //下1桁が合っているか
    const isLE = buttonValue <= remainingValue;  //残り値より小さいか
    const isEvent = eventlist.includes(button.dataset.eventup);  //特効枚数から見て、倍率が達成可能か
    button.style.display = isSelect && isLE && isEvent &&(!align ||(align && isAligned)) ? 'inline-block' : 'none';
  });
  
}

// 調整値を適用する関数
function adjustValues() {
  const adjustValue1 = parseInt(document.querySelector('input[name="adjust1"]:checked').value);
  const adjustValue2 = parseInt(document.querySelector('input[name="adjust2"]:checked').value);
  const adjustValue3 = parseInt(document.querySelector('input[name="adjust3"]:checked').value);
  const allButtons = document.querySelectorAll('.button-area button');
  allButtons.forEach(button => {
    const defultValue = parseInt(button.dataset.defvalue);
    const newValue = defultValue + adjustValue1 + adjustValue2 + adjustValue3;
    button.dataset.value = newValue;
    button.innerHTML = `${newValue}Pt<br>${button.dataset.star}、${button.dataset.level}<br>${button.dataset.type}、特効${button.dataset.eventup}`;
  });
  filterButtons(); // ボタンの表示/非表示を更新
}

// 初期化処理
function init() {
  createButtons(buttonData);
  calculateRemaining();
  logList.innerHTML = '';
}

// イベントリスナーの設定
targetInput.addEventListener('input', calculateRemaining);
currentInput.addEventListener('input', calculateRemaining);
event1Input.addEventListener('input', filterButtons);
event2Input.addEventListener('input', filterButtons);
filterCheckboxes.forEach(checkbox => checkbox.addEventListener('change', filterButtons));
adjustInput.forEach(number => number.addEventListener('input', adjustValues));
resetButton.addEventListener('click', init);

init();
