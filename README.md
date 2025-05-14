# Penguin Patrol Alert System

## Project Overview
A web application for managing and monitoring penguin patrol alerts. This project was developed as part of the EEE4113F course at the University of Cape Town.

## Team Members
- Aaron Isserow, Emanuele Vichi and Ethan Faraday

## Project Goals
- Create a user-friendly interface for monitoring penguin patrols
- Implement real-time alert system for penguin sightings
- Provide data visualization for patrol statistics
- Enable efficient communication between patrol members

## Features
- Real-time alert system
- Interactive map interface
- Patrol scheduling and management
- Data visualization and reporting
- User authentication and authorization
- Mobile-responsive design

## Getting Started

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd penguin-patrol-alert-system

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technologies Used
- Frontend:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn-ui
- Backend:
  - Supabase
  - React Query
- Additional Tools:
  - OpenAI API for natural language processing
  - Recharts for data visualization

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

## Future Improvements
- [ ] Add offline support
- [ ] Implement push notifications
- [ ] Add more data visualization options
- [ ] Improve mobile responsiveness
- [ ] Add unit tests

## Acknowledgments
- Thanks to the UCT Computer Science Department
- Special thanks to our course instructor
- Inspired by real-world penguin conservation efforts

## License
This project is created for educational purposes as part of the EEE4113F course at the University of Cape Town.

## Contact
For any questions or concerns, please contact:
- Aaron Isserow (aaron.isserow@gmail.com)

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

You can get these values from:
- Supabase: Project Settings > API
- OpenAI: API Keys section of your OpenAI account
