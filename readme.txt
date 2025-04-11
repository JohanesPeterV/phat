# Phat Discord Bot

## Project Overview

Phat is a versatile Discord bot designed to enhance your server experience with a variety of features, including music playback, random content generation, and translation services. It is built using Node.js and the Discord.js library, making it a robust and flexible solution for Discord communities.

## Features

- **Music Playback**: Play, skip, pause, and queue music from YouTube.
- **Random Content**: Generate random dog images, memes, and activity suggestions.
- **Translation Services**: Translate text between Indonesian and English.
- **Speech Generation**: Convert text to speech for a unique audio experience.
- **Covid Information**: Retrieve Covid-19 data for specified countries.

## Setup Guide

1. **Prerequisites**:
   - Ensure you have Node.js installed on your system.

2. **Configuration**:
   - Rename `dummyconfig.json` to `config.json`.
   - Update the `token` field in `config.json` with your Discord bot's token.
   - Optionally, configure other settings in `config.json` to customize the bot's behavior.

3. **Install Dependencies**:
   - Run `npm install` to install the necessary dependencies as specified in `package.json`.

4. **Google Drive Features**:
   - To enable Google Drive features, refer to the [node-google-drive package documentation](https://www.npmjs.com/package/node-google-drive).
   - Update the folder path in your configuration to match your Google Drive folder ID.

## Usage

- Use the prefix `p` followed by a command to interact with the bot. For example, `phelp` to list all available commands.
- Refer to the `commandDescriptions` in `config.json` for a detailed list of commands and their descriptions.

## Dependencies

- **Discord.js**: For Discord API interactions.
- **Axios**: For making HTTP requests.
- **FFmpeg**: For audio processing.
- **YouTube-dl**: For downloading YouTube content.
- **Google Translate API**: For translation services.
