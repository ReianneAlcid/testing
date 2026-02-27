const teacherCreds = { email: 'teacher@example.com', password: 'examguard123' };
const storeKey = 'examguard_exam';
const monitorKey = 'examguard_monitor';

const state = {
  exam: JSON.parse(localStorage.getItem(storeKey) || 'null'),
  monitor: JSON.parse(localStorage.getItem(monitorKey) || '[]'),
  joinedStudent: null,
};

const el = {
  loginForm: document.getElementById('login-form'),
  authMsg: document.getElementById('auth-message'),
  teacherPanel: document.getElementById('teacher-panel'),
  examForm: document.getElementById('exam-form'),
  questionsList: document.getElementById('questions-list'),
  examLink: document.getElementById('exam-link'),
  publishExam: document.getElementById('publish-exam'),
  monitorLog: document.getElementById('monitor-log'),
  questionType: document.getElementById('question-type'),
  choicesWrapper: document.getElementById('choices-wrapper'),
  joinForm: document.getElementById('join-form'),
  joinMsg: document.getElementById('join-message'),
  examArea: document.getElementById('exam-area'),
  activeExamTitle: document.getElementById('active-exam-title'),
  studentExamForm: document.getElementById('student-exam-form'),
  submitStudentExam: document.getElementById('submit-student-exam'),
  submissionMsg: document.getElementById('submission-message'),
};

function persist() {
  localStorage.setItem(storeKey, JSON.stringify(state.exam));
  localStorage.setItem(monitorKey, JSON.stringify(state.monitor));
}

function renderQuestions() {
  const questions = state.exam?.questions || [];
  el.questionsList.innerHTML = questions
    .map((q, i) => `<li><strong>${i + 1}. [${q.type}]</strong> ${q.prompt}</li>`)
    .join('') || '<li>No questions yet.</li>';
}

function renderMonitor() {
  el.monitorLog.innerHTML = state.monitor.slice(-20).map((m) => `<li>${m}</li>`).join('') || '<li>No events yet.</li>';
}

function addMonitorEvent(message) {
  const stamp = new Date().toLocaleString();
  state.monitor.push(`${stamp} - ${message}`);
  persist();
  renderMonitor();
}

el.loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('teacher-email').value.trim();
  const password = document.getElementById('teacher-password').value;

  if (email === teacherCreds.email && password === teacherCreds.password) {
    el.authMsg.textContent = 'Teacher login successful.';
    el.authMsg.className = 'message ok';
    el.teacherPanel.classList.remove('hidden');
    renderQuestions();
    renderMonitor();
  } else {
    el.authMsg.textContent = 'Invalid teacher credentials.';
    el.authMsg.className = 'message warning';
  }
});

el.questionType.addEventListener('change', () => {
  const showChoices = el.questionType.value === 'multiple_choice';
  el.choicesWrapper.classList.toggle('hidden', !showChoices);
});

el.examForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('exam-title').value.trim();
  const type = document.getElementById('question-type').value;
  const prompt = document.getElementById('question-prompt').value.trim();
  const choices = document.getElementById('question-choices').value.trim();
  const answer = document.getElementById('question-answer').value.trim();

  if (!state.exam || state.exam.title !== title) {
    state.exam = { title, code: '', questions: [] };
  }

  state.exam.questions.push({
    type,
    prompt,
    choices: type === 'multiple_choice' ? choices.split(',').map((v) => v.trim()).filter(Boolean) : [],
    answer,
  });

  persist();
  renderQuestions();
  e.target.reset();
});

el.publishExam.addEventListener('click', () => {
  if (!state.exam?.questions?.length) {
    el.examLink.textContent = 'Add at least one question before publishing.';
    el.examLink.className = 'message warning';
    return;
  }

  state.exam.code = `EX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  persist();
  el.examLink.textContent = `Share this code/link: ${state.exam.code}`;
  el.examLink.className = 'message ok';
});

el.joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.getElementById('exam-code').value.trim().toUpperCase();
  const name = document.getElementById('student-name').value.trim();

  if (!state.exam || code !== state.exam.code) {
    el.joinMsg.textContent = 'Invalid exam code.';
    el.joinMsg.className = 'message warning';
    return;
  }

  state.joinedStudent = name;
  el.joinMsg.textContent = `Welcome ${name}. Anti-cheat monitoring is active.`;
  el.joinMsg.className = 'message ok';
  el.examArea.classList.remove('hidden');
  el.activeExamTitle.textContent = state.exam.title;
  renderStudentExam();
  addMonitorEvent(`Student ${name} started exam ${state.exam.code}.`);
});

function renderStudentExam() {
  const html = state.exam.questions.map((q, i) => {
    if (q.type === 'multiple_choice') {
      return `<fieldset><legend>${i + 1}. ${q.prompt}</legend>${q.choices.map((c) => `<label><input type="radio" name="q-${i}" value="${c}"> ${c}</label>`).join('')}</fieldset>`;
    }

    if (q.type === 'true_false') {
      return `<fieldset><legend>${i + 1}. ${q.prompt}</legend><label><input type="radio" name="q-${i}" value="True"> True</label><label><input type="radio" name="q-${i}" value="False"> False</label></fieldset>`;
    }

    return `<label>${i + 1}. ${q.prompt}<input name="q-${i}" placeholder="Your answer"></label>`;
  }).join('');

  el.studentExamForm.innerHTML = html;
}

el.submitStudentExam.addEventListener('click', () => {
  if (!state.joinedStudent) return;
  addMonitorEvent(`Student ${state.joinedStudent} submitted the exam.`);
  el.submissionMsg.textContent = 'Exam submitted. Teacher can review behavior logs.';
  el.submissionMsg.className = 'message ok';
});

// Anti-cheat detectors: tab/app switching, focus loss, mobile signals.
document.addEventListener('visibilitychange', () => {
  if (!state.joinedStudent) return;
  if (document.hidden) {
    addMonitorEvent(`ALERT: ${state.joinedStudent} switched to another tab/app.`);
  }
});

window.addEventListener('blur', () => {
  if (!state.joinedStudent) return;
  addMonitorEvent(`ALERT: ${state.joinedStudent} moved away from exam window.`);
});

window.addEventListener('focus', () => {
  if (!state.joinedStudent) return;
  addMonitorEvent(`${state.joinedStudent} returned to the exam window.`);
});

window.addEventListener('pagehide', () => {
  if (!state.joinedStudent) return;
  addMonitorEvent(`ALERT: ${state.joinedStudent} may have pressed Home/swiped out (iOS/phone behavior).`);
});

renderQuestions();
renderMonitor();
