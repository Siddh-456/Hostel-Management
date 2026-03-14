// Transfer Request Page
class TransferRequestPage extends Page {
  async render(container) {
    const user = Auth.getUser();
    let roomsHtml = '<p>Loading rooms...</p>';

    try {
      const rooms = await API.getRooms();
      const blocks = await API.getBlocks();

      roomsHtml = `
        <div class="form-group">
          <label for="to_room_id">Select Destination Room *</label>
          <select id="to_room_id" name="to_room_id" required>
            <option value="">Choose a room</option>
            ${rooms.filter(r => r.room_type === 'student').map(r => {
              const block = blocks.find(b => b.id === r.block_id);
              return `<option value="${r.id}">${r.name} (${r.capacity} capacity, ${block ? block.name : 'Unknown'})</option>`;
            }).join('')}
          </select>
        </div>
      `;
    } catch (error) {
      roomsHtml = `<p class="error">Error loading rooms: ${error.message}</p>`;
    }

    const html = `
      <div class="form-container">
        <h1>Request Room Transfer</h1>
        
        <form id="transfer-form" class="form">
          ${roomsHtml}
          
          <div class="form-group">
            <label for="reason">Reason for Transfer</label>
            <textarea id="reason" name="reason" placeholder="Explain why you need to transfer" rows="4"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">Submit Transfer Request</button>
        </form>
      </div>
    `;

    Layout.render(container, html);

    const form = container.querySelector('#transfer-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        await API.createTransferRequest({
          student_id: user.id,
          to_room_id: form.to_room_id.value,
          reason: form.reason.value || null,
          status: 'pending'
        });
        this.showSuccess('Transfer request submitted!');
        form.reset();
      } catch (error) {
        this.showError('Failed to submit transfer: ' + error.message);
      }
    });
  }
}

Router.registerPage('transfer-request', TransferRequestPage);
