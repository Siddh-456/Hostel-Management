// Complaints Board Page
class ComplaintsBoardPage extends Page {
  async render(container) {
    let complaintsHtml = '<p>Loading...</p>';

    try {
      const complaints = await API.getComplaints();

      complaintsHtml = complaints.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map(c => `
              <tr>
                <td>#${c.id}</td>
                <td>${c.category}</td>
                <td>${c.description?.substring(0, 50)}...</td>
                <td><span class="badge badge-${c.status === 'resolved' || c.status === 'closed' ? 'success' : c.status === 'in_progress' ? 'warning' : 'danger'}">${c.status}</span></td>
                <td>${c.assigned_to || '-'}</td>
                <td>
                  <select class="status-select" data-id="${c.id}">
                    <option value="open" ${c.status === 'open' ? 'selected' : ''}>Open</option>
                    <option value="in_progress" ${c.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="closed" ${c.status === 'closed' ? 'selected' : ''}>Closed</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No complaints.</p>';
    } catch (error) {
      complaintsHtml = `<p class="error">Error: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Complaints Board</h1>
        
        <div class="card">
          ${complaintsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    container.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        try {
          await API.updateComplaintStatus(select.dataset.id, e.target.value);
          this.showSuccess('Status updated!');
          Router.navigate('complaints-board');
        } catch (error) {
          this.showError('Update failed: ' + error.message);
        }
      });
    });
  }
}

Router.registerPage('complaints-board', ComplaintsBoardPage);
