📱 Feedin
Feedin is a mobile application that makes the feedback process between coworkers or team members simpler, more fun, and rewarding.

🚀 Installation
Prerequisites

Node.js (version 18 or higher)

npm or yarn

Expo CLI (npm install -g expo-cli)

A mobile device with the Expo Go app installed (available on the App Store or Google Play)

Installation Steps

Clone the repository:

Bash
git clone https://github.com/your-username/feedin.git
cd feedin
Install dependencies:

Bash
npm install
# or
yarn install
Configure environment variables:

Create a .env file in the project root

Add your Firebase and OpenAI credentials:

FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_api_key
Start the application:

Bash
npm start
# or
yarn start
Scan the QR Code that appears in the terminal with:

iOS: iPhone Camera

Android: Expo Go App

Brainstorming & Idea

We began with a group brainstorming process, where we gathered ideas, solutions, and possible features. During this creative phase, we mapped the following pain points:

Lack of engagement in formal feedback tools;

Difficulty for employees to give and receive feedback naturally;

Little appreciation for daily achievements and tasks;

Absence of constant incentives and recognition among colleagues.

Based on this, the idea for Feedin was born: a modern, gamified mobile app that encourages spontaneous feedback between colleagues through an internal social network, participation rewards, and an AI that assists in drafting more casual and human messages.

(Photo of the board used to map the app flow)

📲 How It Works
👥 Network Access

The company (admin) profile is responsible for approving requests from employees who wish to join the company network.

After approval, employees can interact with colleagues through posts and feedback.

🧵 Post Types

Direct Feedback: The user writes public feedback for a specific colleague.

Task/Achievement Post: The user shares something they have accomplished to receive constructive feedback.

🎁 Rewards and Points

Users accumulate points by:

Creating posts (feedbacks or achievements)

Commenting with feedback on colleagues' posts

Points can be exchanged for rewards provided by the company in the app's internal store.

🤖 AI Feedback Support

When writing feedback, users can rely on Artificial Intelligence to help make the text lighter, friendlier, and more effective.

It is used to provide this assistance in a completely casual and helpful manner.

⚙️ Technologies Used
Feedin is developed with a modern stack focused on simplicity, scalability, and a great end-user experience.

🧠 Mobile Frontend

React Native with Expo
Native mobile interface with fluid performance and experience.

TypeScript (TSX)
Static typing for greater security, readability, and code maintenance.

StyleSheet API / Styled Components
Flexible and componentized styling.

🔥 Backend and Database

Firebase
Complete platform used for:

User Authentication

Firestore as a real-time database

Storage for file and image uploads

Cloud Functions as a backend (API) for business logic and integrations

🤖 Artificial Intelligence

OpenAI API
Used to assist users in creating more casual, clear, and empathetic feedback.
The AI analyzes the content and suggests improvements while maintaining a human and constructive tone.
