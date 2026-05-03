import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from './models/Task';
import { User } from './models/User';
import bcrypt from 'bcrypt';

dotenv.config();

const tasks = [
  // ========= BEGINNER =========
  {
    title: 'Клик по кнопке',
    description: 'Кликните на кнопку с id="myButton" и проверьте, что её текст изменился на "Нажато".',
    difficulty: 'BEGINNER',
    htmlContent: '<button id="myButton" onclick="this.textContent=\'Нажато\'">Нажми меня</button>',
    starterCode: `// ваш код
function userCode(window, document) {
  const btn = document.getElementById('myButton');
  // ваш код здесь
}`,
    testCode: `const btn = document.getElementById('myButton');
assert(btn, 'Кнопка не найдена');
userCode(window, document);
assert.equal(btn.textContent, 'Нажато', 'Текст кнопки не изменился');`,
  },
  {
    title: 'Заполнение поля ввода',
    description: 'Введите текст "Hello QA" в поле с id="inputField" и проверьте, что значение установилось.',
    difficulty: 'BEGINNER',
    htmlContent: '<input id="inputField" value="">',
    starterCode: `function userCode(window, document) {
  const input = document.getElementById('inputField');
}`,
    testCode: `const input = document.getElementById('inputField');
assert(input, 'Поле не найдено');
userCode(window, document);
assert.equal(input.value, 'Hello QA', 'Значение поля не установлено');`,
  },
  {
    title: 'Работа с чекбоксом',
    description: 'Отметьте чекбокс с id="agree" и убедитесь, что он стал checked.',
    difficulty: 'BEGINNER',
    htmlContent: '<input type="checkbox" id="agree">',
    starterCode: `function userCode(window, document) {
  const cb = document.getElementById('agree');
}`,
    testCode: `const cb = document.getElementById('agree');
assert(cb, 'Чекбокс не найден');
userCode(window, document);
assert.equal(cb.checked, true, 'Чекбокс не отмечен');`,
  },
  {
    title: 'Работа с текстовым содержимым',
    description: 'Проверьте, что заголовок h1 с id="title" содержит текст "Welcome".',
    difficulty: 'BEGINNER',
    htmlContent: '<h1 id="title">Welcome</h1>',
    starterCode: `function userCode(window, document) {
  // здесь можно просто проверять, код не требуется
}`,
    testCode: `const title = document.getElementById('title');
assert(title, 'Заголовок не найден');
assert.equal(title.textContent, 'Welcome', 'Текст заголовка не совпадает');`,
  },
  {
    title: 'Изменение значения dropdown',
    description: 'Выберите значение "Option 2" в выпадающем списке с id="dropdown" и проверьте, что оно выбрано.',
    difficulty: 'BEGINNER',
    htmlContent: '<select id="dropdown"><option value="1">Option 1</option><option value="2">Option 2</option></select>',
    starterCode: `function userCode(window, document) {
  const select = document.getElementById('dropdown');
}`,
    testCode: `const select = document.getElementById('dropdown');
assert(select, 'Элемент не найден');
userCode(window, document);
assert.equal(select.value, '2', 'Не выбрана Option 2');`,
  },
  // ========= INTERMEDIATE =========
  {
    title: 'Поиск элементов по классу',
    description: 'Подсчитайте количество элементов с классом "item" и убедитесь, что их ровно 3.',
    difficulty: 'INTERMEDIATE',
    htmlContent: '<ul><li class="item">1</li><li class="item">2</li><li class="item">3</li></ul>',
    starterCode: `function userCode(window, document) {
  // ваш код
}`,
    testCode: `const items = document.querySelectorAll('.item');
assert.equal(items.length, 3, 'Количество элементов с классом item не равно 3');`,
  },
  {
    title: 'Атрибуты элементов',
    description: 'Проверьте, что ссылка с id="myLink" имеет атрибут href="https://example.com".',
    difficulty: 'INTERMEDIATE',
    htmlContent: '<a id="myLink" href="https://example.com">Example</a>',
    starterCode: `function userCode(window, document) {
  // ваш код
}`,
    testCode: `const link = document.getElementById('myLink');
assert(link, 'Ссылка не найдена');
assert.equal(link.getAttribute('href'), 'https://example.com', 'Неверный href');`,
  },
  {
    title: 'Работа с динамическими стилями',
    description: 'Напишите код, который добавляет класс "highlight" элементу с id="box" и проверьте, что класс применился.',
    difficulty: 'INTERMEDIATE',
    htmlContent: '<div id="box" style="width:100px;height:100px;background:gray;"></div>',
    starterCode: `function userCode(window, document) {
  const box = document.getElementById('box');
}`,
    testCode: `const box = document.getElementById('box');
userCode(window, document);
assert.isTrue(box.classList.contains('highlight'), 'Класс highlight не добавлен');`,
  },
  {
    title: 'Работа с формой (несколько полей)',
    description: 'Заполните поля "username" и "password" значениями "admin" и "1234".',
    difficulty: 'INTERMEDIATE',
    htmlContent: '<input id="username"><input id="password" type="password">',
    starterCode: `function userCode(window, document) {
  // ваш код
}`,
    testCode: `const username = document.getElementById('username');
const password = document.getElementById('password');
userCode(window, document);
assert.equal(username.value, 'admin', 'Неверный username');
assert.equal(password.value, '1234', 'Неверный password');`,
  },
  {
    title: 'Ожидание появления элемента (MutationObserver)',
    description: 'После запуска вашего кода, динамически создаётся кнопка с id="lazyBtn". Напишите код, который ожидает её появления и нажимает на неё.',
    difficulty: 'INTERMEDIATE',
    htmlContent: '<div id="container"></div>',
    starterCode: `function userCode(window, document) {
  // здесь нужно подписаться на изменения DOM и кликнуть по кнопке, когда она появится
}`,
    // Для этой задачи нужен специальный тест: создаём кнопку с задержкой.
    // Упростим: тест сам создаст кнопку и проверит, что userCode её нажал.
    testCode: `const container = document.getElementById('container');
// Симулируем асинхронное появление через 100ms
setTimeout(() => {
  const btn = document.createElement('button');
  btn.id = 'lazyBtn';
  btn.textContent = 'Lazy';
  btn.onclick = function() { this.textContent = 'Нажато'; };
  container.appendChild(btn);
}, 100);
// Даём пользовательскому коду шанс отработать
setTimeout(() => {
  const btn = document.getElementById('lazyBtn');
  assert(btn, 'Кнопка не появилась');
  assert.equal(btn.textContent, 'Нажато', 'Кнопка не была нажата');
}, 500);`,
  },
  // ========= ADVANCED =========
  {
    title: 'Drag and Drop',
    description: 'Перетащите элемент с id="draggable" в зону с id="dropzone". Для этого нужно сгенерировать события mousedown, mousemove, mouseup.',
    difficulty: 'ADVANCED',
    htmlContent: '<div id="draggable" style="width:50px;height:50px;background:red;"></div><div id="dropzone" style="width:100px;height:100px;background:lightgray;"></div>',
    starterCode: `function userCode(window, document) {
  const draggable = document.getElementById('draggable');
  const dropzone = document.getElementById('dropzone');
  // реализуйте перетаскивание через события мыши
}`,
    testCode: `const draggable = document.getElementById('draggable');
const dropzone = document.getElementById('dropzone');
userCode(window, document);
// Проверяем, что draggable теперь внутри dropzone
const rectDrag = draggable.getBoundingClientRect();
const rectDrop = dropzone.getBoundingClientRect();
const isInside = rectDrag.left >= rectDrop.left && rectDrag.right <= rectDrop.right &&
                 rectDrag.top >= rectDrop.top && rectDrag.bottom <= rectDrop.bottom;
assert.isTrue(isInside, 'Элемент не перемещён в dropzone');`,
  },
  {
    title: 'Проверка модального окна',
    description: 'Откройте модальное окно (у элемента с id="modal" удалите класс "hidden") и закройте его, кликнув по кнопке "Close".',
    difficulty: 'ADVANCED',
    htmlContent: `<div id="modal" class="hidden"><button id="closeModal">Close</button></div>
<style>.hidden { display: none; }</style>`,
    starterCode: `function userCode(window, document) {
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('closeModal');
  // ваш код
}`,
    testCode: `const modal = document.getElementById('modal');
userCode(window, document);
assert.isFalse(modal.classList.contains('hidden'), 'Модальное окно не открыто');
// После закрытия
setTimeout(() => {
  assert.isTrue(modal.classList.contains('hidden'), 'Модальное окно не закрыто');
}, 100);`,
  },
  {
    title: 'Сложный селектор: nth-child',
    description: 'Проверьте, что текст третьего элемента списка равен "Item 3". Используйте селектор :nth-child.',
    difficulty: 'ADVANCED',
    htmlContent: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
    starterCode: `function userCode(window, document) {
  // ваш код (может просто проверять, код не обязателен)
}`,
    testCode: `const third = document.querySelector('li:nth-child(3)');
assert(third, 'Третий элемент не найден');
assert.equal(third.textContent, 'Item 3', 'Текст не совпадает');`,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', email: 'admin@qa.com', passwordHash: hash, role: 'admin' });
    console.log('Admin created (admin/admin123)');
  }
  await Task.deleteMany({});
  await Task.insertMany(tasks);
  console.log('Test tasks inserted');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });