// print-history.js
(function () {
  const historyKey = "printHistory";
  const maxHistory = 100;
  const today = new Date().toISOString().split("T")[0];

  function loadHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(historyKey)) || [];
      return data.filter(h => h.date === today);
    } catch {
      return [];
    }
  }

  function saveHistory(entry) {
    try {
      let history = JSON.parse(localStorage.getItem(historyKey)) || [];
      history.unshift(entry);
      if (history.length > maxHistory) history = history.slice(0, maxHistory);
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  }

  function createHistoryUI() {
    const container = document.createElement("div");
    container.id = "print-history";
    container.innerHTML = "<h3>🕘 Print History (Today)</h3>";
    const list = document.createElement("ul");
    container.appendChild(list);
    document.getElementById("form-section").appendChild(container);

    const records = loadHistory();
    records.forEach((r, idx) => {
      const li = document.createElement("li");
      li.innerHTML = \`<strong>\${r.invoiceNumber}</strong> - \${r.operator} - \${r.amount} 
        <button data-idx="\${idx}">Reprint</button>\`;
      list.appendChild(li);
    });

    list.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        const idx = e.target.getAttribute("data-idx");
        const record = loadHistory()[idx];
        if (record) {
          ZywellPrinter.print(record.rawData);
        }
      }
    });
  }

  function interceptPrint() {
    const origPrintReceipt = window.printReceipt;
    window.printReceipt = function () {
      const form = document.getElementById("invoiceForm");
      const data = new FormData(form);
      const rawData = {};
      for (const [key, value] of data.entries()) rawData[key] = value;

      const entry = {
        date: today,
        invoiceNumber: rawData.invoiceNumber,
        operator: rawData.operator,
        amount: rawData.amount,
        rawData
      };
      saveHistory(entry);
      origPrintReceipt();
      setTimeout(() => {
        const el = document.getElementById("print-history");
        if (el) el.remove();
        createHistoryUI();
      }, 1000);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    interceptPrint();
    createHistoryUI();
  });
})();
