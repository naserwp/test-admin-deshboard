export function conversationRequestedHumanTemplate(conversationId: string, preview: string) {
  const base = process.env.NEXTAUTH_URL || "";
  const adminLink = `${base}/admin/support/conversations/${conversationId}`;
  const adminQueue = `${base}/admin/support/waiting`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>Conversation needs human attention</h3>
      <p><strong>Conversation ID:</strong> ${conversationId}</p>
      <p><strong>Preview:</strong> ${preview}</p>
      <p><a href="${adminLink}">Open conversation</a></p>
      <p><a href="${adminQueue}">View waiting queue</a></p>
    </div>
  `;
}

export function ticketCreatedTemplate(ticketId: string, subject: string, preview: string) {
  const base = process.env.NEXTAUTH_URL || "";
  const adminLink = `${base}/admin/support/tickets/${ticketId}`;
  const userLink = `${base}/dashboard/support/tickets/${ticketId}`;
  const waitingLink = `${base}/dashboard/support/waiting`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>New support ticket</h3>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Preview:</strong> ${preview}</p>
      <p><a href="${adminLink}">Open ticket (admin)</a></p>
      <p><a href="${userLink}">Open ticket (user)</a></p>
      <p><a href="${waitingLink}">Waiting items</a></p>
    </div>
  `;
}

export function adminReplyTemplate(conversationId: string, preview: string) {
  const base = process.env.NEXTAUTH_URL || "";
  const adminLink = `${base}/admin/support/conversations/${conversationId}`;
  const userLink = `${base}/dashboard/support/chats/${conversationId}`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>Admin replied</h3>
      <p><strong>Conversation ID:</strong> ${conversationId}</p>
      <p><strong>Preview:</strong> ${preview}</p>
      <p><a href="${adminLink}">Open conversation (admin)</a></p>
      <p><a href="${userLink}">View as user</a></p>
    </div>
  `;
}

export function ticketReplyTemplate(ticketId: string, preview: string) {
  const base = process.env.NEXTAUTH_URL || "";
  const adminLink = `${base}/admin/support/tickets/${ticketId}`;
  const userLink = `${base}/dashboard/support/tickets/${ticketId}`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>Ticket reply</h3>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Preview:</strong> ${preview}</p>
      <p><a href="${adminLink}">Open ticket (admin)</a></p>
      <p><a href="${userLink}">Open ticket (user)</a></p>
    </div>
  `;
}

export function ticketStatusChangedTemplate(ticketId: string, status: string) {
  const base = process.env.NEXTAUTH_URL || "";
  const adminLink = `${base}/admin/support/tickets/${ticketId}`;
  const userLink = `${base}/dashboard/support/tickets/${ticketId}`;
  const waitingLink = `${base}/dashboard/support/waiting`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>Ticket status updated</h3>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><a href="${adminLink}">Open ticket (admin)</a></p>
      <p><a href="${userLink}">Open ticket (user)</a></p>
      <p><a href="${waitingLink}">Waiting items</a></p>
    </div>
  `;
}

export function guestLeadTemplate(params: {
  name: string;
  email: string;
  phone: string;
  conversationId: string;
  timestamp: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const adminLink = `${baseUrl}/admin/support/conversations`;
  return `
    <div style="font-family: Arial, sans-serif;">
      <h3>New Support Chat Lead</h3>
      <p><strong>Name:</strong> ${params.name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Phone:</strong> ${params.phone}</p>
      <p><strong>Conversation ID:</strong> ${params.conversationId}</p>
      <p><strong>Timestamp:</strong> ${params.timestamp}</p>
      <p><a href="${adminLink}">Open admin support panel</a></p>
    </div>
  `;
}
