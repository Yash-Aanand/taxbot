<a href="https://chathn.vercel.app">
  <img alt="Chat with Taxbot." src="/app/opengraph-image.png">
  <h1 align="center">Taxbot</h1>
</a>

<p align="center">
  Chat with Taxbot. Built with OpenAI Functions and Vercel AI SDK. 
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#setting-up-locally"><strong>Setting Up Locally</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#notes"><strong>Notes</strong></a> ·
</p>
<br/>

## Introduction

This is an AI chatbot that uses OpenAI Functions and Vercel AI SDK to help answer your tax-related queries.


https://github.com/user-attachments/assets/79e9969f-60ef-455b-838b-2888e8ed1c35


## Setting Up Locally

To set up Taxbot locally, follow these steps:

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

- open (http://localhost:3000/)

## Tech Stack

ChatH is built on the following stack:

- [Next.js](https://nextjs.org/) – framework
- [TanStack](https://tanstack.com/) - library
- [OpenAI Functions](https://platform.openai.com/docs/guides/gpt/function-calling) - AI completions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) – AI streaming library
- [Vercel](https://vercel.com) – deployments
- [TailwindCSS](https://tailwindcss.com/) – styles

## Notes

Goals Met:

- Working Application fulfilling requirements
- Tech Stack Maintained
- Task 1 Completed
- Task 2 Completed

Assumptions Made:

- Regular gpt 3.5-turbo compatible openai api keys used

```
Text responses are preffered over multimodal responses, which can be adjusted accordingly
```

- No upper limit for prompts/hour (although spam prompting has been disabled)

```
A buffer does already exist, but manually coding a breakpoint could completey avoid any complications
```

Placeholders/Simulations:

- File processing (in case no premium api keys available)

```
This can be expanded upon by fully utlizing the Multi-Modal AI SDK tools, alongside an openai API key compatible with gpt 4o
```

- Suggestion Prompts

```
Could be expanded by hidden querrying the bot to suggest prompts based on the message history for more useful prompts
```

## Author

- Yash Aanand - [LinkedIn](https://www.linkedin.com/in/yash-aanand-35192b273/) | [Website](https://yashaanand.com/)
