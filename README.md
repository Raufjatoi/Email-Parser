# Email Parser

A modern web application for parsing and extracting key information from email content.

## Features

- Upload email files (.eml, .txt) or paste email content
- Extract sender, recipient, subject, date, and other key information
- Clean and intuitive user interface
- Built-in sample emails (standard email or Facebook verifications ones)
- Detects email type (Newsletter, Transaction, Account Verification, etc.)
- Extracts URLs, verification codes, and other actionable items
- Responsive design for all devices

## Demo

The application comes with built-in sample emails for demonstration:
- **Standard Email**: A business email with headers, recipient details, and task information
- **Facebook Email**: A notification email with verification code

Simply click on the sample buttons to load these examples and see how the parser extracts different types of information from various email formats.

## Technologies Used

- React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Raufjatoi/Email-Parser.git
   cd Email-Parser
   ```

2. Install dependencies
   ```bash
   npm i
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

1. Upload an email file or paste email content in the text area
2. Alternatively, click "Standard Email" or "Facebook Email" to load sample content
3. Click "Parse Email" to extract information
4. View the parsed results in a structured format

## Author
Abdul Rauf Jatoi - [Portfolio](https://rauf-psi.vercel.app/)
