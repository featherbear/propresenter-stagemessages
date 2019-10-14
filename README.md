# ProPresenter 6 - Stage Display Messages Client

A tool to send stage display messages to ProPresenter 6.  

Click [here](http://pp6sdm.apps.navhaxs.au.eu.org/) to access the interface

# Instructions

## Running the Server

Set up a HTTP server.  
A HTTP**S** server will **not** work due to insecure websockets being denied access on a secure site

## Enable Remote Operation

* Open Preferences > Network
* Tick "Enable ProPresenter Remote"
* Tick "Controller"
* Type in a password

## Configure the Client

* Press the `Settings` button (top right of screen)
* Modify the `host` address as needed
* Modify the `port` number as needed
* Modify the `pass` field as needed
* Press save

# Legal

* Project based off [jeffmikels/ProPresenter-API](https://github.com/jeffmikels/ProPresenter-API/)
* ProPresenter by Renewed Vision LLC
