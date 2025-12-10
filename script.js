// script.js - handles register page functionality

// Utility: generate UBID
function generateUBID() {
  const now = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 9000 + 1000).toString(36);
  return UBID-${now.toUpperCase()}-${rand.toUpperCase()};
}

// Get stored array or empty
function getBeneficiaries(){
  const raw = localStorage.getItem('beneficiaries');
  return raw ? JSON.parse(raw) : [];
}

// Save beneficiary
function saveBeneficiary(obj){
  const arr = getBeneficiaries();
  arr.unshift(obj); // newest first
  localStorage.setItem('beneficiaries', JSON.stringify(arr));
}

// Display list in register.html
function renderSavedList(){
  const container = document.getElementById('savedList');
  if(!container) return;
  const arr = getBeneficiaries();
  if(arr.length === 0){
    container.innerHTML = '<p class="small">No registrations yet.</p>';
    return;
  }
  container.innerHTML = '';
  arr.forEach(item => {
    const div = document.createElement('div');
    div.className = 'saved-item';
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong> <span class="small">(${item.ubid})</span><br>
        <span class="saved-meta">${item.age} yrs • ${item.skillInterest} • ${item.address}</span>
      </div>
      <div style="text-align:right">
        <div class="small">${new Date(item.registeredAt).toLocaleString()}</div>
        <button class="btn secondary" onclick='viewDetail("${item.ubid}")'>View</button>
      </div>`;
    container.appendChild(div);
  });
}

// View detail by ubid - simple modal using alert for now
function viewDetail(ubid){
  const arr = getBeneficiaries();
  const found = arr.find(i => i.ubid === ubid);
  if(!found){ alert('Record not found'); return; }
  alert(
    Beneficiary Detail\n\nUBID: ${found.ubid}\nName: ${found.name}\nAge: ${found.age}\nEmail: ${found.email}\nPhone: ${found.phone}\nSkill: ${found.skillInterest}\nAddress: ${found.address}\nRegistered At: ${new Date(found.registeredAt).toLocaleString()}
  );
}

// Export to CSV
function exportCSV(){
  const arr = getBeneficiaries();
  if(arr.length === 0){ alert('No records to export'); return; }
  const header = ['UBID','Name','Age','Email','Phone','SkillInterest','Address','RegisteredAt'];
  const rows = arr.map(i => [
    i.ubid,i.name,i.age,i.email,i.phone,i.skillInterest, (i.address || '').replace(/[\r\n]+/g,' '),
    new Date(i.registeredAt).toISOString()
  ]);
  const csv = [header, ...rows].map(r => r.map(v=>"${String(v).replace(/"/g,'""')}").join(',')).join('\r\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'beneficiaries.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Clear all saved
function clearAll(){
  if(!confirm('Clear all saved beneficiary records?')) return;
  localStorage.removeItem('beneficiaries');
  renderSavedList();
  alert('All records cleared.');
}

// Register form submit handling (called on page load)
function initRegistrationForm(){
  const form = document.getElementById('regForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    // simple validation
    const name = form.name.value.trim();
    const age  = form.age.value.trim();
    const email= form.email.value.trim();
    const phone= form.phone.value.trim();
    const skill= form.skillInterest.value;
    const addr = form.address.value.trim();

    if(!name || !age || !email || !phone || !skill){
      alert('Please fill in required fields (Name, Age, Email, Phone, Skill).');
      return;
    }
    if(isNaN(Number(age)) || Number(age) < 14 || Number(age) > 100){
      alert('Please enter a valid age (14-100).');
      return;
    }
    // create record
    const obj = {
      ubid: generateUBID(),
      name, age, email, phone, skillInterest: skill, address: addr,
      registeredAt: Date.now()
    };
    saveBeneficiary(obj);
    renderSavedList();
    form.reset();
    alert(Registered successfully! UBID: ${obj.ubid});
  });
}

// Initialize functions when DOM ready
document.addEventListener('DOMContentLoaded', function(){
  renderSavedList();
  initRegistrationForm();
  // wire export & clear buttons if present
  const exp = document.getElementById('exportBtn'); if(exp) exp.addEventListener('click', exportCSV);
  const clr = document.getElementById('clearBtn');  if(clr) clr.addEventListener('click', clearAll);
});