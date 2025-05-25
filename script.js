// Global data object (initial)
const data = {
  profile: 'Jewel',
  countdown: '2025-07-31T00:00:00', // ISO format datetime
  syllabus: [],
  cycle: [],
  purchase: [],
  packing: [],
  registration: []
};

const profileButtons = document.querySelectorAll('.profile-btn');
const countdownElem = document.getElementById('countdown');
const syllabusList = document.getElementById('syllabus-list');
const cycleList = document.getElementById('cycle-list');
const purchaseList = document.getElementById('purchase-list');
const packingList = document.getElementById('packing-list');
const addSyllabusBtn = document.getElementById('add-syllabus-btn');
const addCycleBtn = document.getElementById('add-cycle-btn');
const addPurchaseBtn = document.getElementById('add-purchase-btn');
const addPackingBtn = document.getElementById('add-packing-btn');

let syllabusColors = {};
const colorPalette = [
  '#f94144', '#f3722c', '#f9844a', '#f9c74f',
  '#90be6d', '#43aa8b', '#577590', '#277da1'
];

//////////////////////////////
// PROFILE HANDLING

function setSelectedProfileButton(profile) {
  profileButtons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.profile === profile);
  });
}

function loadProfileData(profile) {
  fetch(`/api/data/${profile}`)
    .then(res => res.json())
    .then(profileData => {
      data.profile = profile;
      data.syllabus = profileData.syllabus || [];
      data.cycle = profileData.cycle || [];
      data.purchase = profileData.purchase || [];
      data.packing = profileData.packing || [];
      data.registration = profileData.registration || [];
      // If countdown saved in profileData, use it
      if (profileData.countdown) data.countdown = profileData.countdown;

      assignColorsForSyllabus();
      renderAll();
      setSelectedProfileButton(profile);
    })
    .catch(err => {
      console.error("Error loading profile data:", err);
      // fallback: clear lists
      data.syllabus = [];
      data.cycle = [];
      data.purchase = [];
      data.packing = [];
      data.registration = [];
      assignColorsForSyllabus();
      renderAll();
      setSelectedProfileButton(profile);
    });
}

function saveProfileData() {
  const saveData = {
    countdown: data.countdown,
    syllabus: data.syllabus,
    cycle: data.cycle,
    purchase: data.purchase,
    packing: data.packing,
    registration: data.registration,
  };
  fetch(`/api/data/${data.profile}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(saveData)
  })
  .then(res => res.json())
  .then(resp => {
    console.log('Data saved:', resp.message);
  })
  .catch(err => {
    console.error("Error saving profile data:", err);
  });
}

profileButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.profile === data.profile) return; // same profile
    saveProfileData();
    loadProfileData(btn.dataset.profile);
  });
});

//////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
  const countdownElement = document.getElementById('countdown');
  const targetDate = new Date('2025-07-31T00:00:00');

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      countdownElement.textContent = "Countdown: Time's up!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownElement.textContent = `Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
});



//////////////////////////////
// SYLLABUS COLORS

function assignColorsForSyllabus() {
  syllabusColors = {};
  const subjects = [...new Set(data.syllabus.map(item => item.subject))];
  subjects.forEach((subject, idx) => {
    syllabusColors[subject] = colorPalette[idx % colorPalette.length];
  });
}

//////////////////////////////
// RENDERING FUNCTIONS

function renderSyllabus() {
  syllabusList.innerHTML = '';
  data.syllabus.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${item.subject}: ${item.progress} / ${item.total} chapters`;
    li.style.background = syllabusColors[item.subject] || '#777';
    li.title = 'Click to update progress';

    li.addEventListener('click', () => {
      const newProgress = prompt(
        `Update progress for ${item.subject} (0 - ${item.total}):`,
        item.progress
      );
      if (newProgress === null) return;
      const val = parseInt(newProgress);
      if (!isNaN(val) && val >= 0 && val <= item.total) {
        data.syllabus[i].progress = val;
        assignColorsForSyllabus();
        renderSyllabus();
        saveProfileData();
      } else {
        alert('Invalid number');
      }
    });
    syllabusList.appendChild(li);
  });
  updateSyllabusProgressBar();
}

function renderCycle() {
  cycleList.innerHTML = '';
  data.cycle.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `Hours: ${item.hours}`;
    li.title = 'Click to update hours';
    li.style.background = '#43aa8b';

    li.addEventListener('click', () => {
      const newHours = prompt('Update hours:', item.hours);
      if (newHours === null) return;
      const val = parseFloat(newHours);
      if (!isNaN(val) && val >= 0) {
        data.cycle[i].hours = val;
        renderCycle();
        saveProfileData();
      } else {
        alert('Invalid number');
      }
    });
    cycleList.appendChild(li);
  });
  updateCycleProgressBar();
}

function renderPurchase() {
  purchaseList.innerHTML = '';
  data.purchase.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.style.textDecoration = item.done ? 'line-through' : 'none';
    li.style.opacity = item.done ? '0.6' : '1';
    li.title = 'Click to toggle done';
    li.addEventListener('click', () => {
      data.purchase[i].done = !data.purchase[i].done;
      renderPurchase();
      saveProfileData();
    });
    purchaseList.appendChild(li);
  });
  updatePurchaseProgressBar();
}

function renderPacking() {
  packingList.innerHTML = '';
  data.packing.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.style.textDecoration = item.done ? 'line-through' : 'none';
    li.style.opacity = item.done ? '0.6' : '1';
    li.title = 'Click to toggle done';
    li.addEventListener('click', () => {
      data.packing[i].done = !data.packing[i].done;
      renderPacking();
      saveProfileData();
    });
    packingList.appendChild(li);
  });
  updatePackingProgressBar();
}

function renderAll() {
  renderSyllabus();
  renderCycle();
  renderPurchase();
  renderPacking();
}

//////////////////////////////
// PROGRESS BARS

function sumSyllabusProgress() {
  let done = 0, total = 0;
  data.syllabus.forEach(item => {
    done += item.progress;
    total += item.total;
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function updateSyllabusProgressBar() {
  const bar = document.querySelector('.progress-bar[data-type="syllabus"]');
  bar.style.width = sumSyllabusProgress() + '%';
  bar.textContent = sumSyllabusProgress() + '%';
}

function sumCycleHours() {
  let sum = 0;
  data.cycle.forEach(item => sum += item.hours);
  return sum;
}

function updateCycleProgressBar() {
  // Assuming a goal of 100 hours for demo
  const goal = 100;
  const val = Math.min(100, Math.round((sumCycleHours()/goal)*100));
  const bar = document.querySelector('.progress-bar[data-type="cycle"]');
  bar.style.width = val + '%';
  bar.textContent = val + '%';
}

function sumPurchaseDone() {
  return data.purchase.filter(i => i.done).length;
}

function updatePurchaseProgressBar() {
  const total = data.purchase.length;
  const done = sumPurchaseDone();
  const val = total === 0 ? 0 : Math.round((done/total)*100);
  const bar = document.querySelector('.progress-bar[data-type="purchase"]');
  bar.style.width = val + '%';
  bar.textContent = val + '%';
}

function sumPackingDone() {
  return data.packing.filter(i => i.done).length;
}

function updatePackingProgressBar() {
  const total = data.packing.length;
  const done = sumPackingDone();
  const val = total === 0 ? 0 : Math.round((done/total)*100);
  const bar = document.querySelector('.progress-bar[data-type="packing"]');
  bar.style.width = val + '%';
  bar.textContent = val + '%';
}

//////////////////////////////
// ADD ITEM HANDLERS WITH CALENDAR INPUT

// SYLLABUS ADD (subject + total chapters + date)
addSyllabusBtn.addEventListener('click', () => {
  const subject = prompt('Enter subject name:');
  if (!subject) return alert('Subject name required');

  const totalStr = prompt('Enter total chapters for this subject:');
  const total = parseInt(totalStr);
  if (isNaN(total) || total <= 0) return alert('Invalid number of chapters');

  // Show date picker
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.style.position = 'fixed';
  dateInput.style.left = '-1000px'; // offscreen
  document.body.appendChild(dateInput);

  dateInput.onchange = () => {
    const date = dateInput.value; // YYYY-MM-DD
    document.body.removeChild(dateInput);
    if (!date) return alert('Date required');

    data.syllabus.push({
      subject,
      progress: 0,
      total,
      date
    });
    assignColorsForSyllabus();
    renderSyllabus();
    saveProfileData();
  };

  dateInput.click();
});

// CYCLE ADD (hours + date)
addCycleBtn.addEventListener('click', () => {
  const hoursStr = prompt('Enter hours for cycle:');
  const hours = parseFloat(hoursStr);
  if (isNaN(hours) || hours <= 0) return alert('Invalid hours');

  // Date picker
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.style.position = 'fixed';
  dateInput.style.left = '-1000px'; // offscreen
  document.body.appendChild(dateInput);

  dateInput.onchange = () => {
    const date = dateInput.value;
    document.body.removeChild(dateInput);
    if (!date) return alert('Date required');

    data.cycle.push({
      hours,
      date
    });
    renderCycle();
    saveProfileData();
  };

  dateInput.click();
});

// PURCHASE ADD (just name)
addPurchaseBtn.addEventListener('click', () => {
  const name = prompt('Enter purchase item name:');
  if (!name) return alert('Name required');
  data.purchase.push({
    name,
    done: false
  });
  renderPurchase();
  saveProfileData();
});

// PACKING ADD (just name)
addPackingBtn.addEventListener('click', () => {
  const name = prompt('Enter packing item name:');
  if (!name) return alert('Name required');
  data.packing.push({
    name,
    done: false
  });
  renderPacking();
  saveProfileData();
});

//////////////////////////////
// INITIAL LOAD

loadProfileData(data.profile);
