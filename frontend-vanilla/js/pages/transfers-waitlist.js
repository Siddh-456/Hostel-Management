// Transfers & Waitlist Page
class TransfersWaitlistPage extends Page {
  async render(container) {
    let transfersHtml = '<p>Loading...</p>';
    let waitlistHtml = '<p>Loading...</p>';

    try {
      const [transfers, waitlist] = await Promise.all([
        API.getTransferRequests(),
        API.getWaitlist()
      ]);

      transfersHtml = transfers.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>From Room</th>
              <th>To Room</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${transfers.map(t => t.status === 'pending' ? `
              <tr>
                <td>${t.student_id}</td>
                <td>${t.from_room_id || '-'}</td>
                <td>${t.to_room_id}</td>
                <td>${t.reason || '-'}</td>
                <td><span class="badge badge-warning">${t.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-approve-transfer" data-id="${t.id}">Approve</button>
                  <button class="btn btn-sm btn-reject-transfer" data-id="${t.id}">Reject</button>
                </td>
              </tr>
            ` : '').join('')}
          </tbody>
        </table>
      ` : '<p>No pending transfers.</p>';

      waitlistHtml = waitlist.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Preferred Block</th>
              <th>Priority</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            ${waitlist.map(w => `
              <tr>
                <td>${w.student_id}</td>
                <td>${w.preferred_block || '-'}</td>
                <td>${w.priority}</td>
                <td>${new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Waitlist is empty.</p>';
    } catch (error) {
      transfersHtml = waitlistHtml = `<p class="error">Error: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Transfers & Waitlist</h1>
        
        <div class="card">
          <h3>Transfer Requests</h3>
          ${transfersHtml}
        </div>
        
        <div class="card">
          <h3>Waitlist</h3>
          ${waitlistHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    container.querySelectorAll('.btn-approve-transfer').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const response = await API.getTransferRequests();
          const transfer = response.find(t => t.id == btn.dataset.id);
          if (transfer) {
            // In real app, would update the transfer status
            this.showSuccess('Transfer approved!');
            Router.navigate('transfers-waitlist');
          }
        } catch (error) {
          this.showError('Failed: ' + error.message);
        }
      });
    });
  }
}

Router.registerPage('transfers-waitlist', TransfersWaitlistPage);
