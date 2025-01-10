type TicketType = {
  name: string;
  price: number;
  quantity: number;
  description?: string;
};

type Event = {
  id?: string;
  creatorId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  eventCode: string;
  images?: string[];
  ticketTypes: TicketType[];
  createdAt: Date;
  updatedAt: Date;
};

export type { Event, TicketType };
