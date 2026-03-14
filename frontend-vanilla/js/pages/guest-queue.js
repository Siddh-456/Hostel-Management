// Guest Queue Page
class GuestQueuePage extends Page {
  async render(container) {
    let requestsHtml = '<p>Loading...</p>';

    try {
      const [requests, rooms] = await Promise.all([
        API.getGuestRequests({ status: 'pending' }),
        API.getRooms()
      ]);

      requestsHtml = requests.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Host Student</th>
              <th>Check-in</th>
              <th>Nights</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr>
                <td>${r.guest_name}</td>
                <td>Student #${r.host_student_id}</td>
                <td>${new Date(r.check_in).toLocaleString()}</td>
                <td>${r.nights_calculated}</td>
                <td>₹${r.fee_per_night || 0}</td>
                <td>
                  <button class="btn btn-sm btn-approve" data-id="${r.id}">Approve</button>
                  <button class="btn btn-sm btn-reject" data-id="${r.id}">Reject</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No pending requests.</p>';
    } catch (error) {
      requestsHtml = `<p class="error">Error loading requests: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Guest Requests Queue</h1>
        
        <div class="card">
          ${requestsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    // Setup action handlers
    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', () => this.handleApprove(btn.dataset.id));
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => this.handleReject(btn.dataset.id));
    });
  }

  async handleApprove(id) {
    try {
      const rooms = await API.getRooms();
      const guestRooms = rooms.filter(r => r.room_type === 'guest' && r.active);

      const roomOptions = guestRooms.map(r => 
        `<option value="${r.id}">Room ${r.name} (Capacity: ${r.capacity})</option>`
      ).join('');

      this.createModal('Assign Guest Room', `
        <form id="assign-form">
          <div class="form-group">
            <label for="room">Select Guest Room *</label>
            <select id="room" name="room" required>
              <option value="">Choose room</option>
              ${roomOptions}
            </select>
          </div>
        </form>
      `, [
        {
          label: 'Approve',
          type: 'primary',
          action: 'confirm',
          onClick: async () => {
            const roomSelect = document.querySelector('#room');
            const roomId = roomSelect.value;

            if (!roomId) {
              this.showError('Please select a room');
              return;
            }

            try {
              await API.approveGuestRequest(id, { assigned_guest_room_id: roomId });
              this.showSuccess('Request approved!');
              Router.navigate('guest-queue');
            } catch (error) {
              this.showError('Approval failed: ' + error.message);
            }
          }
        },
        { label: 'Cancel', type: 'default', action: 'cancel' }
      ]);
    } catch (error) {
      this.showError('Error: ' + error.message);
    }
  }

  async handleReject(id) {
    this.createModal('Reject Request', `
      <form id="reject-form">
        <div class="form-group">
          <label for="reason">Reason</label>
          <textarea id="reason" name="reason" rows="3" placeholder="Enter rejection reason"></textarea>
        </div>
      </form>
    `, [
      {
        label: 'Reject',
        type: 'danger',
        action: 'confirm',
        onClick: async () => {
          const reason = document.querySelector('#reason').value;
          try {
            await API.rejectGuestRequest(id, reason);
            this.showSuccess('Request rejected!');
            Router.navigate('guest-queue');
          } catch (error) {
            this.showError('Rejection failed: ' + error.message);
          }
        }
      },
      { label: 'Cancel', type: 'default', action: 'cancel' }
    ]);
  }
}

Router.registerPage('guest-queue', GuestQueuePage);
