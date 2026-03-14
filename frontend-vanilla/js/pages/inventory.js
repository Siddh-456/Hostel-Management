// Inventory Page
class InventoryPage extends Page {
  async render(container) {
    let inventoryHtml = '<p>Loading...</p>';

    try {
      const [inventory, rooms] = await Promise.all([
        API.getInventory(),
        API.getRooms()
      ]);

      inventoryHtml = inventory.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Room</th>
              <th>Quantity</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inventory.map(item => {
              const room = rooms.find(r => r.id === item.room_id);
              return `
                <tr>
                  <td>${item.item_name}</td>
                  <td>${room?.name || 'General'}</td>
                  <td>${item.quantity}</td>
                  <td>${new Date(item.created_at).toLocaleDateString()}</td>
                  <td><button class="btn btn-sm btn-delete" data-id="${item.id}">Delete</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p>No inventory items.</p>';
    } catch (error) {
      inventoryHtml = `<p class="error">Error: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Inventory Management</h1>
        
        <button class="btn btn-primary" id="add-item-btn">+ Add Item</button>
        
        <div class="card">
          ${inventoryHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    document.getElementById('add-item-btn')?.addEventListener('click', () => this.showAddItemForm());
  }

  async showAddItemForm() {
    const rooms = await API.getRooms();

    this.createModal('Add Inventory Item', `
      <form id="inventory-form">
        <div class="form-group">
          <label for="item_name">Item Name *</label>
          <input type="text" id="item_name" name="item_name" required>
        </div>
        <div class="form-group">
          <label for="room_id">Room</label>
          <select id="room_id" name="room_id">
            <option value="">General</option>
            ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input type="number" id="quantity" name="quantity" required min="1">
        </div>
      </form>
    `, [
      {
        label: 'Add',
        type: 'primary',
        action: 'add',
        onClick: async () => {
          const form = document.querySelector('#inventory-form');
          try {
            await API.createInventory({
              item_name: form.item_name.value,
              room_id: form.room_id.value || null,
              quantity: parseInt(form.quantity.value)
            });
            this.showSuccess('Item added!');
            Router.navigate('inventory');
          } catch (error) {
            this.showError('Failed: ' + error.message);
          }
        }
      },
      { label: 'Cancel', type: 'default', action: 'cancel' }
    ]);
  }
}

Router.registerPage('inventory', InventoryPage);
