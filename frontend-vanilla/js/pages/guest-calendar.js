// Guest Calendar Page
class GuestCalendarPage extends Page {
  async render(container) {
    let calendarHtml = '<p>Loading calendar...</p>';

    try {
      const requests = await API.getGuestRequests({ status: 'approved' });
      const approvedBookings = requests.filter(r => r.assigned_guest_room_id);

      // Simple calendar representation
      const events = approvedBookings.map(r => ({
        id: r.id,
        title: `${r.guest_name} - Room ${r.assigned_guest_room_id}`,
        start: new Date(r.check_in),
        end: new Date(r.check_out),
        roomId: r.assigned_guest_room_id
      }));

      // Group by room and date
      const roomBookings = {};
      events.forEach(e => {
        if (!roomBookings[e.roomId]) roomBookings[e.roomId] = [];
        roomBookings[e.roomId].push(e);
      });

      calendarHtml = `
        <div class="calendar-view">
          ${Object.entries(roomBookings).map(([roomId, bookings]) => `
            <div class="room-schedule">
              <h4>Room ${roomId}</h4>
              <ul class="booking-list">
                ${bookings.map(b => `
                  <li>
                    <strong>${b.title}</strong>
                    <br>
                    ${b.start.toLocaleString()} → ${b.end.toLocaleString()}
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      calendarHtml = `<p class="error">Error loading calendar: ${error.message}</p>`;
    }

    const html = `
      <div class="page-container">
        <h1>Guest Room Calendar</h1>
        
        <div class="card">
          ${calendarHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);
  }
}

Router.registerPage('guest-calendar', GuestCalendarPage);
