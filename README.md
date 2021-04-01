# map-side-bar 

[![npm version](https://badge.fury.io/js/%40abi-software%2Fmap-side-bar.svg)](https://badge.fury.io/js/%40abi-software%2Fmap-side-bar)

This project aims to provide a sidebar for searching capability for
SPARC portal.

## Project installation
```
npm i @abi-software/map-side-bar
```


## Project setup
```
npm install
npm run serve
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Include the package in your script.
```javascript
import '@abi-software/map-side-bar'
import '@abi-software/map-side-bar/dist/map-side-bar.css'
```

#Template
The code should looks like this

```html
<SideBar :apiLocation="apiLocation" 
         :visible="sideBarVisibility"
         @actionClick="actionClick">
</SideBar>
```

apiLocation is the api endpoint.

actionClick event is called when an action button has benn clicked on.
