// Check-in/Check-out Kiosk Page
class KioskPage extends Page {
  async render(container) {
    let requestsHtml = '<p>Loading...</p>';

    try {
      const allRequests = await API.getGuestRequests({});
      const approvedRequests = allRequests.filter(r => r.status === 'approved');

      requestsHtml = approvedRequests.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${approvedRequests.map(r => `
              <tr>
                <td>${r.guest_name}</td>
                <td>${r.assigned_guest_room_id}</td>
                <td>${new Date(r.check_in).toLocaleString()}</td>
                <td>${new Date(r.check_out).toLocaleString()}</td>
                <td><span class="badge badge-${r.status === 'completed' ? 'success' : 'warning'}">${r.status}</span></td>
                <td>
                  ${r.status !== 'completed' ? `
                    <button class="btn btn-sm btn-checkin" data-id="${r.id}">Check-in</button>
                    <button class="btn btn-sm btn-checkout" data-id="${r.id}">Check-out</button>
                  ` : '-'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No approved requests.</p>';
    } catch (error) {
      requestsHtml = `<p class="error">Error loading requests: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Guest Check-in/Check-out Kiosk</h1>
        
        <div class="card">
          ${requestsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    container.querySelectorAll('.btn-checkin').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.checkInGuest(btn.dataset.id);
          this.showSuccess('Guest checked in!');
          Router.navigate('kiosk');
        } catch (error) {
          this.showError('Check-in failed: ' + error.message);
        }
      });
    });

    container.querySelectorAll('.btn-checkout').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.checkOutGuest(btn.dataset.id);
          this.showSuccess('Guest checked out!');
          Router.navigate('kiosk');
        } catch (error) {
          this.showError('Check-out failed: ' + error.message);
        }
      });
    });
  }
}

Router.registerPage('kiosk', KioskPage);
