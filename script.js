'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'de-DE',
};

const account2 = {
  owner: 'Nick Haras',
  movements: [5000, 3400, -150.01, -790, -3210.5, -1000, 8500, -30.23],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2021-02-10T14:43:26.374Z',
    '2021-03-04T18:49:59.371Z',
    '2021-03-08T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatDate = (now, time = true) => {
  let daysPassed = Math.round((new Date() - now) / (1000 * 60 * 60 * 24));
  if (daysPassed == 0 && !time) return 'Today';
  if (daysPassed == 1 && !time) return 'Yesterday';
  if (daysPassed <= 7 && !time) return `${daysPassed} days ago`;
  let options = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  };
  if (time) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }
  return Intl.DateTimeFormat(currentAccount.locale, options).format(now);
};

const formatNumber = ({ currency, locale }, num) => {
  let options = { style: 'currency', currency: currency };
  return new Intl.NumberFormat(locale, options).format(num);
};

(function () {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .split(' ')
      .map(n => n[0].toLowerCase())
      .join('');
  });
})();

const calcBalance = moves => moves.reduce((acc, val) => acc + val, 0);

const calcSumIn = moves =>
  moves.reduce((acc, val) => (val > 0 ? acc + val : acc), 0);

const calcSumOut = moves =>
  moves.reduce((acc, val) => (val < 0 ? acc + val : acc), 0);

const calcInterest = (moves, rate) =>
  moves.reduce(
    (acc, v) =>
      v > 0 ? ((v * rate) / 100 >= 1 ? acc + (v * rate) / 100 : acc) : acc,
    0
  );

const displayMovements = account => {
  containerMovements.innerHTML = '';
  let moves = sorted
    ? [...account.movements].sort((p, n) => +p - +n)
    : account.movements;
  let mDates = account.movementsDates;

  moves.forEach((m, i) => {
    let type = m < 0 ? 'withdrawal' : 'deposit';
    const html = `<div class="movements__row">
    <div class="">${i}</div>
      <div class="movements__type movements__type--${type}">${type}</div>
      <div class="movements__date">${formatDate(
        new Date(mDates[i]),
        false
      )}</div>
      <div class="movements__value">${formatNumber(account, m)}</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = account => {
  let { movements, interestRate } = account;
  labelBalance.textContent = `${formatNumber(account, calcBalance(movements))}`;
  labelSumIn.textContent = `${formatNumber(account, calcSumIn(movements))}`;
  labelSumOut.textContent = `${formatNumber(
    account,
    -1 * calcSumOut(movements)
  )}`;
  labelSumInterest.textContent = `${formatNumber(
    account,
    calcInterest(movements, interestRate)
  )}`;
};

const updateUI = currentAccount => {
  displayMovements(currentAccount);
  displayBalance(currentAccount);
  clearInterval(timer);
  timer = startLogoutTimer();
};

const findAccount = (owner, code) =>
  accounts.find(({ username, pin }) => owner === username && +code === pin);

const startLogoutTimer = () => {
  let time = 300;
  const tick = () => {
    let min = `${(time / 60) | 0}`.padStart(2, '0');
    let sec = `${time % 60}`.padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;
    if (!time) {
      clearInterval(timer);
      alert('You have been logged out!');
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  let timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;
let sorted = false;

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  let owner = inputLoginUsername.value;
  let pin = inputLoginPin.value;

  currentAccount = findAccount(owner, pin);
  if (currentAccount) {
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;
    labelDate.textContent = formatDate(new Date());
    updateUI(currentAccount);
  } else {
    alert('Wrong credentials. Please try again.');
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  let amount = Number(inputTransferAmount.value);
  let account = accounts.find(acc => acc.username === inputTransferTo.value);
  if (
    amount > 0 &&
    account &&
    account.username !== currentAccount.username &&
    amount <= calcBalance(currentAccount.movements)
  ) {
    account.movements.push(amount);
    account.movementsDates.push(new Date());
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date());
    inputTransferAmount.value = '';
    inputTransferTo.value = '';
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  let amount = +inputLoanAmount.value;
  if (amount > 0 && currentAccount.movements.some(d => d > 0.3 * amount)) {
    setTimeout(() => {
      alert('Congratulations your loan was approved!');
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date());
      inputLoanAmount.value = '';
      updateUI(currentAccount);
    }, 2500);
  } else {
    alert('Sorry your request was declined.');
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  let user = inputCloseUsername.value;
  let pin = +inputClosePin.value;
  if (currentAccount.username === user && currentAccount.pin === pin) {
    let account = accounts.findIndex(acc => acc.username === user);
    accounts.splice(account, 1);
    alert('Account deleted!');
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

btnSort.addEventListener('click', e => {
  e.preventDefault();
  sorted = !sorted;
  updateUI(currentAccount);
});

const allTransactions = arr =>
  arr.reduce((acc, v) => acc.concat(v.movements), []);

const allBalance = arr => arr.reduce((acc, v) => acc + v, 0);

const allMoves = arr =>
  arr.reduce((acc, v) => acc + v.movements.reduce((a, v) => a + v, 0), 0);

const depositsOver = amount =>
  accounts.flatMap(acc => acc.movements).filter(m => m >= amount);

const depositsOverR = (arr, amount) =>
  arr.reduce(
    (acc, v) => acc.concat(v.movements.filter(el => el >= amount)),
    []
  );

// const obj = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sum, val) => {
//       val > 0 ? (sum.d += val) : (sum.w += val);
//       return sum;
//     },
//     { d: 0, w: 0 }
//   );

//  the above improved

const obj = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sum, val) => {
      sum[val > 0 ? 'd' : 'w'] += val;
      return sum;
    },
    { d: 0, w: 0 }
  );

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// setInterval(() => {
//   let now = new Date();
//   let h = now.getHours();
//   let m = now.getMinutes();
//   let s = now.getSeconds();
//   console.clear();
//   console.log(`${h}:${m}:${s}`);
// }, 1000);
