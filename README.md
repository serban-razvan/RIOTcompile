# RIOTcompile

```
git clone https://github.com/serban-razvan/RIOTcompile.git
cd RIOTcompile
npm install
mkdir results
mkdir files
sudo add-apt-repository ppa:team-gcc-arm-embedded/ppa -y
sudo apt-get update
sudo apt-get -y install gcc-arm-embedded
git clone https://github.com/jasonatran/RIOT.git
cd RIOT
git checkout wyliodrin_example
cd ..
node server.js
```
