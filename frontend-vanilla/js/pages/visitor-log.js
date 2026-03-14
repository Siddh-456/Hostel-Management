// Visitor Log Page
class VisitorLogPage extends Page {
  async render(container) {
    const html = `
      <div class="form-container">
        <h1>Log Visitor</h1>
        
        <form id="visitor-log-form" class="form">
          <div class="form-group">
            <label for="visitor_name">Visitor Name *</label>
            <input type="text" id="visitor_name" name="visitor_name" required placeholder="Full name of visitor">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="visitor_phone">Visitor Phone</label>
              <input type="tel" id="visitor_phone" name="visitor_phone" placeholder="+91 XXXXXXXXXX">
            </div>
            <div class="form-group">
              <label for="purpose">Purpose of Visit</label>
              <input type="text" id="purpose" name="purpose" placeholder="Reason for visit">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="check_in">Check-in *</label>
              <input type="datetime-local" id="check_in" name="check_in" required>
            </div>
            <div class="form-group">
              <label for="check_out">Check-out</label>
              <input type="datetime-local" id="check_out" name="check_out">
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">Log Visitor</button>
        </form>
      </div>
    `;

    Layout.render(container, html);

    const form = container.querySelector('#visitor-log-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = Auth.getUser();

      try {
        await API.createVisitorLog({
          host_student_id: user.id,
          visitor_name: form.visitor_name.value,
          visitor_phone: form.visitor_phone.value || null,
          purpose: form.purpose.value || null,
          check_in: form.check_in.value,
          check_out: form.check_out.value || null
        });
        this.showSuccess('Visitor logged successfully!');
        form.reset();
      } catch (error) {
        this.showError('Failed to log visitor: ' + error.message);
      }
    });
  }
}

Router.registerPage('visitor-log', VisitorLogPage);
