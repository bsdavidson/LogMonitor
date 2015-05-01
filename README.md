# logreader

![screenshot](https://raw.githubusercontent.com/bsdavidson/logreader/master/screenshots/Screenshot%201.png)

For monitoring log files that are typically symlinked into the logs directory.

This project was built using Ruby, Backbone, and JS.

It is still a work in progress and as such, it has bugs.

It should work fine for most log files, though, since I don't have a limit set yet, it will happliy try and load VERY large log
files until it crashses.

You can use the "Tail Only" checkbox to prevent the app from backloading the whole log file.


# What does this do?

By adding symlinked files into the logs directory (these can be from the local system or remotely mounted filesystems),
it will attempt to load the file (in segments to prevent giant queries) and give you a live readout. This log can be filtered (much like using grep) using simple exact phrasing.

New entires appear green and fade to white.


#HOW TO INSTALL

- Clone the repo into a local directory
    git clone https://github.com/bsdavidson/logreader.git

- Install dependencies
    bundle install
    npm install

- run
    rake watch

