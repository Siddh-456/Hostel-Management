// Fees & Payments Page
class FeesPaymentsPage extends Page {
  async render(container) {
    let feesHtml = '<p>Loading...</p>';
    let paymentsHtml = '<p>Loading...</p>';

    try {
      const [fees, payments] = await Promise.all([
        API.getFees(),
        API.getPayments()
      ]);

      feesHtml = fees.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${fees.map(f => !f.paid ? `
              <tr>
                <td>${f.student_id}</td>
                <td>${f.fee_type}</td>
                <td>₹${f.amount}</td>
                <td>${f.due_date || '-'}</td>
                <td><span class="badge badge-danger">Unpaid</span></td>
                <td>
                  <button class="btn btn-sm btn-mark-paid" data-id="${f.id}">Mark Paid</button>
                </td>
              </tr>
            ` : '').join('')}
          </tbody>
        </table>
      ` : '<p>All fees are paid!</p>';

      paymentsHtml = payments.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Payment For</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td>${p.student_id}</td>
                <td>${p.payment_for}</td>
                <td>₹${p.amount}</td>
                <td>${p.method}</td>
                <td>${new Date(p.recorded_at).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No payments recorded.</p>';
    } catch (error) {
      feesHtml = paymentsHtml = `<p class="error">Error: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Fees & Payments</h1>
        
        <div class="card">
          <h3>Unpaid Fees</h3>
          ${feesHtml}
        </div>
        
        <div class="card">
          <h3>Payment Records</h3>
          ${paymentsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    container.querySelectorAll('.btn-mark-paid').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.markFeePaid(btn.dataset.id);
          this.showSuccess('Fee marked as paid!');
          Router.navigate('fees-payments');
        } catch (error) {
          this.showError('Failed: ' + error.message);
        }
      });
    });
  }
}

Router.registerPage('fees-payments', FeesPaymentsPage);
