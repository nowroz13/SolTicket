import { Idl } from '@project-serum/anchor';

export const IDL: Idl = {
  "version": "0.1.0",
  "name": "event_ticketing",
  "instructions": [
    {
      "name": "initializeEvent",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenPool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "date",
          "type": "i64"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "totalTickets",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "Metadata"
          }
        }
      ]
    },
    {
      "name": "transferEventNFT",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMintedCount",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newCount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintTicket",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimTicket",
      "accounts": [
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "totalTickets",
            "type": "u64"
          },
          {
            "name": "mintedTickets",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "Ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "claimDate",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Metadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "image",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "attributes",
            "type": {
              "vec": {
                "defined": "Attribute"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Attribute",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "traitType",
            "type": "string"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EventInactive",
      "msg": "The event is not active."
    },
    {
      "code": 6001,
      "name": "TicketsSoldOut",
      "msg": "All tickets have been sold."
    },
    {
      "code": 6002,
      "name": "AlreadyClaimed",
      "msg": "Ticket has already been claimed."
    },
    {
      "code": 6003,
      "name": "InvalidClaimer",
      "msg": "Invalid claimer for this ticket."
    }
  ]
}; 