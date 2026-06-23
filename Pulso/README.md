# Pulso - Educational Web Application

Pulso is an educational web application designed to provide real-time feedback on fraction exercises using Supabase and OpenAI. This application aims to enhance personalized learning experiences for both teachers and students.

## Features

- **Real-time Feedback**: Students receive immediate feedback on their answers to fraction exercises.
- **Teacher Dashboard**: Teachers can monitor student progress and diagnose common errors.
- **Session Management**: Unique sessions can be created for different classes or groups of students.
- **Demo Mode**: Simulates student interactions for demonstration purposes.

## Technologies Used

- **Next.js**: A React framework for building server-rendered applications.
- **Supabase**: An open-source Firebase alternative that provides a backend for the application.
- **OpenAI**: Utilized for generating feedback and diagnosing student responses.

## Project Structure

```
Pulso
├── app
│   ├── api
│   │   └── feedback
│   │       └── route.ts
│   ├── exercises
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── FeedbackDisplay.tsx
│   └── FractionExercise.tsx
├── lib
│   ├── openai.ts
│   └── supabase.ts
├── types
│   └── index.ts
├── .env.local
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/pulso.git
   cd pulso
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase and OpenAI credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.