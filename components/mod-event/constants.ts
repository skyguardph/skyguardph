export const MOD_EVENTS = {
  ACKNOWLEDGE: 'com.atproto.admin.defs#modEventAcknowledge',
  ESCALATE: 'com.atproto.admin.defs#modEventEscalate',
  LABEL: 'com.atproto.admin.defs#modEventLabel',
  MUTE: 'com.atproto.admin.defs#modEventMute',
  TAKEDOWN: 'com.atproto.admin.defs#modEventTakedown',
  COMMENT: 'com.atproto.admin.defs#modEventComment',
  REVERSE_TAKEDOWN: 'com.atproto.admin.defs#modEventReverseTakedown',
  UNMUTE: 'com.atproto.admin.defs#modEventUnmute',
  REPORT: 'com.atproto.admin.defs#modEventReport',
  EMAIL: 'com.atproto.admin.defs#modEventEmail',
} as const

export const MOD_EVENT_TITLES = {
  [MOD_EVENTS.ACKNOWLEDGE]: 'Reports Acknowledged',
  [MOD_EVENTS.ESCALATE]: 'Escalation',
  [MOD_EVENTS.LABEL]: 'Label Action',
  [MOD_EVENTS.MUTE]: 'Mute Action',
  [MOD_EVENTS.TAKEDOWN]: 'Takedown Action',
  [MOD_EVENTS.COMMENT]: 'Comment',
  [MOD_EVENTS.REVERSE_TAKEDOWN]: 'Reverse Takedown Action',
  [MOD_EVENTS.UNMUTE]: 'Unmute Action',
  [MOD_EVENTS.REPORT]: 'Report',
  [MOD_EVENTS.EMAIL]: 'Email Sent',
}
