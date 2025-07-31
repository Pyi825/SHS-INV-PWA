const SHARED_PASSWORD = "shs1825";
function checkPassword() {
  if (document.getElementById("passwordInput").value === SHARED_PASSWORD) {
    try { localStorage.setItem("shs_logged_in", "yes"); } catch (e) {}
    document.getElementById("login-section").style.display = "none";
    document.getElementById("form-section").style.display = "block";
  } else {
    document.getElementById("loginMessage").innerText = "❌ စကားဝှက်မှားနေသည်။";
  }
}

window.onload = () => {
  try {
    if (localStorage.getItem("shs_logged_in") === "yes") {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("form-section").style.display = "block";
    }
  } catch (e) {}
  document.getElementById("dateInput").value = new Date().toISOString().split('T')[0];
  generateInvoiceNumber();
};

const form = document.getElementById("invoiceForm");
const receipt = document.getElementById("receipt");
const amountInput = document.getElementById("amount");
const actualRMInput = document.getElementById("actualRM");
const submitBtn = document.getElementById("submitBtn");
let whatsappShared = false;

function addCommaFormat(input) {
  let value = input.value.replace(/,/g, '').replace(/[^\d]/g, '');
  input.value = value ? Number(value).toLocaleString('en-US') : '';
}

amountInput.addEventListener("input", () => addCommaFormat(amountInput));
actualRMInput.addEventListener("input", () => addCommaFormat(actualRMInput));

function renderReceipt(data) {
  receipt.innerHTML = `
    <div style="font-size:12px;text-align:center">
      <h3>ရွှေနှင်းဆီ စတိုးနှင့်စားသောက်ဆိုင်</h3>
      <h3>မလေး↔မြန်မာ ကုန်စည်ပို့ဆောင်ရေး</h3>
      <p>ဖုန်း: ၀၁၂၃၂၃၄၉၆၈</p>
      <p>ဘောင်ချာနံပါတ်: ${data.get("invoiceNumber")}</p>
      <p>ရက်စွဲ: ${data.get("date")}</p>
      <p>ဆိုင်ခွဲ: ${data.get("department")}</p>
      <p>ငွေလွဲသူ: ${data.get("operator")}</p>
      <p>ငွေပေးသွင်းမှု: ${data.get("paymentType")}</p>
      <p>ဘဏ်: ${data.get("paymentMethod")}</p>
      <p>အကောင့်အမည်: ${data.get("accountName") || '-'}</p>
      <p>ဖုန်းနံပါတ်: ${data.get("phoneNumber") || '-'}</p>
      <p>ငွေပမာဏ: ${amountInput.value}</p>
      <p>ကျသင့်ငွေ (ရင်းဂစ်): ${actualRMInput.value}</p>
      <p>*လက်ခံဖြတ်ပိုင်းအား ၁လအတွင်းသာတာဝန်ယူပါသည်</p>
    </div>`;
  receipt.style.display = "block";
}

function shareWhatsApp() {
  const data = new FormData(form);
  const message = `
ဘောင်ချာနံပါတ်: ${data.get("invoiceNumber")}
ဆိုင်ခွဲ: ${data.get("department")}
ငွေလွဲသူ: ${data.get("operator")}
ငွေပေးသွင်းမှု: ${data.get("paymentType")}
ဘဏ်: ${data.get("paymentMethod")}
အကောင့်အမည်: ${data.get("accountName") || '-'}
ဖုန်းနံပါတ်: ${data.get("phoneNumber") || '-'}
ငွေပမာဏ: ${amountInput.value}
ကျသင့်ငွေ (ရင်းဂစ်): ${actualRMInput.value}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  whatsappShared = true;
  submitBtn.disabled = false;
  document.getElementById("result").innerText = "✅ WhatsApp ဖြင့်မျှဝေပြီးပါပြီ။ Print & Submit ခလုပ်ကိုနှိပ်ပါ။";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const result = document.getElementById("result");
  result.innerText = "";
  if (!whatsappShared) {
    result.innerText = "❌ WhatsApp ဖြင့်မျှဝေရန်လိုအပ်သည်။";
    return;
  }
  const rawAmount = amountInput.value.replace(/,/g, '');
  const rawActualRM = actualRMInput.value.replace(/,/g, '');
  if (/[၀-၉]/.test(rawAmount) || /[၀-၉]/.test(rawActualRM)) {
    result.innerText = "❌ အင်္ဂလိပ်ဂဏန်းဖြင့်ရေးပါ။";
    return;
  }

  const formData = new FormData(form);
  formData.set("amount", rawAmount);
  formData.set("actualRM", rawActualRM);

  renderReceipt(formData);
  setTimeout(() => window.print(), 300);

  fetch("UR URL LINK HERE", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then((response) => {
    result.innerText = response.includes("အောင်မြင်") ? "✅ တင်သွင်းခြင်းအောင်မြင်ပါသည်။" : "⚠️ Server: " + response;
    form.reset();
    submitBtn.disabled = true;
    whatsappShared = false;
    generateInvoiceNumber();
    document.getElementById("dateInput").value = new Date().toISOString().split('T')[0];
  })
  .catch((err) => {
    result.innerText = "❌ တင်သွင်းမှုမအောင်မြင်ပါ။";
    console.error(err);
  });
});

function generateInvoiceNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = ("0" + (now.getMonth() + 1)).slice(-2);
  const d = ("0" + now.getDate()).slice(-2);
  const todayKey = `${y}${m}${d}`;
  let storedData = {};
  try { storedData = JSON.parse(localStorage.getItem("voucherData")) || {}; } catch (e) {}
  let serial = 1;
  if (storedData.date === todayKey) serial = storedData.serial + 1;
  try { localStorage.setItem("voucherData", JSON.stringify({ date: todayKey, serial })); } catch (e) {}
  const serialStr = ("000" + serial).slice(-3);
  document.getElementById("invoiceNumber").value = `${todayKey}-${serialStr}`;
}
