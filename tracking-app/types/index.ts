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
  experienceEvent?: boolean;
  eventData?: {
    click?: {
      clickAction?: string;
      clickLocation?: string;
      clickText?: string;
      triggerEvent?: boolean;
    };
    triggerEvent?: boolean;
  };
  // Add Sephora's special event structure
  conversio?: {
    event_category?: string;
    event_action?: string;
    event_label?: string;
    event_segment?: string;
    experienceCategory?: string;
    experienceAction?: string;
    experienceLabel?: string;
    experience_segment?: string;
    experience_category?: string;
    experience_action?: string;
    experience_label?: string;
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
