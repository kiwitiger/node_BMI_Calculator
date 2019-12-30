const firebaseConfig = {
  apiKey: "AIzaSyCNI1agF6QVk5aRppoZg8ZXSKC7hXeJvA0",
  authDomain: "myproject1104.firebaseapp.com",
  databaseURL: "https://myproject1104.firebaseio.com",
  projectId: "myproject1104",
  storageBucket: "myproject1104.appspot.com",
  messagingSenderId: "1054120536332",
  appId: "1:1054120536332:web:5c2370445602dbe8f0c129"
};
firebase.initializeApp(firebaseConfig);

const BMIHomework = firebase.database().ref('BMIHomework');

// 暫存計算結果
let tempResult = {};

// 判斷 BMI 的狀態
function getStatus(num) {
  switch (true) {
    case (num < 18.5):
      return 'underweight';
    case (num >= 18.5 && num < 25):
      return 'normal';
    case (num >= 25 && num < 30):
      return 'overweight';
    case (num >= 30 && num < 35):
      return 'obeseI';
    case (num >= 35 && num < 40):
      return 'obeseII';
    case (num >= 40):
      return 'obeseIII';
    default:
      return 'Error';
  }
}

// 比對 BMI 的狀態
function compareStatus(status) {
  const bimStatus = {
    underweight: {
      text: '過輕',
      color: '#31BAF9'
    },
    normal: {
      text: '理想',
      color: '#86D73E'
    },
    overweight: {
      text: '過重',
      color: '#FF982D'
    },
    obeseI: {
      text: '輕度肥胖',
      color: '#FF6C02'
    },
    obeseII: {
      text: '中度肥胖',
      color: '#FF6C02'
    },
    obeseIII: {
      text: '重度肥胖',
      color: '#FF1200'
    }
  }
  return bimStatus[status];
}

// 轉換日期格式
function convertDate(d) {
  const time = new Date(d * 1000);
  let date = time.getDate();
  let month = time.getMonth() + 1;
  const year = time.getFullYear();
  date < 10 ? date = '0' + date : date;
  month < 10 ? month = '0' + month : month;
  const recordTime = month + '-' + date + '-' + year;
  return recordTime;
}

// 「看結果」按鈕
$('.seeResult').on('click', (e) => {
  e.preventDefault();
  const height = parseFloat($('#height').val()) / 100;
  const weight = parseFloat($('#weight').val());
  const index = (Math.round((weight / (height * height)) * 100) / 100).toFixed(2);
  
  if (isNaN(height) || isNaN(weight)) {
    openModal('error');
  } else {
    tempResult = {
      height: parseFloat((height * 100).toFixed(1)),
      weight: parseFloat(weight.toFixed(1)),
      status: getStatus(index),
      index
    }
    const bimStatus = compareStatus(tempResult.status);
    $('.seeResult').css('display', 'none');
    $('.result').css({
      'display': 'flex',
      'color': bimStatus.color
    });
    $('.result div:first-child').css('border', `6px solid ${bimStatus.color}`);
    $('.result-index').text(index);
    $('.result-tryAgain').css('background-color', bimStatus.color);
    $('.result-status').text(bimStatus.text);
  }
})

// 再算一次
$('.result-tryAgain').on('click', function(e) {
  e.preventDefault();
  $('.result').css('display', 'none');
  $('.seeResult').css('display', 'block');
  $('#height').val('');
  $('#weight').val('');
  tempResult = {};
})

// 儲存計算結果
$('.result-save').on('click', function(e) {
  e.preventDefault();
  const recordTime = Math.floor(Date.now() / 1000);
  const BMIHomeworkRef = BMIHomework.push();
  const id = BMIHomeworkRef.key;
  tempResult.recordTime = recordTime;
  tempResult.id = id;
  BMIHomeworkRef.set(tempResult);
  updateList();
  tempResult = {};
})

// 更新 #list
function updateList() {
  BMIHomework.once('value', function (snapshot) {
    let str = '';
    const records = [];
    snapshot.forEach((item) => {
      records.push(item.val());
    });
    records.reverse();
    records.forEach((item) => {
      const date = convertDate(item.recordTime);
      const bmiStatus = compareStatus(item.status);
      str += `
      <li class="listItem" style="border-left: 6px solid ${bmiStatus.color}">
        <div>${bmiStatus.text}</div>
        <div><span>BMI</span>${item.index}</div>
        <div><span>weight</span>${item.weight}kg</div>
        <div><span>height</span>${item.height}cm</div>
        <div>${date}</div>
        <a href="#" class="listItem-deletebtn"><i class="far fa-trash-alt" data-id="${item.id}"></i></a>
      </li>
    `
    });
    $('#list').html(str);
  })
}

// listItem-deletebtn 刪除按鈕
$('#list').on('click', function(e) {
  if(e.target.nodeName !== 'I') {return};
  e.preventDefault();
  const id = e.target.dataset.id;
  openModal(id);
})

// 開啟 modal
function openModal(msg) {
  if (msg === 'error') {
    const text = {
      title: '錯誤訊息',
      body: '請輸入正確身高、體重。',
    }
    $('.modal-title').html(`<i class="fas fa-exclamation-triangle"></i> ${text.title}`);
    $('.modal-body').text(text.body);
    $('.modal-cancel').css('display', 'none');
    $('.modal').fadeIn(300);
  } else {
    BMIHomework.child(msg).once('value', (snapshot) => {
      const data = snapshot.val();
      const date = convertDate(data.recordTime);
      const bmiStatus = compareStatus(data.status);
      let str = '';
      str += `
      <ul style="border-left: 6px solid ${bmiStatus.color}">
        <li>${bmiStatus.text}</li>
        <li>BMI：${data.index}</li>
        <li>體重：${data.weight} kg</li>
        <li>身高：${data.height} cm</li>
        <li>日期：${date}</li>
      </ul>
      `
      $('.modal-body').html(str);
      $('.modal-title').html('<i class="fas fa-exclamation-triangle"></i> 是否確認刪除此筆資料？');
      $('.modal-cancel').css('display', 'inline-block');
      $('.modal-confirm').data('id', msg);
      $('.modal').fadeIn(300);
    })
  }
}

// 關閉 modal
function closeModal() {
  $('.modal-confirm').data('id', '');
  $('.modal').fadeOut(500);
}
$('.close').on('click', function() {
  closeModal();
})
$('.modal-cancel').on('click', function () {
  closeModal();
})

// 確認 modal
$('.modal-confirm').on('click', function() {
  const id = $(this).data('id');
  if (!id) {
    $('.modal').fadeOut(500);
  } else {
    BMIHomework.child(id).remove().then(updateList());
    closeModal();
  }
})

updateList();
