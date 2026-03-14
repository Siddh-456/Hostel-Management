// Guest Request Form Page
class GuestRequestPage extends Page {
  async render(container) {
    const html = `
      <div class="form-container">
        <h1>Request Guest Visit</h1>
        
        <form id="guest-request-form" class="form">
          <div class="form-group">
            <label for="guest_name">Guest Name *</label>
            <input type="text" id="guest_name" name="guest_name" required placeholder="Full name of guest">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="guest_phone">Guest Phone</label>
              <input type="tel" id="guest_phone" name="guest_phone" placeholder="+91 XXXXXXXXXX">
            </div>
            <div class="form-group">
              <label for="guest_email">Guest Email</label>
              <input type="email" id="guest_email" name="guest_email" placeholder="guest@email.com">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="check_in">Check-in *</label>
              <input type="datetime-local" id="check_in" name="check_in" required>
            </div>
            <div class="form-group">
              <label for="check_out">Check-out *</label>
              <input type="datetime-local" id="check_out" name="check_out" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="guest_relation">Guest Relation</label>
            <select id="guest_relation" name="guest_relation">
              <option value="">Select relation</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="id_proof">ID Proof (JPEG/PNG/PDF, max 5MB)</label>
            <input type="file" id="id_proof" name="id_proof" accept=".jpg,.jpeg,.png,.pdf">
            <small id="file-info"></small>
          </div>
          
          <div id="nights-info" class="info-box"></div>
          
          <button type="submit" class="btn btn-primary btn-block">Submit Request</button>
        </form>
      </div>
    `;

    Layout.render(container, html);

    const form = container.querySelector('#guest-request-form');
    const checkInInput = form.querySelector('#check_in');
    const checkOutInput = form.querySelector('#check_out');
    const fileInput = form.querySelector('#id_proof');
    const nightsInfo = form.querySelector('#nights-info');
    const fileInfo = form.querySelector('#file-info');

    // Calculate nights
    const calculateNights = () => {
      if (!checkInInput.value || !checkOutInput.value) return;
      
      const checkIn = new Date(checkInInput.value);
      const checkOut = new Date(checkOutInput.value);
      
      if (checkOut <= checkIn) {
        nightsInfo.innerHTML = '<p class="error">Check-out must be after check-in</p>';
        return;
      }
      
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const isOvernight = nights >= 1;
      
      if (nights > CONFIG.MAX_OVERNIGHT_NIGHTS) {
        nightsInfo.innerHTML = `<p class="error">Maximum overnight stays allowed: ${CONFIG.MAX_OVERNIGHT_NIGHTS} nights</p>`;
      } else {
        nightsInfo.innerHTML = `<p class="success">Total nights: ${nights} ${isOvernight ? '(Overnight - ID proof required)' : '(Day visit)'}</p>`;
      }
    };

    checkInInput.addEventListener('change', calculateNights);
    checkOutInput.addEventListener('change', calculateNights);

    // File validation
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        fileInfo.textContent = '';
        return;
      }

      if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        fileInfo.textContent = '❌ Only JPEG, PNG, and PDF files are allowed';
        fileInput.value = '';
        return;
      }

      if (file.size > CONFIG.FILE_SIZE_LIMIT) {
        fileInfo.textContent = '❌ File size must be less than 5MB';
        fileInput.value = '';
        return;
      }

      fileInfo.textContent = `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = Auth.getUser();
      const checkIn = new Date(form.check_in.value);
      const checkOut = new Date(form.check_out.value);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      if (nights > CONFIG.MAX_OVERNIGHT_NIGHTS) {
        this.showError(`Maximum overnight nights is ${CONFIG.MAX_OVERNIGHT_NIGHTS}`);
        return;
      }

      const isOvernight = nights >= 1;
      if (isOvernight && !fileInput.files[0]) {
        this.showError('ID proof is required for overnight stays');
        return;
      }

      const formData = new FormData();
      formData.append('host_student_id', user.id);
      formData.append('guest_name', form.guest_name.value);
      formData.append('guest_phone', form.guest_phone.value || '');
      formData.append('guest_email', form.guest_email.value || '');
      formData.append('guest_relation', form.guest_relation.value || '');
      formData.append('check_in', checkInInput.value);
      formData.append('check_out', checkOutInput.value);
      formData.append('nights_calculated', nights);

      if (fileInput.files[0]) {
        formData.append('id_proof', fileInput.files[0]);
      }

      try {
        await API.createGuestRequest(formData);
        this.showSuccess('Guest request submitted successfully!');
        form.reset();
        nightsInfo.innerHTML = '';
        fileInfo.textContent = '';
      } catch (error) {
        this.showError('Failed to submit request: ' + error.message);
      }
    });
  }
}

Router.registerPage('guest-request', GuestRequestPage);
