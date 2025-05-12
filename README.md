# SolTicket - Event Ticketing with ZK Compression

A decentralized event ticketing platform built on Solana that leverages ZK compression technology for efficient ticket minting and distribution.

## Features

- **Event Creation**: Create events with customizable details and ticket quantities
- **ZK Compressed Tickets**: Mint tickets as compressed tokens using Light Protocol
- **QR Code Generation**: Generate Solana Pay QR codes for easy ticket distribution and claiming
- **Wallet Integration**: Seamless integration with Phantom and Solflare wallets
- **Devnet Support**: Built and tested on Solana devnet

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Solana, Light Protocol
- **Wallet**: Solana Wallet Adapter
- **UI Components**: Lucide React Icons
- **QR Code**: Solana Pay

## Prerequisites

- Node.js 16+ and npm
- Solana CLI tools
- Phantom or Solflare wallet with Devnet SOL

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nowroz13/SolTicket.git
   cd SolTicket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SOLANA_NETWORK=devnet
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Smart Contract

The Solana program for this project is deployed at:
```
4QrPtaAoz9ZBudP8M9ZVHy8ixN8AdGs9eYVh7MD77NUX
```
# IMP 
Make sure to carefully check the UMI payer (you can find it in the console). The project will only run successfully after completing this step.

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Page components
├── store/             # State management
├── types/             # TypeScript interfaces
└── utils/             # Utility functions
└── idl/               # Event Ticketing
 ```

## Key Components

### Event Management
- Create events with name, date, location,ticket quantity and Image
- View all created events in the dashboard
- Generate QR codes for ticket distribution

### Ticket System
- Mint compressed tokens as tickets using Light Protocol , ZK Compression
- QR code-based ticket claiming system
- Wallet verification for ticket ownership

### User Interface
- Responsive design with Tailwind CSS
- Dark theme with purple/blue gradient accents
- Loading states and error handling
- Toast notifications for user feedback

## Usage

1. **Connect Wallet**
   - Click "Select Wallet" in the navigation
   - Choose Phantom or Solflare
   - Connect to Devnet

2. **Create Event**
   - Navigate to Dashboard
   - Click "Create New Event"
   - Fill in event details
   - Set ticket quantity

3. **Mint Tickets**
   - Go to event details
   - Click "Mint Tickets"
   - Share generated QR codes

4. **Claim Tickets**
   - Scan Solana Pay QR code
   - Pay the amount 
   - Claim compressed token ticket

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
