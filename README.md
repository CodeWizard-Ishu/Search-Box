# Mentorship Platform API

This repository contains the backend API for a mentorship platform that connects mentees with mentors across various domains. The API is built with Express.js, TypeScript, and Prisma ORM with PostgreSQL database.

## 🚀 Features

- Mentor search functionality with keyword extraction
- Fallback search mechanism when no results are found
- Integration with LLM for enhanced search capabilities
- Data model for mentors, mentees, bookings, services, and more
- Database acceleration with Prisma Accelerate

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Hugging Face API key (for LLM integration)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/searchbox.git
   cd searchbox
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=4000
   DATABASE_URL="postgresql://username:password@localhost:5432/mentorship?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/mentorship?schema=public"
   HUGGING_FACE_API_KEY="your-hugging-face-api-key"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

Or with Nodemon for automatic reloading:

```bash
npx nodemon
```

### Production Mode

```bash
npm run build
npm start
```

## 🔄 API Endpoints

### Health Check
```
GET /
```
Returns the server status and health information.

**Response:**
```json
{
  "message": "Welcome to the server!",
  "health": "100%",
  "state": "running"
}
```

### Search Mentors
```
POST /api/search
```

Search for mentors based on a query string. The API will extract keywords from the query and find relevant mentors.

**Request Body:**
```json
{
  "query": "experienced javascript developer for career guidance"
}
```

**Response:**
```json
{
  "mentors": [
    {
      "id": 1,
      "userId": 1,
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://example.com/profile.jpg",
      "bio": "Experienced JavaScript developer with 10 years in the industry."
    }
  ],
  "keywords": ["experienced", "javascript", "developer", "career", "guidance"]
}
```

If no mentors are found with the extracted keywords, the API will use fallback keywords to find mentors:

**Response with Fallback:**
```json
{
  "mentors": [
    {
      "id": 2,
      "userId": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "profilePicture": "https://example.com/jane.jpg",
      "bio": "Career coach specializing in tech industry."
    }
  ],
  "keywords": ["programming", "software", "development", "coding", "tech"],
  "usedFallback": true
}
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following key models:

- **User**: Base user model for both mentors and mentees
- **MentorProfile**: Profile information for mentors
- **MenteeProfile**: Profile information for mentees
- **Service**: Services offered by mentors
- **Booking**: Session bookings between mentors and mentees
- **Domain**: Expertise domains of mentors
- **Rating**: Ratings given by mentees to mentors
- **Availability**: Mentor availability schedule

For the complete schema, please check the `prisma/schema.prisma` file.

## 🧠 Search Functionality

The search functionality works in the following way:

1. Extract keywords from the user's search query
2. If fewer than 2 keywords are found, enhance the query using the LLM
3. Search for mentors using the extracted keywords
4. If no mentors are found, use fallback keywords based on the domain of the query
5. Return mentors sorted by rating (highest first)

## 🛡️ CORS Configuration

The API is configured to accept requests only from `https://mentg.in`. Set-up your own frontend url in the cors orgin option (eg. `http://localhost:5173`).

## 📦 Dependencies

- **Express**: Web framework
- **Prisma**: ORM for database interactions
- **TypeScript**: Type-safe JavaScript
- **Cors**: Cross-Origin Resource Sharing
- **Dotenv**: Environment variable management

## 🧪 Testing

```bash
npm test
```
Note: Tests need to be implemented.

## 👨‍💻 Development

The project uses TypeScript for type safety. The source code is in the `src` directory, and it gets compiled to JavaScript in the `dist` directory.

To build the project:

```bash
npm run build
```

## 📄 License

ISC

---

Made with ❤️ for connecting mentors and mentees worldwide.
