// Rooms & Blocks Management Page
class RoomsManagementPage extends Page {
  async render(container) {
    let roomsHtml = '<p>Loading...</p>';
    let blocksHtml = '<p>Loading...</p>';

    try {
      const [rooms, blocks] = await Promise.all([API.getRooms(), API.getBlocks()]);

      roomsHtml = `
        <div class="crud-section">
          <button class="btn btn-primary" id="add-room-btn">+ Add Room</button>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Block</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rooms.map(r => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.room_type}</td>
                  <td>${r.capacity}</td>
                  <td>${r.block_id || '-'}</td>
                  <td>
                    <button class="btn btn-sm btn-edit" data-id="${r.id}">Edit</button>
                    <button class="btn btn-sm btn-delete" data-id="${r.id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      blocksHtml = `
        <div class="crud-section">
          <button class="btn btn-primary" id="add-block-btn">+ Add Block</button>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${blocks.map(b => `
                <tr>
                  <td>${b.name}</td>
                  <td>${b.location}</td>
                  <td>${b.remarks || '-'}</td>
                  <td>
                    <button class="btn btn-sm btn-edit" data-block-id="${b.id}">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      roomsHtml = blocksHtml = `<p class="error">Error loading: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Rooms & Blocks Management</h1>
        
        <div class="card">
          <h3>Hostel Blocks</h3>
          ${blocksHtml}
        </div>
        
        <div class="card">
          <h3>Rooms</h3>
          ${roomsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    document.getElementById('add-block-btn')?.addEventListener('click', () => this.showBlockForm());
    document.getElementById('add-room-btn')?.addEventListener('click', () => this.showRoomForm());
  }

  showBlockForm() {
    this.createModal('Add Block', `
      <form id="block-form">
        <div class="form-group">
          <label for="name">Block Name *</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="location">Location *</label>
          <input type="text" id="location" name="location" required>
        </div>
        <div class="form-group">
          <label for="remarks">Remarks</label>
          <textarea id="remarks" name="remarks" rows="3"></textarea>
        </div>
      </form>
    `, [
      {
        label: 'Create',
        type: 'primary',
        action: 'create',
        onClick: async () => {
          const form = document.querySelector('#block-form');
          try {
            await API.createBlock({
              name: form.name.value,
              location: form.location.value,
              remarks: form.remarks.value || null
            });
            this.showSuccess('Block created!');
            Router.navigate('rooms-management');
          } catch (error) {
            this.showError('Failed: ' + error.message);
          }
        }
      },
      { label: 'Cancel', type: 'default', action: 'cancel' }
    ]);
  }

  showRoomForm() {
    this.createModal('Add Room', `
      <form id="room-form">
        <div class="form-group">
          <label for="name">Room Name *</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="type">Room Type *</label>
          <select id="type" name="type" required>
            <option value="student">Student</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        <div class="form-group">
          <label for="capacity">Capacity *</label>
          <input type="number" id="capacity" name="capacity" required min="1">
        </div>
      </form>
    `, [
      {
        label: 'Create',
        type: 'primary',
        action: 'create',
        onClick: async () => {
          const form = document.querySelector('#room-form');
          try {
            await API.createRoom({
              name: form.name.value,
              room_type: form.type.value,
              capacity: parseInt(form.capacity.value),
              active: true
            });
            this.showSuccess('Room created!');
            Router.navigate('rooms-management');
          } catch (error) {
            this.showError('Failed: ' + error.message);
          }
        }
      },
      { label: 'Cancel', type: 'default', action: 'cancel' }
    ]);
  }
}

Router.registerPage('rooms-management', RoomsManagementPage);
