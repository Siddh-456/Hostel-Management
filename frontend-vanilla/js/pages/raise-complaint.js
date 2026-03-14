// Raise Complaint Page
class RaiseComplaintPage extends Page {
  async render(container) {
    const html = `
      <div class="form-container">
        <h1>Raise Complaint</h1>
        
        <form id="complaint-form" class="form">
          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" name="category" required>
              <option value="">Select category</option>
              <option value="maintenance">Maintenance</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="behavior">Behavior</option>
              <option value="noise">Noise</option>
              <option value="food">Food Quality</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="description">Description *</label>
            <textarea id="description" name="description" required placeholder="Describe your complaint in detail" rows="5"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">Submit Complaint</button>
        </form>
      </div>
    `;

    Layout.render(container, html);

    const form = container.querySelector('#complaint-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = Auth.getUser();

      try {
        await API.createComplaint({
          student_id: user.id,
          category: form.category.value,
          description: form.description.value,
          status: 'open'
        });
        this.showSuccess('Complaint submitted successfully!');
        form.reset();
      } catch (error) {
        this.showError('Failed to submit complaint: ' + error.message);
      }
    });
  }
}

Router.registerPage('raise-complaint', RaiseComplaintPage);
