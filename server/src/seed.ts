import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from './models/Task';
import { User } from './models/User';
import bcrypt from 'bcrypt';

dotenv.config();

const tasks = [
  {
    title: 'Клик по кнопке',
    description: 'Напишите код, который кликает на кнопку с id="myButton" и проверяет, что текст кнопки изменился на "Нажато".',
    difficulty: 'BEGINNER',
    htmlContent: '<button id="myButton" onclick="this.textContent=\'Нажато\'">Нажми меня</button>',
    starterCode: `// ваш код
function userCode(window, document) {
  const btn = document.getElementById('myButton');
  // ваш код здесь
}`,
    testCode: `const btn = document.getElementById('myButton');
assert(btn, 'Кнопка не найдена');
userCode(window, document); // вызов пользовательской функции
assert.equal(btn.textContent, 'Нажато', 'Текст кнопки не изменился');`,
  },
  {
    title: 'Заполнение поля ввода',
    description: 'Введите текст "Hello QA" в поле с id="inputField" и проверьте, что значение изменилось.',
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
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  // Создадим админа, если нет
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