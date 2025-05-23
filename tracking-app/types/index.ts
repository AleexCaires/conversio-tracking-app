export interface Client {
  name: string;
  code: string;
}

export interface Event {
  eventAction?: string;
  eventCategory?: string;
  eventLabel?: string;
  eventSegment?: string;
  triggerEvent?: boolean;
  codeCopied?: boolean;
  event?: string;
  eventData?: {
    click?: {
      clickAction?: string;
      clickLocation?: string;
      clickText?: string;
      triggerEvent?: boolean;
    };
    triggerEvent?: boolean;
  };
}

export interface EventGroup {
  label: string;
  events: Event[];
}

export interface ExperienceData {
  _id: string;
  client: string;
  experienceName: string;
  dateCreated: string;
  events: EventGroup[];
  name?: string;
  id?: string;
}

export interface ModalContent {
  _id: string;
  client: string;
  experienceName: string;
  dateCreated: string;
  events: EventGroup[];
}

export interface EditData {
  id: string;
  client: string;
  name: string;
  events: EventGroup[];
}

export interface EventDetailsRef {
  reset: () => void;
  triggerDataGeneration: () => void;
}
