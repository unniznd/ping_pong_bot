# Ping Pong Bot
This is a simple ping pong bot for a smart contract. For every ping it receives from the contract it will send a pong back with the transaction hash of the ping. 

## Requirements
- Node.js
- npm/yarn
- TypeScript

## Installation
1. Clone the repository
```bash
git clone https://github.com/unniznd/ping_pong_bot.git
```
2. Navigate to the project directory
```bash
cd ping_pong_bot
```
3. Install dependencies
```bash
npm install
```
or
```bash
yarn install
```
4. Create a `.env` file in the root directory and add your environment variables
```bash
PRIVATE_KEY=
PROVIDER_URL=
ALCHEMY_URL=
```
5. Compile the TypeScript code
```bash
npm run build
```
or
```bash
yarn build
```
6. Add the configuration json in the `config` folder inside dist.  
```bash
mkdir dist/config && cd dist/config && touch config.json
```
7. Add the configuration json in the `config` folder inside dist.  
```json
{
    "startingBlock": "Add your start block here",
    "lastProcessedBlock": "Add your last processed block here",
    "contractAddress": "0xYourContractAddress", 
}
```

8. Run the bot
```bash
npm start
```
or
```bash
yarn start
```
