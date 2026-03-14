// Pay Fees Page
class PayFeesPage extends Page {
  async render(container) {
    const user = Auth.getUser();
    let feesHtml = '<p>Loading...</p>';

    try {
      const fees = await API.getFees(user.id);
      const payments = await API.getPayments(user.id);

      feesHtml = fees.length ? `
        <div class="fees-list">
          ${fees.map(f => `
            <div class="fee-card">
              <div class="fee-header">
                <h4>${f.fee_type}</h4>
                <span class="badge badge-${f.paid ? 'success' : 'danger'}">${f.paid ? 'PAID' : 'UNPAID'}</span>
              </div>
              <p>Amount: <strong>₹${f.amount}</strong></p>
              <p>Due Date: ${f.due_date || 'N/A'}</p>
              ${!f.paid ? `<button class="btn btn-primary btn-pay" data-fee-id="${f.id}">Pay Now</button>` : ''}
            </div>
          `).join('')}
        </div>
      ` : '<p>No fees found.</p>';
    } catch (error) {
      feesHtml = `<p class="error">Error loading fees: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Pay Fees</h1>
        
        <div class="card">
          <h3>Outstanding Fees</h3>
          ${feesHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    // Payment handling
    container.querySelectorAll('.btn-pay').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const feeId = btn.dataset.feeId;
        const fee = (await API.getFees(user.id)).find(f => f.id == feeId);

        if (!fee) return;

        this.createModal('Simulate Payment', `
          <p>Fee Type: <strong>${fee.fee_type}</strong></p>
          <p>Amount: <strong>₹${fee.amount}</strong></p>
          <p class="info-box">For demo purposes, payment is simulated.</p>
        `, [
          {
            label: 'Pay (Success)',
            type: 'primary',
            action: 'confirm',
            onClick: async () => {
              try {
                await API.createPayment({
                  student_id: user.id,
                  payment_for: fee.fee_type,
                  amount: fee.amount,
                  method: 'online'
                });
                this.showSuccess('Payment successful!');
                // Reload page
                Router.navigate('pay-fees');
              } catch (error) {
                this.showError('Payment failed: ' + error.message);
              }
            }
          },
          { label: 'Cancel', type: 'default', action: 'cancel' }
        ]);
      });
    });
  }
}

Router.registerPage('pay-fees', PayFeesPage);
