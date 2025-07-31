// zywell-bridge.js
const ZywellPrinter = {
  isReady: false,
  usePlugin: false,
  init() {
    this.detectPrinter();
  },
  detectPrinter() {
    if (typeof ZywellService !== "undefined") {
      this.usePlugin = true;
      ZywellService.isPrinterConnected((res) => {
        this.isReady = res === true;
        this.updateStatus();
      }, (err) => {
        this.isReady = false;
        this.updateStatus();
      });
    } else {
      // fallback for external APK
      this.usePlugin = false;
      try {
        const intent = new Intent("com.zywell.print.ACTION_PRINT_TEST");
        this.isReady = true;
      } catch (e) {
        this.isReady = false;
      }
      this.updateStatus();
    }
  },
  updateStatus() {
    const el = document.getElementById("printer-status");
    if (el) {
      el.innerText = this.isReady ? "✅ Printer Connected" : "❌ Printer Not Connected";
    }
  },
  print(data) {
    if (!this.isReady) {
      alert("Printer not ready.");
      return;
    }
    if (this.usePlugin) {
      ZywellService.print(data, () => {}, () => {});
    } else {
      try {
        const intent = new Intent("com.zywell.print.ACTION_PRINT");
        intent.putExtra("rawData", data);
        startActivity(intent);
      } catch (e) {
        alert("Failed to send to external print app.");
      }
    }
  },
  testPrint() {
    this.updateStatus();
    alert(this.isReady ? "Printer is ready." : "Printer not connected.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  ZywellPrinter.init();
});
