// My Allocations Page
class MyAllocationsPage extends Page {
  async render(container) {
    const user = Auth.getUser();
    let allocationsHtml = '<p>Loading...</p>';

    try {
      const allocations = await API.getAllocations(user.id);
      const rooms = await API.getRooms();

      allocationsHtml = allocations.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Block</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allocations.map(a => {
              const room = rooms.find(r => r.id === a.room_id);
              return `
                <tr>
                  <td>${room?.name || 'Unknown'}</td>
                  <td>${room?.block_id || '-'}</td>
                  <td>${a.check_in_date}</td>
                  <td>${a.check_out_date || 'Active'}</td>
                  <td><span class="badge badge-${a.active ? 'success' : 'secondary'}">${a.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p>No allocations found.</p>';
    } catch (error) {
      allocationsHtml = `<p class="error">Error loading allocations: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>My Allocations</h1>
        
        <div class="card">
          ${allocationsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);
  }
}

Router.registerPage('my-allocations', MyAllocationsPage);
