let items = [];
let currencySymbol = '₹';
let exchangeRates = {
  USD: 0.012,
  EUR: 0.011,
  INR: 1
};

function addItem() {
  items.push({ name: '', qty: 1, rate: 0 });
  renderItems();
  calculateTotals();
}

function removeItem(index) {
  items.splice(index, 1);
  renderItems();
  calculateTotals();
}

function renderItems() {
  const tbody = document.getElementById('invoice-items');
  tbody.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input value="${item.name}" oninput="items[${i}].name=this.value" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td><input type="number" value="${item.qty}" min="1" oninput="items[${i}].qty=this.value; calculateTotals()" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td><input type="number" value="${item.rate}" oninput="items[${i}].rate=this.value; calculateTotals()" class="border w-full px-2 py-1 bg-gray-50 rounded-md"/></td>
      <td>${currencySymbol}${(item.qty * item.rate).toFixed(2)}</td>
      <td><button onclick="removeItem(${i})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}

function calculateTotals() {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const tax = 0; // customize later if needed
  const paid = parseFloat(document.getElementById('paid').value || 0);
  const total = subtotal + tax;
  const balance = total - paid;

  document.getElementById('subtotal').innerText = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('tax').innerText = `${currencySymbol}${tax.toFixed(2)}`;
  document.getElementById('total').innerText = `${currencySymbol}${total.toFixed(2)}`;
  document.getElementById('balance').innerText = `${currencySymbol}${balance.toFixed(2)}`;
}

function convertCurrency() {
  const selected = document.getElementById('currency').value;
  currencySymbol = selected === 'INR' ? '₹' : selected === 'USD' ? '$' : '€';
  const rate = exchangeRates[selected];
  items.forEach(i => i.rate = (i.rate * rate).toFixed(2));
  renderItems();
  calculateTotals();
}

function saveInvoice() {
  const invoice = {
    number: document.getElementById('invoiceNumber').value,
    billTo: document.getElementById('billTo').value,
    shipTo: document.getElementById('shipTo').value,
    date: document.getElementById('date').value,
    dueDate: document.getElementById('dueDate').value,
    terms: document.getElementById('terms').value,
    notes: document.getElementById('notes').value,
    termsText: document.getElementById('termsText').value,
    currency: document.getElementById('currency').value,
    paid: document.getElementById('paid').value,
    items
  };

  localStorage.setItem(invoice.number, JSON.stringify(invoice));
  
  let history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
  if (!history.includes(invoice.number)) {
    history.push(invoice.number);
    localStorage.setItem('invoice-history', JSON.stringify(history));
  }

  alert("Invoice saved!");
}

function loadInvoice() {
  const number = prompt("Enter Invoice Number to Load:");
  const invoice = JSON.parse(localStorage.getItem(number));
  if (!invoice) return alert("Invoice not found");

  document.getElementById('invoiceNumber').value = invoice.number;
  document.getElementById('billTo').value = invoice.billTo;
  document.getElementById('shipTo').value = invoice.shipTo;
  document.getElementById('date').value = invoice.date;
  document.getElementById('dueDate').value = invoice.dueDate;
  document.getElementById('terms').value = invoice.terms;
  document.getElementById('notes').value = invoice.notes;
  document.getElementById('termsText').value = invoice.termsText;
  document.getElementById('currency').value = invoice.currency;
  document.getElementById('paid').value = invoice.paid;
  items = invoice.items;
  convertCurrency();
  renderItems();
  calculateTotals();
}

function exportAllInvoices() {
  let history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
  const allData = history.map(id => JSON.parse(localStorage.getItem(id)));
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "all_invoices.json";
  a.click();
}

function showInvoiceHistory() {
  const modal = document.getElementById('invoice-history-modal');
  const list = document.getElementById('invoice-history-list');
  list.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('invoice-history') || '[]');

  history.forEach(id => {
    const data = JSON.parse(localStorage.getItem(id));
    const entry = document.createElement('div');
    entry.className = "p-4 border rounded-md bg-gray-50";
    entry.innerHTML = `
      <div class="font-semibold text-indigo-700">Invoice: ${data.number}</div>
      <div class="text-sm text-gray-700">Client: ${data.billTo} | Date: ${data.date} | Total: ${currencySymbol}${data.items.reduce((t, i) => t + i.qty * i.rate, 0).toFixed(2)}</div>
    `;
    list.appendChild(entry);
  });

  modal.classList.remove('hidden');
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Invoice", 10, 10);
  doc.text("Invoice Number: " + document.getElementById('invoiceNumber').value, 10, 20);
  doc.text("Bill To: " + document.getElementById('billTo').value, 10, 30);

  const itemRows = items.map(i => [i.name, i.qty, i.rate, i.qty * i.rate]);
  doc.autoTable({
    head: [["Item", "Qty", "Rate", "Amount"]],
    body: itemRows,
    startY: 40
  });

  doc.save("invoice.pdf");
}

function sendEmail() {
  alert("Email functionality requires backend server integration (e.g., Node.js with SMTP).");
}

// Function to enhance date inputs with better date picker styling
function enhanceDatePickers() {
  // Get the date input elements
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  // Apply custom styling to each date input
  dateInputs.forEach(input => {
    // Add event listener to improve user experience
    input.addEventListener('focus', function() {
      // Set default date if empty
      if (!this.value) {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        this.value = formattedDate;
      }
    });
  });
  
  // Set default dates
  const dateInput = document.getElementById('date');
  const dueDateInput = document.getElementById('dueDate');
  
  if (!dateInput.value) {
    const today = new Date();
    dateInput.value = today.toISOString().substr(0, 10);
  }
  
  if (!dueDateInput.value) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30); // Default to NET-30
    dueDateInput.value = dueDate.toISOString().substr(0, 10);
  }
}

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', function() {
  enhanceDatePickers();
});