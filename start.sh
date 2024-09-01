# just in case
source ~/.bashrc

# Load NVM
export NVM_DIR="$HOME/.nvm"
# This loads nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the desired Node.js version
nvm use 18

# any local updates? no problem
git stash

# pull latest files if bot didnt already
git pull

# install packages in case any are outdated
npm i

# Start your bot
node .