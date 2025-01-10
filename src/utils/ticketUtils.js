export function generateTicketCode(eventCode, index = "") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";

  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${eventCode}-${randomPart}${index ? `-${index}` : ""}`;
}

export function validateEventCode(code) {
  return /^[A-Z]{4}$/.test(code);
}
