// Audit & PII Page
class AuditPIIPage extends Page {
  async render(container) {
    let auditHtml = '<p>Loading...</p>';
    let piiHtml = '<p>Loading...</p>';

    try {
      const [auditLog, piiLog] = await Promise.all([
        API.getAuditLog(),
        API.getPIIDeletionLog()
      ]);

      auditHtml = auditLog.length ? `
        <div class="audit-log">
          ${auditLog.slice(-20).reverse().map(log => `
            <div class="log-entry">
              <strong>${log.action}</strong>
              <p class="text-muted">User #${log.user_id} • ${new Date(log.created_at).toLocaleString()}</p>
              <p>${JSON.stringify(log.details || {})}</p>
            </div>
          `).join('')}
        </div>
      ` : '<p>No audit logs.</p>';

      piiHtml = piiLog.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Record ID</th>
              <th>Deleted</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${piiLog.map(log => `
              <tr>
                <td>${log.table_name}</td>
                <td>${log.record_id}</td>
                <td>${new Date(log.deleted_at).toLocaleString()}</td>
                <td>${log.reason || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No PII deletions recorded.</p>';
    } catch (error) {
      auditHtml = piiHtml = `<p class="error">Error: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Audit & PII Management</h1>
        
        <div class="card">
          <h3>Audit Log (Last 20 entries)</h3>
          ${auditHtml}
        </div>
        
        <div class="card">
          <h3>PII Deletion Log</h3>
          <button class="btn btn-danger" id="trigger-pii-delete">Trigger PII Cleanup</button>
          ${piiHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);

    document.getElementById('trigger-pii-delete')?.addEventListener('click', () => {
      this.createModal('Trigger PII Deletion', `
        <p>This will permanently delete expired ID proof files and associated data.</p>
        <div class="form-group">
          <label for="days">Delete files older than (days):</label>
          <input type="number" id="days" value="90" min="1">
        </div>
      `, [
        {
          label: 'Proceed',
          type: 'danger',
          action: 'delete',
          onClick: async () => {
            const days = document.querySelector('#days').value;
            try {
              await API.triggerPIIDeletion({ retention_days: parseInt(days) });
              this.showSuccess('PII deletion triggered!');
              Router.navigate('audit-pii');
            } catch (error) {
              this.showError('Failed: ' + error.message);
            }
          }
        },
        { label: 'Cancel', type: 'default', action: 'cancel' }
      ]);
    });
  }
}

Router.registerPage('audit-pii', AuditPIIPage);
