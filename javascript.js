// CSV Analysis
let transactions = [];

document.getElementById('csvFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      transactions = results.data;
      document.getElementById('analyzeBtn').disabled = false;
    },
    error: function() {
      alert('Error parsing CSV. Please ensure it\'s a valid file.');
    }
  });
});

document.getElementById('analyzeBtn').addEventListener('click', () => {
  if (transactions.length === 0) return;

  // Basic Tax Calculations
  let totalBuy = 0, totalSell = 0, totalFees = 0;
  const exchanges = {};

  transactions.forEach(tx => {
    if (tx.Type === 'Buy') totalBuy += parseFloat(tx.Amount);
    if (tx.Type === 'Sell') totalSell += parseFloat(tx.Amount);
    totalFees += parseFloat(tx.Fee || 0);

    // Track most active exchange
    const exchange = tx.Exchange || 'Unknown';
    exchanges[exchange] = (exchanges[exchange] || 0) + 1;
  });

  const profitLoss = (totalSell - totalBuy).toFixed(2);
  const mostActive = Object.keys(exchanges).reduce((a, b) => exchanges[a] > exchanges[b] ? a : b, '');

  document.getElementById('profitLoss').textContent = `$${profitLoss}`;
  document.getElementById('totalFees').textContent = `$${totalFees.toFixed(2)}`;
  document.getElementById('mostActive').textContent = mostActive;
  document.getElementById('taxableEvents').textContent = transactions.length;

  // Generate Tax Report
  const reportHTML = `
    <h3>Transaction Summary</h3>
    <p>Total Buy: $${totalBuy.toFixed(2)}</p>
    <p>Total Sell: $${totalSell.toFixed(2)}</p>
    <p>Total Fees: $${totalFees.toFixed(2)}</p>
    <p>Profit/Loss: $${profitLoss}</p>
    <p>Most Active Exchange: ${mostActive}</p>
    <p>Total Transactions: ${transactions.length}</p>
  `;
  document.getElementById('taxReport').innerHTML = reportHTML;
  document.getElementById('downloadBtn').disabled = false;
});

// PDF Generation
document.getElementById('downloadBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  
  const report = document.getElementById('taxReport').innerText;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(report, 10, 10);
  doc.save('crypto_tax_report.pdf');
});

// Contact Form
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  try {
    const response = await fetch("https://formspree.io/f/xwkjzqzw ", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });
    
    if (response.ok) {
      form.reset();
      document.querySelector(".success-message").textContent = "Message sent successfully!";
    } else {
      throw new Error("Form submission failed");
    }
  } catch (err) {
    console.error(err);
    document.querySelector(".success-message").textContent = "Failed to send message.";
  }
});

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "🌙" : "☀️";
});